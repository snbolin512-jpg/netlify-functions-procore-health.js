const { response, roundTrip, listJson, EVENT_PREFIX, PACKET_PREFIX, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });

    const probe = await roundTrip();
    const events = await listJson(EVENT_PREFIX, 5);
    const packets = await listJson(PACKET_PREFIX, 5);
    const storage = await storageStatus();

    return response(200, {
      ok: probe.ok,
      service: "ohmboy-clean-api",
      version: "rewrite-v1-clean-storage",
      runtime: "netlify-functions-js-direct-routes",
      checkedAt: new Date().toISOString(),
      storage,
      roundTrip: probe,
      counts: {
        recentEvents: events.length,
        recentPackets: packets.length
      },
      endpoints: {
        health: "/.netlify/functions/ohmboy-health",
        intake: "/.netlify/functions/ohmboy-intake",
        events: "/.netlify/functions/ohmboy-events",
        clear: "/.netlify/functions/ohmboy-clear",
        promote: "/.netlify/functions/ohmboy-promote",
        packetLedger: "/.netlify/functions/ohmboy-packet-ledger"
      }
    });
  } catch (err) {
    return response(500, {
      ok: false,
      service: "ohmboy-clean-api",
      functionName: "ohmboy-health",
      error: err.message,
      stack: err.stack
    });
  }
};
