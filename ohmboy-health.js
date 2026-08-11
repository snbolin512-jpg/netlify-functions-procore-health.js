const { json } = require("./_lib/response.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  return json(200, { ok: true, service: "ohmboy-health", version: "v0.21.8-function-deployment-fix" });
};