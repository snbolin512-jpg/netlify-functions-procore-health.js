
import { json, id, nowIso, putJson, normalizeEvent, verifySignatureIfConfigured } from "./_lib/ohmboy-blob-store-v2.mjs";

export default async function handler(req, context) {
  try {
    if (req.method === "OPTIONS") return json({ ok: true });
    if (req.method !== "POST") return json({ ok: false, error: "Use POST for API intake." }, 405);

    const rawBody = await req.text();
    const signature = await verifySignatureIfConfigured(req, rawBody);
    if (!signature.ok) return json({ ok: false, error: signature.error }, 401);

    let raw = {};
    try { raw = rawBody ? JSON.parse(rawBody) : {}; } catch (err) { raw = { rawBody }; }

    const eventId = id("OHM-EVT");
    const receivedAt = nowIso();
    const normalized = normalizeEvent(raw, req.headers);

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

    return json({
      ok: true,
      eventId,
      receivedAt,
      storage,
      storageMode: storage.backend,
      durableStorage: true,
      status: "received",
      normalized
    }, 202);
  } catch (err) {
    return json({ ok: false, functionName: "ohmboy-api-intake-v2", error: err.message, stack: err.stack }, 500);
  }
}
