const { json } = require("./_lib/store");

exports.handler = async function(event) {
  return json(200, {
    ok: true,
    service: "ohmboy-v020-full-restore",
    message: "OAuth start stub is live. Add Procore OAuth credentials before real auth testing.",
    requiredEnv: ["PROCORE_CLIENT_ID", "PROCORE_CLIENT_SECRET", "PROCORE_REDIRECT_URI"]
  });
};
