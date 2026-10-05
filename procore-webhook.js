/* Procore webhook receiver.
   ---------------------------------------------------------------------------
   Two things this has to get right, both of which bite quietly:

   1. FIVE SECOND TIMEOUT. Procore fails the delivery if we haven't returned
      2xx within 5 seconds of connecting, then retries — which is how you end
      up with duplicate packets. So we verify, acknowledge, and only then do
      any work. Nothing slow happens before the response.

   2. FEEDBACK LOOPS. When OhmBoy writes back to Procore, Procore fires an
      event for that write and hands it straight back. Events caused by our own
      app or service user are dropped before they reach the transform layer. */
const { json, put, get, parseJsonBody, normalizeProcoreLike, EVENT_PREFIX, storageStatus } = require("./_lib/store");

const SECRET = process.env.PROCORE_WEBHOOK_SECRET || "";
const SELF_APP_ID = process.env.PROCORE_CLIENT_ID || "";
const SELF_USER_ID = process.env.PROCORE_SERVICE_USER_ID || "";

function authentic(event) {
  if (!SECRET) return false;
  const h = event.headers || {};
  const got = h.authorization || h.Authorization || "";
  // Matches whatever was put in destination_headers when the hook was created.
  return got === `Bearer ${SECRET}` || got === SECRET;
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "POST required" });

  if (!authentic(event)) {
    return json(401, { ok: false, error: "Bad or missing Authorization header." });
  }

  const body = parseJsonBody(event);
  const norm = normalizeProcoreLike(body);

  // Loop guard — drop events this integration caused.
  if (
    (SELF_APP_ID && String(norm.sourceApplicationId) === String(SELF_APP_ID)) ||
    (SELF_USER_ID && String(norm.sourceUserId) === String(SELF_USER_ID))
  ) {
    return json(200, { ok: true, ignored: "self-originated event" });
  }

  // Idempotency — retries and duplicate deliveries are normal.
  const key = EVENT_PREFIX + norm.id;
  const seen = await get(key);
  if (seen) return json(200, { ok: true, duplicate: true, eventId: norm.id });

  await put(key, { receivedAt: norm.receivedAt, status: "received", normalized: norm, raw: body });

  // Everything above is O(1) in-memory, so we are well inside the 5s window.
  // When enrichment (fetching the full drawing/activity from the REST API)
  // gets added, it belongs AFTER this response, on a queue — not inline.
  return json(200, { ok: true, eventId: norm.id, kind: norm.kind, storage: await storageStatus() });
};
