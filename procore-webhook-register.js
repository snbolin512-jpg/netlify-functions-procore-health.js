/* Creates the Procore hook + triggers, per the Webhooks API guide.
   Idempotent: reuses an existing hook in our namespace and only adds triggers
   that aren't already there. Call it after connecting OAuth:
     https://<site>/.netlify/functions/procore-webhook-register

   Procore sends nothing until BOTH a hook and at least one trigger exist in
   the same scope and api_version — that pairing is the usual reason a webhook
   integration looks connected but stays silent. */
const { json } = require("./_lib/store");
const { api, cfg } = require("./_lib/procore");

// Keep this tight. Every extra trigger is more noise and more deliveries.
// Verify the exact strings against Procore's Webhook Resources list — they are
// case- and wording-sensitive, and a wrong one fails loudly here rather than
// going quiet in production.
const TRIGGERS = [
  { resource_name: "Drawing Revisions", event_type: "create" },
  { resource_name: "Drawing Revisions", event_type: "update" },
  { resource_name: "Schedule Tasks",    event_type: "create" },
  { resource_name: "Schedule Tasks",    event_type: "update" },
  { resource_name: "Schedule Tasks",    event_type: "delete" }
];

exports.handler = async function (event) {
  const c = cfg();
  const q = event.queryStringParameters || {};

  const missing = [
    ["PROCORE_COMPANY_ID", c.companyId],
    ["PROCORE_WEBHOOK_SECRET", c.webhookSecret]
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return json(400, { ok: false, error: "Missing env", missingEnv: missing });

  // Destination must be the public HTTPS URL of our receiver.
  const host = event.headers["x-forwarded-host"] || event.headers.host;
  const destination = q.destination || `https://${host}/.netlify/functions/procore-webhook`;
  if (!/^https:\/\//.test(destination)) {
    return json(400, { ok: false, error: "Destination must be HTTPS", destination });
  }

  const companyId = Number(c.companyId);
  // Scope: company-wide by default, or one project when project_id is passed.
  // Procore takes company_id OR project_id per request, never both, and a hook
  // and its triggers must share the same scope or nothing is delivered.
  const projectId = q.project_id ? Number(q.project_id) : null;
  const scope = projectId ? { project_id: projectId } : { company_id: companyId };
  const scopeQuery = projectId ? `project_id=${projectId}` : `company_id=${companyId}`;
  const log = [`Scope: ${projectId ? "project " + projectId : "company " + companyId}`];

  try {
    // 1. Find or create the hook.
    let hook = null;
    const existing = await api(`/rest/v1.0/webhooks/hooks?${scopeQuery}`);
    if (Array.isArray(existing)) hook = existing.find(h => h.namespace === c.namespace) || null;

    if (hook) {
      log.push(`Reusing hook ${hook.id} (namespace ${c.namespace}).`);
    } else {
      hook = await api("/rest/v1.0/webhooks/hooks", {
        method: "POST",
        body: {
          ...scope,
          hook: {
            api_version: "v2",
            namespace: c.namespace,          // lowercase a-z, digits, dashes
            destination_url: destination,
            destination_headers: {
              // Procore echoes this back on every delivery; the receiver
              // compares it. Never log this value.
              Authorization: `Bearer ${c.webhookSecret}`
            }
          }
        }
      });
      log.push(`Created hook ${hook.id} -> ${destination}`);
    }

    // 2. Add any triggers we don't already have.
    let current = [];
    try {
      current = await api(`/rest/v1.0/webhooks/hooks/${hook.id}/triggers?${scopeQuery}`);
    } catch (e) { log.push(`Could not list triggers: ${e.message}`); }

    const have = new Set(
      (Array.isArray(current) ? current : []).map(t => `${t.resource_name}|${t.event_type}`)
    );

    const added = [], rejected = [];
    for (const t of TRIGGERS) {
      const key = `${t.resource_name}|${t.event_type}`;
      if (have.has(key)) continue;
      try {
        await api(`/rest/v1.0/webhooks/hooks/${hook.id}/triggers`, {
          method: "POST",
          body: { ...scope, api_version: "v2", trigger: t }
        });
        added.push(key);
      } catch (e) {
        rejected.push({ trigger: key, status: e.status, detail: e.detail });
      }
    }

    return json(200, {
      ok: rejected.length === 0,
      hookId: hook.id,
      scope: projectId ? { project_id: projectId } : { company_id: companyId },
      namespace: c.namespace,
      destination,
      triggersAlreadyPresent: [...have],
      triggersAdded: added,
      triggersRejected: rejected,
      log,
      troubleshooting: rejected.length
        ? "A rejected trigger usually means the resource_name string doesn't match Procore's Webhook Resources list. Check the exact wording and retry."
        : "Check deliveries at procore-webhook-deliveries?status=failing if events don't arrive."
    });
  } catch (err) {
    return json(502, { ok: false, error: err.message, detail: err.detail || null, log });
  }
};
