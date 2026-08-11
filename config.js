require("dotenv").config();

function required(name) {
  const val = process.env[name];
  if (!val) {
    console.warn(`[config] Warning: ${name} is not set. Set it in your .env before going live.`);
  }
  return val;
}

module.exports = {
  clientId: required("PROCORE_CLIENT_ID"),
  clientSecret: required("PROCORE_CLIENT_SECRET"),
  redirectUri: required("PROCORE_REDIRECT_URI"),
  oauthBase: process.env.PROCORE_OAUTH_BASE || "https://login.procore.com",
  apiBase: process.env.PROCORE_API_BASE || "https://api.procore.com",
  projectId: process.env.PROCORE_PROJECT_ID || "",
  companyId: process.env.PROCORE_COMPANY_ID || "",
  webhookSecret: required("PROCORE_WEBHOOK_SECRET"),
  port: process.env.PORT || 4000,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
};
