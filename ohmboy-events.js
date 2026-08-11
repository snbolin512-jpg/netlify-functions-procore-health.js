const { json, listJSON, EVENT_PREFIX } = require("./_lib/store");
exports.handler = async function () {
  const events = await listJSON(EVENT_PREFIX, 100);
  return json(200, { ok: true, count: events.length, events });
};
