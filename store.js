const { json } = require("./_lib/store");

exports.handler = async function(event) {
  return json(200, {
    ok: true,
    service: "ohmboy-v020-full-restore",
    message: "OAuth callback stub is live. Token exchange is intentionally disabled until credentials are configured.",
    query: event.queryStringParameters || {}
  });
};
