const { json, roundTrip, list, EVENT_PREFIX, PACKET_PREFIX, STORE_NAME } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    const round = await roundTrip();
    const events = await list(EVENT_PREFIX, 5);
    const packets = await list(PACKET_PREFIX, 5);

    return json(200, {
      ok: round.ok,
      service: "ohmboy-v020-full-restore",
      version: "v0.20-full-restore-clean-storage",
      restoredFrom: "v0.18.11-full-feature-ui",
      checkedAt: new Date().toISOString(),
      store: STORE_NAME,
      storage: round.storage,
      roundTrip: round,
      counts: {
        recentEvents: events.length,
        recentPackets: packets.length
      },
      note: round.ok ? "Full UI restored. Durable storage passed." : "Full UI restored, but durable storage did not pass."
    });
  } catch (err) {
    return json(500, {
      ok: false,
      service: "ohmboy-v020-full-restore",
      functionName: "procore-health",
      error: err.message,
      stack: err.stack
    });
  }
};
