
const { getJson, putJson, response, nowIso } = require("./_lib/ohmboy-backend-store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "POST") return response(405, { ok: false, error: "Use POST to promote an event candidate." });

    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch (err) { return response(400, { ok: false, error: "Invalid JSON body." }); }
    const eventId = body.eventId;
    if (!eventId) return response(400, { ok: false, error: "Missing eventId." });

    const record = await getJson(`event:${eventId}`);
    if (!record) return response(404, { ok: false, error: "Event not found." });

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
    return response(200, { ok: true, eventId, packetCandidate });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-api-promote-packet", error: err.message, stack: err.stack });
  }
};
