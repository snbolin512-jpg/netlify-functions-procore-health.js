const { json, list, EVENT_PREFIX, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    const storage = await storageStatus();
    const events = await list(EVENT_PREFIX, Number(event.queryStringParameters?.limit || 100));
    return json(200, { ok: true, storage, count: events.length, events });
  } catch (err) {
    return json(500, { ok: false, functionName: "ohmboy-events", error: err.message, stack: err.stack });
  }
};
