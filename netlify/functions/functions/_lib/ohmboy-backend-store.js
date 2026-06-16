
const crypto = require("crypto");

const STORE_NAME = "ohmboy-api-events";
const GLOBAL_KEY = "__ohmboy_local_event_store__";

function nowIso() { return new Date().toISOString(); }
function id(prefix = "EVT") { return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`; }

async function getBlobStore() {
  try {
    const { getStore } = require("@netlify/blobs");
    return getStore(STORE_NAME);
  } catch (err) {
    return null;
  }
}

function localStore() {
  globalThis[GLOBAL_KEY] = globalThis[GLOBAL_KEY] || {};
  return globalThis[GLOBAL_KEY];
}

async function putJson(key, value) {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON(key, value);
    return { backend: "netlify-blobs" };
  }
  localStore()[key] = value;
  return { backend: "memory-fallback" };
}

async function getJson(key) {
  const store = await getBlobStore();
  if (store) {
    try { return await store.get(key, { type: "json" }); } catch (err) { return null; }
  }
  return localStore()[key] || null;
}

async function deleteKey(key) {
  const store = await getBlobStore();
  if (store) return store.delete(key);
  delete localStore()[key];
}

async function listEventKeys() {
  const store = await getBlobStore();
  if (store) {
    const list = await store.list({ prefix: "event:" });
    return (list.blobs || []).map((b) => b.key);
  }
  return Object.keys(localStore()).filter((k) => k.startsWith("event:"));
}

async function listEvents(limit = 50) {
  const keys = await listEventKeys();
  const events = [];
  for (const key of keys) {
    const row = await getJson(key);
    if (row) events.push(row);
  }
  events.sort((a,b) => String(b.receivedAt||"").localeCompare(String(a.receivedAt||"")));
  return events.slice(0, limit);
}

async function clearEvents() {
  const keys = await listEventKeys();
  for (const key of keys) await deleteKey(key);
  return keys.length;
}

function parseBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); }
  catch (err) { return { rawBody: event.body }; }
}

function normalizeEvent(raw = {}, headers = {}) {
  const eventType = raw.event_type || raw.type || raw.event || headers["x-procore-event"] || "unknown.event";
  const projectId = raw.project_id || raw.projectId || raw.project?.id || "unknown-project";
  const companyId = raw.company_id || raw.companyId || raw.company?.id || "unknown-company";
  const lower = String(eventType).toLowerCase();
  const isDrawing = lower.includes("drawing");
  const isSchedule = lower.includes("schedule");

  let title = `API Event — ${eventType}`;
  let summary = `Received ${eventType} for project ${projectId}.`;
  let discipline = "Unknown";
  let revision = raw.revision || "";

  if (isDrawing) {
    const d = raw.drawing || raw.data?.drawing || raw.resource || raw.data || {};
    title = `Drawing Revision — ${d.number || d.name || d.id || "Unknown Drawing"}`;
    revision = d.revision || d.current_revision || revision || "";
    discipline = d.discipline || raw.discipline || "Electrical";
    const changedScope = Array.isArray(d.changed_scope) ? d.changed_scope.join("; ") : "";
    summary = `${d.title || d.name || "Drawing"} ${revision ? `moved to ${revision}` : "revision received"}.${changedScope ? " Changes: " + changedScope : ""}`;
  }

  if (isSchedule) {
    const s = raw.schedule || raw.data?.schedule || raw.resource || raw.data || {};
    const activities = Array.isArray(s.changed_activities) ? s.changed_activities : [];
    const critical = activities.filter((a) => a.critical_path).length;
    title = `Schedule Revision — ${s.name || s.id || "Project Schedule"}`;
    revision = s.revision || revision || "";
    discipline = "Schedule";
    summary = `${s.name || "Schedule"} ${revision ? `moved to ${revision}` : "revision received"}. ${activities.length} changed activities; ${critical} critical path impacts.`;
  }

  const impacts = {
    schedule: isSchedule ? "potential critical path impact" : isDrawing ? "review required" : "unknown",
    cost: isDrawing ? "possible CO/RFI exposure" : "unknown",
    procurement: isDrawing ? "check long-lead/equipment impact" : "unknown",
    manpower: isSchedule ? "possible resequence/compression" : "unknown"
  };

  let riskScore = 25;
  if (isDrawing) riskScore += 20;
  if (isSchedule) riskScore += 25;
  if (summary.toLowerCase().includes("critical")) riskScore += 18;
  if (summary.toLowerCase().includes("switchboard") || summary.toLowerCase().includes("msb")) riskScore += 12;
  riskScore = Math.min(100, riskScore);

  return {
    normalizedAt: nowIso(),
    source: raw.source || headers["x-ohmboy-source"] || (headers["x-procore-event"] ? "procore" : "api"),
    eventType,
    projectId,
    companyId,
    title,
    summary,
    discipline,
    revision,
    impacts,
    riskScore,
    recommendedAction: riskScore >= 75 ? "create packet immediately" : riskScore >= 50 ? "PM review today" : "monitor/review"
  };
}

function verifySignatureIfConfigured(event) {
  const secret = process.env.OHMBOY_WEBHOOK_SECRET || "";
  if (!secret) return { ok: true, mode: "not-configured" };
  const signature = event.headers?.["x-ohmboy-signature"] || event.headers?.["x-procore-signature"] || "";
  if (!signature) return { ok: false, error: "Missing webhook signature" };
  const expected = crypto.createHmac("sha256", secret).update(event.body || "").digest("hex");
  const clean = String(signature).replace(/^sha256=/, "");
  if (expected.length !== clean.length) return { ok: false, error: "Invalid webhook signature length" };
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean));
  return ok ? { ok: true, mode: "verified" } : { ok: false, error: "Invalid webhook signature" };
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,x-ohmboy-signature,x-ohmboy-test,x-procore-signature,x-procore-event"
    },
    body: JSON.stringify(body, null, 2)
  };
}

module.exports = { nowIso, id, putJson, getJson, listEvents, clearEvents, normalizeEvent, parseBody, verifySignatureIfConfigured, response };
