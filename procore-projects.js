const { json, envStatus } = require("./_lib/response.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const env = envStatus();
  const sandboxUrl = process.env.PROCORE_SANDBOX_URL || "https://sandbox.procore.com/4288357/company/home";
  return json(200, {
    ok: true,
    mockMode: process.env.PROCORE_MOCK_MODE !== "false",
    env,
    projects: [
      {
        id: process.env.PROCORE_PROJECT_ID || "sandbox-project-not-set",
        company_id: process.env.PROCORE_COMPANY_ID || "4288357",
        name: "Procore Sandbox Project",
        source: "Netlify function placeholder until OAuth token/project pull is enabled",
        sandbox_url: sandboxUrl
      }
    ]
  });
};