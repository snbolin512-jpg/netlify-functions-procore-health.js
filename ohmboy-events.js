const { json, parseJsonBody, normalizeProcoreLike, put, EVENT_PREFIX, uid, nowIso, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Use POST for event processing." });

    const raw = parseJsonBody(event);
    const norm = normalizeProcoreLike(raw);
    const record = {
      eventId: norm.id || uid("OHM-NORM"),
      receivedAt: nowIso(),
      status: "processed",
      raw,
      normalized: norm
    };

    const write = await put(`${EVENT_PREFIX}${record.eventId}`, record);
    const storage = await storageStatus();

    return json(200, { ok: true, storage, write, normalized: norm, record });
  } catch (err) {
    return json(500, { ok: false, functionName: "procore-process-event", error: err.message, stack: err.stack });
  }
};
