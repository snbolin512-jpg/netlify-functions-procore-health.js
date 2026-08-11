const { json } = require("./_lib/response.js");
const store = require("./_lib/store.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const events = await store.listJSON("event:", 100);
  return json(200, { ok: true, count: events.length, events });
};