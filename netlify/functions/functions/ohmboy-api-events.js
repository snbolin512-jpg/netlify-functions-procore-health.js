
const { listEvents, clearEvents, response } = require("./_lib/ohmboy-backend-store");

exports.handler = async function(event) {
  try {
    if (event.httpMethod === "OPTIONS") return response(200, { ok: true });

    if (event.httpMethod === "DELETE") {
      const cleared = await clearEvents();
      return response(200, { ok: true, cleared });
    }

    if (event.httpMethod !== "GET") {
      return response(405, { ok: false, error: "Use GET to list events or DELETE to clear test events." });
    }

    const limit = Number(event.queryStringParameters?.limit || 50);
    const events = await listEvents(limit);
    return response(200, { ok: true, count: events.length, events });
  } catch (err) {
    return response(500, { ok: false, functionName: "ohmboy-api-events", error: err.message, stack: err.stack });
  }
};
