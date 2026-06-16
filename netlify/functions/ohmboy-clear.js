const { response, clearPrefix, EVENT_PREFIX, PACKET_PREFIX, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "DELETE" && event.httpMethod !== "POST") {
      return response(405, { ok: false, error: "Use DELETE or POST to clear test data." });
    }

    const eventsCleared = await clearPrefix(EVENT_PREFIX);
    const packetsCleared = await clearPrefix(PACKET_PREFIX);
    const storage = await storageStatus();

    return response(200, {
      ok: true,
      storage,
      cleared: {
        events: eventsCleared,
        packets: packetsCleared
      }
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-clear", error: err.message, stack: err.stack });
  }
};
