function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign({
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,x-ohmboy-signature,x-procore-signature,x-procore-event"
    }, extraHeaders || {}),
    body: JSON.stringify(body, null, 2)
  };
}
function envStatus() {
  return {
    PROCORE_CLIENT_ID: !!process.env.PROCORE_CLIENT_ID,
    PROCORE_CLIENT_SECRET: !!process.env.PROCORE_CLIENT_SECRET,
    PROCORE_REDIRECT_URI: process.env.PROCORE_REDIRECT_URI || null,
    PROCORE_WEBHOOK_URL: process.env.PROCORE_WEBHOOK_URL || null,
    PROCORE_MOCK_MODE: process.env.PROCORE_MOCK_MODE || null
  };
}
module.exports = { json, envStatus };
