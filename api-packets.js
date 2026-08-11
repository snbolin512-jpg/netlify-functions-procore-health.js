const { json } = require("./_lib/response.js");
const store = require("./_lib/store.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const events = await store.listJSON("event:", 100);
  const packets = events.map((e, i) => ({
    id: e.key || ("pkt_" + i),
    type: String(e.eventType || "").includes("schedule") ? "schedule" : "drawing",
    title: String(e.eventType || "").includes("schedule") ? "Procore Schedule Event" : "Procore Drawing Event",
    summary: "Normalized from Procore webhook/event ledger.",
    score: String(e.eventType || "").includes("schedule") ? 88 : 92,
    raw: e
  }));
  return json(200, { ok: true, count: packets.length, packets });
};