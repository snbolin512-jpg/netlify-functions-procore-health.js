const { json, drawingMock, scheduleMock, put, RAW_PREFIX, normalizeProcoreLike, EVENT_PREFIX, uid, nowIso, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

    const kind = event.queryStringParameters?.kind === "schedule" ? "schedule" : "drawing";
    const raw = kind === "schedule" ? scheduleMock() : drawingMock();

    const rawId = uid("OHM-RAW");
    const norm = normalizeProcoreLike(raw);
    await put(`${RAW_PREFIX}${rawId}`, { rawId, receivedAt: nowIso(), raw });
    await put(`${EVENT_PREFIX}${norm.id}`, { eventId: norm.id, receivedAt: nowIso(), status: "mock-received", raw, normalized: norm });

    const storage = await storageStatus();

    return json(200, {
      ...raw,
      backendStored: true,
      rawId,
      normalizedId: norm.id,
      storage
    });
  } catch (err) {
    return json(500, { ok: false, functionName: "procore-mock-event", error: err.message, stack: err.stack });
  }
};
