/* One call that tells you what is and isn't wired. */
const { json, put, get, del, storageStatus } = require("./_lib/store");
const { cfg, missingEnv, placeholderEnv, TOKEN_KEY } = require("./_lib/procore");

exports.handler = async function () {
  const c = cfg();
  let roundTrip = { ok: false };
  try {
    const k = "health:" + Date.now();
    await put(k, { ok: true });
    roundTrip = { ok: !!(await get(k)) };
    await del(k);
  } catch (err) { roundTrip = { ok: false, error: err.message }; }

  const token = await get(TOKEN_KEY);

  const bad = placeholderEnv();

  return json(200, {
    ok: true,
    version: "v0.22.0",
    checkedAt: new Date().toISOString(),
    storage: await storageStatus(),
    roundTrip,
    procore: {
      // configured means present AND plausible — a variable holding template
      // text used to report as configured and fail opaquely later.
      configured: missingEnv().length === 0 && bad.length === 0,
      missingEnv: missingEnv(),
      invalidEnv: bad,
      oauthBase: c.oauthBase,
      apiBase: c.apiBase,
      companyIdSet: !!c.companyId,
      webhookSecretSet: !!c.webhookSecret,
      namespace: c.namespace,
      connected: !!token,
      tokenExpiresAt: token ? token.expiresAt : null
    },
    nextSteps: [
      "1. Set the PROCORE_* environment variables in Netlify and redeploy.",
      "2. Visit /.netlify/functions/procore-auth-start to authorise.",
      "3. Read company_id off the callback response and set PROCORE_COMPANY_ID.",
      "4. Call /.netlify/functions/procore-webhook-register to create the hook + triggers.",
      "5. Check /.netlify/functions/procore-webhook-deliveries?status=failing if events don't arrive."
    ]
  });
};
