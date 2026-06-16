const {
  response,
  parseBody,
  getJson,
  putJson,
  uid,
  nowIso,
  EVENT_PREFIX,
  PACKET_PREFIX,
  storageStatus
} = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "POST") return response(405, { ok: false, error: "Use POST for promote." });

    const body = parseBody(event);
    const eventId = body.eventId;
    if (!eventId) return response(400, { ok: false, error: "Missing eventId." });

    const eventKey = `${EVENT_PREFIX}${eventId}`;
    const eventRecord = await getJson(eventKey);
    if (!eventRecord) return response(404, { ok: false, error: "Event not found.", eventId });

    const normalized = eventRecord.normalized || {};
    const packetId = uid("OHM-PKT");
    const createdAt = nowIso();

    const packet = {
      packetId,
      key: `${PACKET_PREFIX}${packetId}`,
      eventId,
      createdAt,
      updatedAt: createdAt,
      status: "open",
      title: normalized.title || "API Packet",
      summary: normalized.summary || "Promoted API intake event.",
      score: normalized.riskScore || 25,
      discipline: normalized.discipline || "Electrical",
      projectId: normalized.projectId || eventRecord.projectId,
      eventType: normalized.eventType || eventRecord.eventType,
      impacts: normalized.impacts || {},
      recommendedAction: normalized.recommendedAction || "review",
      branchDecisions: [],
      resolutionNotes: []
    };

    eventRecord.packetStatus = "promoted";
    eventRecord.packetId = packetId;
    eventRecord.status = "packet-created";
    eventRecord.updatedAt = createdAt;

    const packetWrite = await putJson(packet.key, packet);
    const eventWrite = await putJson(eventKey, eventRecord);
    const storage = await storageStatus();

    return response(200, {
      ok: true,
      storage,
      eventId,
      packetId,
      packet,
      writes: {
        packet: packetWrite,
        event: eventWrite
      }
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-promote", error: err.message, stack: err.stack });
  }
};
