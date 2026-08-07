/* Delivery log — first stop when packets stop arriving.
   ?hook_id=123&status=failing|successful|discarded|any */
const { json } = require("./_lib/store");
const { api, cfg } = require("./_lib/procore");

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  const c = cfg();
  if (!c.companyId) return json(400, { ok: false, error: "PROCORE_COMPANY_ID not set" });

  try {
    let hookId = q.hook_id;
    if (!hookId) {
      const hooks = await api(`/rest/v1.0/webhooks/hooks?company_id=${c.companyId}`);
      const mine = Array.isArray(hooks) ? hooks.find(h => h.namespace === c.namespace) : null;
      if (!mine) return json(404, { ok: false, error: `No hook found in namespace "${c.namespace}". Run procore-webhook-register first.` });
      hookId = mine.id;
    }
    const status = q.status || "failing";
    const rows = await api(
      `/rest/v1.0/webhooks/hooks/${hookId}/deliveries?company_id=${c.companyId}&filter[status]=${status}`
    );
    return json(200, { ok: true, hookId, status, count: Array.isArray(rows) ? rows.length : null, deliveries: rows });
  } catch (err) {
    return json(502, { ok: false, error: err.message, detail: err.detail || null });
  }
};
