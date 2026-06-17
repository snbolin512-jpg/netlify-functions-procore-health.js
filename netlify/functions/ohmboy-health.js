const { json, roundTrip, list, EVENT_PREFIX, PACKET_PREFIX, STORE_NAME } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    const round = await roundTrip();
    return json(200, {
      ok: round.ok,
      service: "ohmboy-clean-api",
      version: "v0.20-full-restore-clean-storage",
      store: STORE_NAME,
      storage: round.storage,
      roundTrip: round,
      counts: {
        events: (await list(EVENT_PREFIX, 100)).length,
        packets: (await list(PACKET_PREFIX, 100)).length
      }
    });
  } catch (err) {
    return json(500, { ok: false, functionName: "ohmboy-health", error: err.message, stack: err.stack });
  }
};
