const { json, envStatus } = require("./_lib/response.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const clientId = process.env.PROCORE_CLIENT_ID;
  const redirectUri = process.env.PROCORE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return json(400, { ok: false, error: "Missing PROCORE_CLIENT_ID or PROCORE_REDIRECT_URI", env: envStatus() });
  }
  const base = "https://login-sandbox.procore.com/oauth/authorize";
  const url = base + "?response_type=code&client_id=" + encodeURIComponent(clientId) + "&redirect_uri=" + encodeURIComponent(redirectUri);
  return {
    statusCode: 302,
    headers: { location: url, "cache-control": "no-store" },
    body: ""
  };
};