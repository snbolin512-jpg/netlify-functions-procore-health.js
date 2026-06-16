
const { nowIso, id, putJson, normalizeEvent, parseBody, verifySignatureIfConfigured, response } = require("./_lib/ohmboy-backend-store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "POST") return response(405, { ok: false, error: "Use POST for API intake." });

    const signature = verifySignatureIfConfigured(event);
    if (!signature.ok) return response(401, { ok: false, error: signature.error });

    const raw = parseBody(event);
    const eventId = id("OHM-EVT");
    const receivedAt = nowIso();
    const normalized = normalizeEvent(raw, event.headers || {});
    const record = {
      eventId,
      receivedAt,
      status: "received",
      signatureMode: signature.mode,
      projectId: normalized.projectId,
      companyId: normalized.companyId,
      source: normalized.source,
      eventType: normalized.eventType,
      normalized,
      raw
    };
    const storage = await putJson(`event:${eventId}`, record);
    record.storage = storage;
    return response(202, { ok: true, eventId, receivedAt, storage, storageMode: storage.backend, durableStorage: storage.durable, status: "received", normalized });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-api-intake", error: err.message, stack: err.stack });
  }
};
