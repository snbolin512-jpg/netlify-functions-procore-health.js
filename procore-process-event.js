/* Manual/normalisation endpoint — POST a Procore-shaped payload to see how
   OhmBoy normalises it, without needing a live webhook. Useful for testing
   the transform contract. */
const { json, parseJsonBody, normalizeProcoreLike, put, EVENT_PREFIX, uid, nowIso, storageStatus } = require("./_lib/store");

exports.handler = async function (event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Use POST for event processing." });

    const raw = parseJsonBody(event);
    const normalized = normalizeProcoreLike(raw);
    const record = {
      eventId: normalized.id || uid("OHM-NORM"),
      receivedAt: nowIso(),
      status: "processed",
      raw,
      normalized
    };
    const write = await put(EVENT_PREFIX + record.eventId, record);
    return json(200, { ok: true, storage: await storageStatus(), write, normalized, record });
  } catch (err) {
    return json(500, { ok: false, functionName: "procore-process-event", error: err.message });
  }
};
