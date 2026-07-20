exports.handler = async function () {
  return { statusCode: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, service: "ohmboy-health", version: "v0.21.5c-static-netlify-safe" }, null, 2) };
};