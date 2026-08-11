const { json, envStatus } = require("./_lib/response.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  return json(200, {
    ok: true,
    service: "ohmboy-procore-health",
    version: "v0.21.8-function-deployment-fix",
    message: "Netlify Function is reachable and returning JSON.",
    method: event.httpMethod,
    path: event.path,
    checkedAt: new Date().toISOString(),
    env: envStatus(),
    nextTests: [
      "/.netlify/functions/procore-mock-event",
      "/.netlify/functions/procore-mock-event?kind=schedule",
      "/.netlify/functions/ohmboy-events",
      "/api/health"
    ]
  });
};