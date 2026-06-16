const { json, clear, EVENT_PREFIX, PACKET_PREFIX, RAW_PREFIX, storageStatus } = require("./_lib/store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST" && event.httpMethod !== "DELETE") return json(405, { ok: false, error: "Use POST or DELETE to clear backend test data." });

    const cleared = {
      events: await clear(EVENT_PREFIX),
      packets: await clear(PACKET_PREFIX),
      raw: await clear(RAW_PREFIX)
    };
    const storage = await storageStatus();
    return json(200, { ok: true, storage, cleared });
  } catch (err) {
    return json(500, { ok: false, functionName: "ohmboy-clear", error: err.message, stack: err.stack });
  }
};
