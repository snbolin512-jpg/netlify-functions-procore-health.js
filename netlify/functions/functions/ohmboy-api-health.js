
const { response, putJson, listEvents, nowIso } = require("./_lib/ohmboy-backend-store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    const storage = await putJson("health:last-check", { checkedAt: nowIso(), message: "OhmBoy API backend health check" });
    const events = await listEvents(5);
    return response(200, {
      ok: true,
      service: "ohmboy-api-backend",
      checkedAt: nowIso(),
      storage,
      recentEventCount: events.length,
      endpoints: {
        intake: "/.netlify/functions/ohmboy-api-intake",
        events: "/.netlify/functions/ohmboy-api-events",
        promotePacket: "/.netlify/functions/ohmboy-api-promote-packet"
      }
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-api-health", error: err.message, stack: err.stack });
  }
};
