const { json, parseJsonBody, signatureCheck, put, uid, nowIso, RAW_PREFIX, EVENT_PREFIX, normalizeProcoreLike, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { ok: false, error: "Use POST for webhook intake." });

    const signature = signatureCheck(event);
    if (!signature.ok) return json(401, { ok: false, error: signature.error });

    const raw = parseJsonBody(event);
    const rawId = uid("OHM-RAW");
    const norm = normalizeProcoreLike(raw);
    const receivedAt = nowIso();

    const rawRecord = {
      rawId,
      receivedAt,
      signatureMode: signature.mode,
      raw
    };

    const eventRecord = {
      eventId: norm.id,
      receivedAt,
      updatedAt: receivedAt,
      status: "webhook-received",
      rawId,
      raw,
      normalized: norm
    };

    const rawWrite = await put(`${RAW_PREFIX}${rawId}`, rawRecord);
    const eventWrite = await put(`${EVENT_PREFIX}${norm.id}`, eventRecord);
    const storage = await storageStatus();

    return json(202, {
      ok: true,
      receivedAt,
      rawId,
      normalizedId: norm.id,
      storage,
      writes: { raw: rawWrite, event: eventWrite },
      normalized: norm
    });
  } catch (err) {
    return json(500, { ok: false, functionName: "procore-webhook", error: err.message, stack: err.stack });
  }
};
