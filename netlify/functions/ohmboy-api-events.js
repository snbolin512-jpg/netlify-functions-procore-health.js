
const { listEvents, clearEvents, response, storageMode } = require("./_lib/ohmboy-backend-store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });

    const mode = await storageMode();

    if (event.httpMethod === "DELETE") {
      const cleared = await clearEvents();
      return response(200, { ok: true, cleared, storage: mode, storageMode: mode.backend });
    }

    if (event.httpMethod !== "GET") {
      return response(405, { ok: false, error: "Use GET to list events or DELETE to clear test events.", storage: mode, storageMode: mode.backend });
    }

    const limit = Number(event.queryStringParameters?.limit || 50);
    const events = await listEvents(limit);
    return response(200, {
      ok: true,
      count: events.length,
      events,
      storage: mode,
      storageMode: mode.backend,
      durableStorage: mode.durable,
      warning: mode.durable ? null : "Memory fallback does not persist across separate function calls. See storage.error."
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-api-events", error: err.message, stack: err.stack });
  }
};
