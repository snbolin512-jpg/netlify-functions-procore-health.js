// procoreWebhooks.js
// -----------------------------------------------------------------------------
// Registers OhmBoy's webhook hook + triggers with Procore, and gives you the
// delivery log for troubleshooting.
//
// This is the piece that was missing: OhmBoy already *receives* webhooks, but
// Procore will never send any until a hook and at least one trigger exist for
// the company (or project) you care about. This module creates them.
//
// Everything here is idempotent — run bootstrapWebhooks() as many times as you
// like. It looks for an existing hook in our namespace before creating one, and
// checks existing triggers before adding.
//
// Requires: an access token getter from your existing OAuth layer.
// -----------------------------------------------------------------------------

const NAMESPACE = process.env.PROCORE_WEBHOOK_NAMESPACE || 'ohmboy-packets';

// sandbox.procore.com in sandbox, api.procore.com in production
const API_BASE = process.env.PROCORE_API_BASE || 'https://api.procore.com';

// Public HTTPS URL of OhmBoy's receiver route, e.g.
// https://ohmboy-api.yourdomain.com/webhooks/procore
const DESTINATION_URL = process.env.PROCORE_WEBHOOK_DESTINATION_URL;

// The shared secret your receiver already verifies. Procore echoes these
// headers back on every delivery, which is how the receiver knows it's Procore.
const SHARED_SECRET = process.env.PROCORE_WEBHOOK_SECRET;

const COMPANY_ID = process.env.PROCORE_COMPANY_ID; // from GET /api/whoami

// Resource events OhmBoy turns into packets. Keep this list tight — every extra
// trigger is more noise to filter and more deliveries to process.
// Verify exact resource_name strings against Procore's Webhook Resources list
// before going to production; they are case- and wording-sensitive.
const TRIGGERS = [
  { resource_name: 'Drawing Revisions', event_type: 'create' },
  { resource_name: 'Drawing Revisions', event_type: 'update' },
  { resource_name: 'Schedule Tasks', event_type: 'create' },
  { resource_name: 'Schedule Tasks', event_type: 'update' },
  { resource_name: 'Schedule Tasks', event_type: 'delete' },
];

// -----------------------------------------------------------------------------
// Low-level request helper
// -----------------------------------------------------------------------------

async function procoreFetch(path, { method = 'GET', body, accessToken } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Procore-Company-Id': String(COMPANY_ID),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const err = new Error(`Procore ${method} ${path} failed: ${res.status}`);
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  return parsed;
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

export async function listHooks(accessToken) {
  return procoreFetch(`/rest/v1.0/webhooks/hooks?company_id=${COMPANY_ID}`, {
    accessToken,
  });
}

export async function createHook(accessToken) {
  return procoreFetch('/rest/v1.0/webhooks/hooks', {
    method: 'POST',
    accessToken,
    body: {
      company_id: Number(COMPANY_ID),
      hook: {
        api_version: 'v2',
        // Namespace rules: lowercase a-z, digits, dashes. One per integration,
        // reused across every company and project OhmBoy connects to.
        namespace: NAMESPACE,
        destination_url: DESTINATION_URL,
        destination_headers: {
          // Keep this minimal and never log it.
          Authorization: `Bearer ${SHARED_SECRET}`,
        },
      },
    },
  });
}

// -----------------------------------------------------------------------------
// Triggers
// -----------------------------------------------------------------------------

export async function listTriggers(accessToken, hookId) {
  return procoreFetch(
    `/rest/v1.0/webhooks/hooks/${hookId}/triggers?company_id=${COMPANY_ID}`,
    { accessToken }
  );
}

export async function addTrigger(accessToken, hookId, trigger) {
  return procoreFetch(`/rest/v1.0/webhooks/hooks/${hookId}/triggers`, {
    method: 'POST',
    accessToken,
    body: {
      company_id: Number(COMPANY_ID),
      api_version: 'v2',
      trigger, // { resource_name, event_type }
    },
  });
}

// -----------------------------------------------------------------------------
// Deliveries — your first stop when packets stop showing up
// -----------------------------------------------------------------------------

// status: 'any' | 'successful' | 'discarded' | 'failing'
export async function listDeliveries(accessToken, hookId, status = 'failing') {
  return procoreFetch(
    `/rest/v1.0/webhooks/hooks/${hookId}/deliveries` +
      `?company_id=${COMPANY_ID}&filter[status]=${status}`,
    { accessToken }
  );
}

// -----------------------------------------------------------------------------
// Bootstrap — safe to run on every server boot
// -----------------------------------------------------------------------------

export async function bootstrapWebhooks(getAccessToken) {
  const missing = [
    ['PROCORE_COMPANY_ID', COMPANY_ID],
    ['PROCORE_WEBHOOK_DESTINATION_URL', DESTINATION_URL],
    ['PROCORE_WEBHOOK_SECRET', SHARED_SECRET],
  ].filter(([, v]) => !v).map(([k]) => k);

  if (missing.length) {
    throw new Error(`Cannot bootstrap webhooks, missing env: ${missing.join(', ')}`);
  }
  if (!/^https:\/\//.test(DESTINATION_URL)) {
    throw new Error('PROCORE_WEBHOOK_DESTINATION_URL must be HTTPS');
  }

  const accessToken = await getAccessToken();

  // 1. Find or create our hook.
  const existing = await listHooks(accessToken);
  let hook = (Array.isArray(existing) ? existing : []).find(
    (h) => h.namespace === NAMESPACE
  );

  if (hook) {
    console.log(`[webhooks] reusing hook ${hook.id} (${NAMESPACE})`);
  } else {
    hook = await createHook(accessToken);
    console.log(`[webhooks] created hook ${hook.id} -> ${DESTINATION_URL}`);
  }

  // 2. Add any triggers we don't already have.
  const current = await listTriggers(accessToken, hook.id);
  const have = new Set(
    (Array.isArray(current) ? current : []).map(
      (t) => `${t.resource_name}|${t.event_type}`
    )
  );

  for (const t of TRIGGERS) {
    const key = `${t.resource_name}|${t.event_type}`;
    if (have.has(key)) continue;
    try {
      await addTrigger(accessToken, hook.id, t);
      console.log(`[webhooks] +trigger ${key}`);
    } catch (err) {
      // A bad resource_name fails here rather than silently going quiet later.
      console.error(`[webhooks] trigger ${key} rejected:`, err.status, err.body);
    }
  }

  return hook;
}

// -----------------------------------------------------------------------------
// Receiver notes — the two traps worth guarding against
// -----------------------------------------------------------------------------
//
// 1. FIVE SECOND TIMEOUT. Procore gives your endpoint 5 seconds to return 2xx
//    once connected. If transform + routing + disk write runs inline, a slow
//    Procore API call during enrichment will blow the window and Procore
//    retries — you get duplicate packets. Acknowledge first, work after:
//
//      app.post('/webhooks/procore', (req, res) => {
//        if (!verifySharedSecret(req)) return res.sendStatus(401);
//        res.sendStatus(200);              // ack immediately
//        queue.push(req.body);             // process off the request path
//      });
//
// 2. FEEDBACK LOOPS. When OhmBoy writes back to Procore, Procore fires an event
//    for that write and hands it straight back to you. Drop events your own
//    service account or app caused before they reach the transform layer:
//
//      const evt = payload.event ?? payload;
//      if (String(evt.source_application_id) === process.env.PROCORE_CLIENT_ID) return;
//      if (String(evt.source_user_id) === process.env.PROCORE_SERVICE_USER_ID) return;
//
// 3. IDEMPOTENCY. Retries and duplicate deliveries are normal. Key processed
//    events on evt.id and skip anything you've already seen — a Set in memory
//    works for testing, but this needs to move to the database alongside the
//    packet store.
