
import { json, listEvents, clearEvents } from "./_lib/ohmboy-blob-store-v2.mjs";

export default async function handler(req, context) {
  try {
    if (req.method === "OPTIONS") return json({ ok: true });

    if (req.method === "DELETE") {
      const cleared = await clearEvents();
      return json({ ok: true, cleared, storage: { backend: "netlify-blobs-modern", durable: true }, storageMode: "netlify-blobs-modern" });
    }

    if (req.method !== "GET") {
      return json({ ok: false, error: "Use GET to list events or DELETE to clear test events." }, 405);
    }

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") || 50);
    const events = await listEvents(limit);

    return json({
      ok: true,
      count: events.length,
      events,
      storage: { backend: "netlify-blobs-modern", durable: true },
      storageMode: "netlify-blobs-modern",
      durableStorage: true
    });
  } catch (err) {
    return json({ ok: false, functionName: "ohmboy-api-events-v2", error: err.message, stack: err.stack }, 500);
  }
}
