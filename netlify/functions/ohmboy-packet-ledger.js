const { response, listJson, PACKET_PREFIX, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });
    if (event.httpMethod !== "GET") return response(405, { ok: false, error: "Use GET for packet ledger." });

    const limit = Number(event.queryStringParameters?.limit || 100);
    const packets = await listJson(PACKET_PREFIX, limit);
    const storage = await storageStatus();

    return response(200, {
      ok: true,
      count: packets.length,
      storage,
      packets
    });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-packet-ledger", error: err.message, stack: err.stack });
  }
};
