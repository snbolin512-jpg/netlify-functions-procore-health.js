/* Procore redirects here with ?code=... — exchange it for tokens. */
const { json, get, del } = require("./_lib/store");
const { exchangeCode, saveToken, cfg, api } = require("./_lib/procore");

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const q = event.queryStringParameters || {};

  if (q.error) {
    return json(400, { ok: false, error: q.error, description: q.error_description || null });
  }
  if (!q.code) {
    return json(400, { ok: false, error: "No authorization code on the callback." });
  }
  if (q.state) {
    const known = await get("oauthstate:" + q.state);
    if (!known) {
      return json(400, { ok: false, error: "Unrecognised OAuth state. Restart at procore-auth-start." });
    }
    await del("oauthstate:" + q.state);
  }

  try {
    const tok = await exchangeCode(q.code);
    const saved = await saveToken(tok);

    // Surface company_id straight away — it's needed for every later API call
    // and for creating webhook hooks, and it's tedious to find by hand.
    let me = null, companies = null;
    try { me = await api("/rest/v1.0/me"); } catch (e) { me = { error: e.message }; }
    try { companies = await api("/rest/v1.0/companies"); } catch (e) { companies = { error: e.message }; }

    return json(200, {
      ok: true,
      connected: true,
      expiresAt: saved.expiresAt,
      configuredCompanyId: cfg().companyId || null,
      me,
      companies: Array.isArray(companies)
        ? companies.map(c => ({ id: c.id, name: c.name }))
        : companies,
      nextStep: "Set PROCORE_COMPANY_ID to the id above, then call procore-webhook-register to create the hook and triggers.",
      note: "Token storage is in-memory and will not survive a cold start. Move _lib/store.js to a real store before relying on this."
    });
  } catch (err) {
    return json(502, { ok: false, error: err.message, detail: err.detail || null });
  }
};
