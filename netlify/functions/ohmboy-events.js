const { response, listJson, EVENT_PREFIX, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "GET") return response(405, { ok: false, error: "Use GET for events." });

    const limit = Number(event.queryStringParameters?.limit || 100);
    const events = await listJson(EVENT_PREFIX, limit);
    const storage = await storageStatus();

    return response(200, {
      ok: true,
      count: events.length,
      storage,
      events
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-events", error: err.message, stack: err.stack });
  }
};
