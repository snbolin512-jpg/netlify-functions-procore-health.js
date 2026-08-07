/* Kicks off the Procore OAuth2 authorization-code flow.
   Visit https://<site>/.netlify/functions/procore-auth-start once to connect. */
const { json, redirect, uid, put } = require("./_lib/store");
const { missingEnv, authorizeUrl, cfg } = require("./_lib/procore");

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

  const missing = missingEnv();
  if (missing.length) {
    return json(400, {
      ok: false,
      error: "Procore OAuth is not configured.",
      missingEnv: missing,
      howToFix: "Set these in Netlify > Site settings > Environment variables, then redeploy.",
      redirectUriMustMatch: cfg().redirectUri || "(unset)"
    });
  }

  // CSRF state, echoed back by Procore and checked in the callback.
  const state = uid("STATE");
  await put("oauthstate:" + state, { createdAt: Date.now() });

  const url = authorizeUrl(state);
  // ?json=1 returns the URL instead of redirecting, which is easier to debug.
  if ((event.queryStringParameters || {}).json) return json(200, { ok: true, authorizeUrl: url, state });
  return redirect(url);
};
