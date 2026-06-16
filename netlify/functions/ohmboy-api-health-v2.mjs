
import { json, putJson, listEvents, nowIso } from "./_lib/ohmboy-blob-store-v2.mjs";

export default async function handler(req, context) {
  try {
    if (req.method === "OPTIONS") return json({ ok: true });
    const storage = await putJson("health:last-check", { checkedAt: nowIso(), message: "Modern OhmBoy API backend health check" });
    const events = await listEvents(5);
    return json({
      ok: true,
      service: "ohmboy-api-backend",
      runtime: "modern-netlify-functions",
      checkedAt: nowIso(),
      storage,
      storageMode: storage.backend,
      durableStorage: true,
      recentEventCount: events.length,
      endpoints: {
        intake: "/.netlify/functions/ohmboy-api-intake-v2",
        events: "/.netlify/functions/ohmboy-api-events-v2",
        promotePacket: "/.netlify/functions/ohmboy-api-promote-packet-v2"
      }
    });
  } catch (err) {
    return json({ ok: false, functionName: "ohmboy-api-health-v2", error: err.message, stack: err.stack }, 500);
  }
}
