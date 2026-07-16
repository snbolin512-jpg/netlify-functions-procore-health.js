const store = require("./_lib/store.js");
exports.handler = async function () {
  const events = await store.listJSON("event:", 100);
  return { statusCode: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: JSON.stringify({ ok: true, count: events.length, events }, null, 2) };
};