
const { response, putJson, listEvents, nowIso, storageMode } = require("./_lib/ohmboy-backend-store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    const mode = await storageMode();
    const storage = await putJson("health:last-check", { checkedAt: nowIso(), message: "OhmBoy API backend health check - dynamic import blobs" });
    const events = await listEvents(5);
    return response(200, {
      ok: true,
      service: "ohmboy-api-backend",
      runtime: "lambda-js-dynamic-import-blobs",
      checkedAt: nowIso(),
      storageMode: storage.backend,
      storage,
      storageDiagnostic: mode,
      durableStorage: storage.durable,
      recentEventCount: events.length,
      warning: storage.durable ? null : "Memory fallback does not persist across separate function calls. See storageDiagnostic.error.",
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
