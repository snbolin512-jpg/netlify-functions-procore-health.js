const {
  response,
  parseBody,
  verifySignatureIfConfigured,
  normalizeEvent,
  uid,
  nowIso,
  putJson,
  EVENT_PREFIX,
  storageStatus
} = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "POST") return response(405, { ok: false, error: "Use POST for intake." });

    const signature = verifySignatureIfConfigured(event);
    if (!signature.ok) return response(401, { ok: false, error: signature.error });

    const raw = parseBody(event);
    const eventId = uid("OHM-EVT");
    const receivedAt = nowIso();
    const normalized = normalizeEvent(raw, event.headers || {});

    const record = {
      eventId,
      key: `${EVENT_PREFIX}${eventId}`,
      receivedAt,
      updatedAt: receivedAt,
      status: "received",
      packetStatus: "not-promoted",
      signatureMode: signature.mode,
      projectId: normalized.projectId,
      companyId: normalized.companyId,
      source: normalized.source,
      eventType: normalized.eventType,
      normalized,
      raw
    };

    const write = await putJson(record.key, record);
    const storage = await storageStatus();

    return response(202, {
      ok: true,
      eventId,
      receivedAt,
      status: "received",
      storage,
      write,
      normalized
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-intake", error: err.message, stack: err.stack });
  }
};
