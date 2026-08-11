const crypto = require("crypto");
const { json } = require("./_lib/response.js");
const store = require("./_lib/store.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "POST required" });
  const raw = event.body || "";
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch (err) { body = { rawBody: raw }; }
  const secret = process.env.OHMBOY_WEBHOOK_SECRET || "";
  if (secret) {
    const sig = event.headers["x-ohmboy-signature"] || event.headers["x-procore-signature"] || "";
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const clean = String(sig).replace(/^sha256=/, "");
    if (!clean || clean.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(clean), Buffer.from(expected))) {
      return json(401, { ok: false, error: "Invalid webhook signature" });
    }
  }
  const key = "event:" + Date.now() + ":" + crypto.randomBytes(3).toString("hex");
  const record = {
    key,
    receivedAt: new Date().toISOString(),
    eventType: body.event_type || body.type || event.headers["x-procore-event"] || "unknown.event",
    body
  };
  const storage = await store.setJSON(key, record);
  return json(200, { ok: true, stored: key, storage, event: record });
};