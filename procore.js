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

module.exports = { cfg, missingEnv, authorizeUrl, exchangeCode, refresh, saveToken, accessToken, api, TOKEN_KEY };
