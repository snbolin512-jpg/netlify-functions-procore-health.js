const { json, envStatus } = require("./_lib/response.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const qs = event.queryStringParameters || {};
  if (!qs.code) {
    return json(200, {
      ok: false,
      message: "Callback function is deployed. Procore will call this with ?code=...",
      env: envStatus()
    });
  }
  return json(200, {
    ok: true,
    message: "OAuth callback reached OhmBoy. Token exchange is intentionally not enabled in this routing-fix build.",
    codeReceived: true,
    env: envStatus()
  });
};