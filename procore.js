/* Procore OAuth2 + REST helpers shared by the auth and webhook functions.
   Credentials live in Netlify environment variables and never reach the
   browser. Set these in Netlify > Site settings > Environment variables:

     PROCORE_CLIENT_ID
     PROCORE_CLIENT_SECRET
     PROCORE_REDIRECT_URI      https://<your-site>/.netlify/functions/procore-auth-callback
     PROCORE_OAUTH_BASE        https://login.procore.com   (sandbox: https://login-sandbox.procore.com)
     PROCORE_API_BASE          https://api.procore.com     (sandbox: https://sandbox.procore.com)
     PROCORE_COMPANY_ID
     PROCORE_WEBHOOK_SECRET    a long random string you choose
     PROCORE_WEBHOOK_NAMESPACE ohmboy-packets                                */

const { put, get, TOKEN_PREFIX, nowIso } = require("./store");

const env = (k, d) => process.env[k] || d || "";

const cfg = () => ({
  clientId:     env("PROCORE_CLIENT_ID"),
  clientSecret: env("PROCORE_CLIENT_SECRET"),
  redirectUri:  env("PROCORE_REDIRECT_URI"),
  oauthBase:    env("PROCORE_OAUTH_BASE", "https://login.procore.com"),
  apiBase:      env("PROCORE_API_BASE", "https://api.procore.com"),
  companyId:    env("PROCORE_COMPANY_ID"),
  webhookSecret: env("PROCORE_WEBHOOK_SECRET"),
  namespace:    env("PROCORE_WEBHOOK_NAMESPACE", "ohmboy-packets")
});

function missingEnv() {
  const c = cfg();
  return [
    ["PROCORE_CLIENT_ID", c.clientId],
    ["PROCORE_CLIENT_SECRET", c.clientSecret],
    ["PROCORE_REDIRECT_URI", c.redirectUri]
  ].filter(([, v]) => !v).map(([k]) => k);
}

/* A variable that exists but holds template text is worse than one that is
   missing: everything reports "configured", and the failure surfaces later as
   an opaque Procore rejection. The commonest cause is pasting a whole .env
   line into Netlify's value box, so the value ends up as
   "PROCORE_CLIENT_ID = your client id" rather than the id itself. */
function placeholderEnv() {
  const suspect = (key, value) => {
    if (!value) return null;
    const v = String(value).trim();
    if (v.includes(key)) return "still contains the variable name — looks like a whole .env line was pasted into the value box";
    if (/CHANGE.?ME/i.test(v)) return "still says CHANGE-ME";
    if (/^your|your (procore|client|company|site)/i.test(v)) return "still reads as placeholder text";
    if (/YOUR-SITE|<[^>]+>|example\.com/i.test(v)) return "still contains a placeholder hostname";
    if (key.endsWith("_ID") || key.endsWith("_SECRET")) {
      if (/\s/.test(v)) return "contains spaces — Procore ids and secrets never do";
      if (v.length < 20) return `only ${v.length} characters — Procore ids and secrets are long hex strings`;
      if (!/^[A-Za-z0-9._~-]+$/.test(v)) return "contains characters Procore ids and secrets don't use (stray quotes?)";
    }
    if (key.endsWith("_URI") || key.endsWith("_BASE")) {
      if (!/^https:\/\//.test(v)) return "must start with https://";
      if (/\s/.test(v)) return "contains spaces";
    }
    return null;
  };

  const checks = [
    ["PROCORE_CLIENT_ID", cfg().clientId],
    ["PROCORE_CLIENT_SECRET", cfg().clientSecret],
    ["PROCORE_REDIRECT_URI", cfg().redirectUri],
    ["PROCORE_OAUTH_BASE", cfg().oauthBase],
    ["PROCORE_API_BASE", cfg().apiBase],
    ["PROCORE_COMPANY_ID", cfg().companyId],
    ["PROCORE_WEBHOOK_SECRET", cfg().webhookSecret]
  ];

  const bad = [];
  for (const [k, v] of checks) {
    const why = suspect(k, v);
    if (why) bad.push({ variable: k, problem: why });
  }

  // Sandbox auth host paired with a production API host (or vice versa) is a
  // 401 that reads exactly like a bad password.
  const oauthSandbox = /sandbox/i.test(cfg().oauthBase || "");
  const apiSandbox = /sandbox/i.test(cfg().apiBase || "");
  if (cfg().oauthBase && cfg().apiBase && oauthSandbox !== apiSandbox) {
    bad.push({
      variable: "PROCORE_OAUTH_BASE / PROCORE_API_BASE",
      problem: "one is sandbox and the other is production — this produces a 401 that looks like a bad password"
    });
  }
  return bad;
}

function authorizeUrl(state) {
  const c = cfg();
  const q = new URLSearchParams({
    response_type: "code",
    client_id: c.clientId,
    redirect_uri: c.redirectUri
  });
  if (state) q.set("state", state);
  return `${c.oauthBase}/oauth/authorize?${q.toString()}`;
}

async function exchangeCode(code) {
  const c = cfg();
  const res = await fetch(`${c.oauthBase}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: c.clientId,
      client_secret: c.clientSecret,
      redirect_uri: c.redirectUri
    })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Token exchange failed (${res.status})`);
    err.detail = body;
    throw err;
  }
  return body;
}

async function refresh(refreshToken) {
  const c = cfg();
  const res = await fetch(`${c.oauthBase}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: c.clientId,
      client_secret: c.clientSecret
    })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Token refresh failed (${res.status})`);
    err.detail = body;
    throw err;
  }
  return body;
}

const TOKEN_KEY = TOKEN_PREFIX + "procore";

async function saveToken(tok) {
  const record = {
    ...tok,
    obtainedAt: nowIso(),
    // Procore returns created_at + expires_in (seconds).
    expiresAt: new Date(Date.now() + (Number(tok.expires_in || 7200) * 1000)).toISOString()
  };
  await put(TOKEN_KEY, record);
  return record;
}

/* Returns a usable access token, refreshing when it's inside 5 minutes of
   expiry. Throws if nothing has been authorised yet. */
async function accessToken() {
  const tok = await get(TOKEN_KEY);
  if (!tok) {
    throw new Error("Not connected to Procore. Visit /.netlify/functions/procore-auth-start first.");
  }
  const msLeft = new Date(tok.expiresAt).getTime() - Date.now();
  if (msLeft > 5 * 60 * 1000) return tok.access_token;
  const fresh = await refresh(tok.refresh_token);
  const saved = await saveToken(fresh);
  return saved.access_token;
}

async function api(path, { method = "GET", body } = {}) {
  const c = cfg();
  const token = await accessToken();
  const res = await fetch(`${c.apiBase}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "Procore-Company-Id": String(c.companyId),
      ...(body ? { "content-type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await res.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    const err = new Error(`Procore ${method} ${path} -> ${res.status}`);
    err.status = res.status;
    err.detail = parsed;
    throw err;
  }
  return parsed;
}

module.exports = { cfg, missingEnv, placeholderEnv, authorizeUrl, exchangeCode, refresh, saveToken, accessToken, api, TOKEN_KEY };
