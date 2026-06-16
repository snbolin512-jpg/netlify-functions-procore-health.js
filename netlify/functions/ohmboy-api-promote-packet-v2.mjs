
import { json, getJson, putJson, nowIso } from "./_lib/ohmboy-blob-store-v2.mjs";

export default async function handler(req, context) {
  try {
    if (req.method === "OPTIONS") return json({ ok: true });
    if (req.method !== "POST") return json({ ok: false, error: "Use POST to promote an event candidate." }, 405);

    let body = {};
    try { body = await req.json(); } catch (err) { return json({ ok: false, error: "Invalid JSON body." }, 400); }

    const eventId = body.eventId;
    if (!eventId) return json({ ok: false, error: "Missing eventId." }, 400);

    const record = await getJson(`event:${eventId}`);
    if (!record) return json({ ok: false, error: "Event not found." }, 404);

    const normalized = record.normalized || {};
    const packetCandidate = {
      packetCandidateId: `PKT-CAND-${eventId}`,
      createdAt: nowIso(),
      eventId,
      status: "packet_candidate",
      source: normalized.source,
      title: normalized.title || "API Packet Candidate",
      summary: normalized.summary || "API event promoted to packet candidate.",
      score: normalized.riskScore || 25,
      impacts: normalized.impacts || {},
      recommendedAction: normalized.recommendedAction || "review"
    };

    record.status = "packet_candidate";
    record.packetCandidate = packetCandidate;
    await putJson(`event:${eventId}`, record);
    await putJson(`packet-candidate:${packetCandidate.packetCandidateId}`, packetCandidate);

    return json({ ok: true, eventId, packetCandidate });
  } catch (err) {
    return json({ ok: false, functionName: "ohmboy-api-promote-packet-v2", error: err.message, stack: err.stack }, 500);
  }
}
