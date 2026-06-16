const crypto = require("crypto");

const STORE_NAME = "ohmboy-command-center";
const EVENT_PREFIX = "event:";
const PACKET_PREFIX = "packet:";
const HEALTH_KEY = "health:last-roundtrip";
const MEMORY_KEY = "__OHMBOY_CLEAN_REWRITE_MEMORY__";

let lastBlobError = null;

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "OHM") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,x-ohmboy-signature,x-ohmboy-test,x-procore-signature,x-procore-event"
    },
    body: JSON.stringify(body, null, 2)
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (err) {
    return { rawBody: event.body };
  }
}

async function getNetlifyStore() {
  try {
    const mod = await import("@netlify/blobs");
    // Strong consistency is intentional here because this is an intake monitor.
    // We need a sim event written by one function call to be visible immediately
    // to the following refresh call.
    const store = mod.getStore({ name: STORE_NAME, consistency: "strong" });
    lastBlobError = null;
    return store;
  } catch (err) {
    lastBlobError = {
      name: err && err.name ? err.name : "BlobLoadError",
      message: err && err.message ? err.message : String(err),
      code: err && err.code ? err.code : null
    };
    return null;
  }
}

function memoryStore() {
  globalThis[MEMORY_KEY] = globalThis[MEMORY_KEY] || {};
  return globalThis[MEMORY_KEY];
}

async function storageStatus() {
  const store = await getNetlifyStore();
  if (store) {
    return {
      backend: "netlify-blobs",
      durable: true,
      store: STORE_NAME,
      consistency: "strong"
    };
  }
  return {
    backend: "memory-fallback",
    durable: false,
    store: STORE_NAME,
    warning: "Netlify Blobs is not active. Memory fallback will not persist across independent function calls.",
    error: lastBlobError
  };
}

async function putJson(key, value) {
  const store = await getNetlifyStore();
  if (store) {
    await store.setJSON(key, value);
    return { backend: "netlify-blobs", durable: true, key, store: STORE_NAME };
  }
  memoryStore()[key] = value;
  return { backend: "memory-fallback", durable: false, key, error: lastBlobError };
}

async function getJson(key) {
  const store = await getNetlifyStore();
  if (store) {
    try {
      return await store.get(key, { type: "json", consistency: "strong" });
    } catch (err) {
      return null;
    }
  }
  return memoryStore()[key] || null;
}

async function deleteKey(key) {
  const store = await getNetlifyStore();
  if (store) {
    await store.delete(key);
    return { backend: "netlify-blobs", durable: true, key };
  }
  delete memoryStore()[key];
  return { backend: "memory-fallback", durable: false, key };
}

async function listKeys(prefix) {
  const store = await getNetlifyStore();
  if (store) {
    const list = await store.list({ prefix });
    return (list.blobs || []).map((b) => b.key);
  }
  return Object.keys(memoryStore()).filter((key) => key.startsWith(prefix));
}

async function listJson(prefix, limit = 100) {
  const keys = await listKeys(prefix);
  const rows = [];
  for (const key of keys) {
    const row = await getJson(key);
    if (row) rows.push(row);
  }
  rows.sort((a, b) => String(b.updatedAt || b.receivedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.receivedAt || a.createdAt || "")));
  return rows.slice(0, limit);
}

async function clearPrefix(prefix) {
  const keys = await listKeys(prefix);
  for (const key of keys) {
    await deleteKey(key);
  }
  return keys.length;
}

async function roundTrip() {
  const startedAt = nowIso();
  const id = uid("OHM-HEALTH");
  const key = `health:${id}`;
  const payload = {
    id,
    key,
    startedAt,
    message: "OhmBoy durable storage roundtrip probe"
  };

  const write = await putJson(key, payload);
  const read = await getJson(key);
  await deleteKey(key);

  const status = await storageStatus();
  const ok = Boolean(status.durable && read && read.id === id);

  const result = {
    ok,
    checkedAt: nowIso(),
    storage: status,
    write,
    readBack: read ? { id: read.id, key: read.key, startedAt: read.startedAt } : null,
    expected: "backend must be netlify-blobs and readBack.id must match write id"
  };

  await putJson(HEALTH_KEY, result);
  return result;
}

function normalizeEvent(raw = {}, headers = {}) {
  const headerLookup = (name) => headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  const eventType = raw.event_type || raw.type || raw.event || headerLookup("x-procore-event") || "unknown.event";
  const projectId = raw.project_id || raw.projectId || raw.project?.id || "MC-DEMO-001";
  const companyId = raw.company_id || raw.companyId || raw.company?.id || "UNKNOWN-COMPANY";

  const lower = String(eventType).toLowerCase();
  const isDrawing = lower.includes("drawing");
  const isSchedule = lower.includes("schedule");
  const isRfi = lower.includes("rfi");
  const isCo = lower.includes("change") || lower.includes("co.");

  let title = `API Event — ${eventType}`;
  let summary = `Received ${eventType} for project ${projectId}.`;
  let discipline = raw.discipline || "Electrical";
  let revision = raw.revision || "";
  let sourceRecord = {};

  if (isDrawing) {
    const d = raw.drawing || raw.data?.drawing || raw.resource || raw.data || {};
    sourceRecord = d;
    title = `Drawing Revision — ${d.number || d.name || d.id || "Unknown Drawing"}`;
    revision = d.revision || d.current_revision || revision || "";
    discipline = d.discipline || discipline || "Electrical";
    const changedScope = Array.isArray(d.changed_scope) ? d.changed_scope.join("; ") : "";
    summary = `${d.title || d.name || "Drawing"} ${revision ? `moved to ${revision}` : "revision received"}.${changedScope ? " Changes: " + changedScope : ""}`;
  }

  if (isSchedule) {
    const s = raw.schedule || raw.data?.schedule || raw.resource || raw.data || {};
    sourceRecord = s;
    const activities = Array.isArray(s.changed_activities) ? s.changed_activities : [];
    const critical = activities.filter((a) => a.critical_path).length;
    title = `Schedule Revision — ${s.name || s.id || "Project Schedule"}`;
    revision = s.revision || revision || "";
    discipline = "Schedule";
    summary = `${s.name || "Schedule"} ${revision ? `moved to ${revision}` : "revision received"}. ${activities.length} changed activities; ${critical} critical path impacts.`;
  }

  const impacts = {
    schedule: isSchedule ? "potential critical path impact" : isDrawing ? "review required" : "unknown",
    cost: isDrawing || isCo ? "possible CO exposure" : "unknown",
    procurement: isDrawing ? "check long-lead/equipment impact" : "unknown",
    manpower: isSchedule ? "possible resequence/compression" : "unknown",
    quality: "QA/QC review required"
  };

  let score = 25;
  if (isDrawing) score += 20;
  if (isSchedule) score += 25;
  if (isRfi) score += 12;
  if (isCo) score += 18;
  if (summary.toLowerCase().includes("critical")) score += 18;
  if (summary.toLowerCase().includes("switchboard") || summary.toLowerCase().includes("msb") || summary.toLowerCase().includes("ups")) score += 12;
  score = Math.min(100, score);

  return {
    normalizedAt: nowIso(),
    source: raw.source || headerLookup("x-ohmboy-source") || (headerLookup("x-procore-event") ? "procore" : "simulation"),
    eventType,
    projectId,
    companyId,
    title,
    summary,
    discipline,
    revision,
    sourceRecord,
    impacts,
    riskScore: score,
    recommendedAction: score >= 75 ? "create packet immediately" : score >= 50 ? "PM review today" : "monitor/review"
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

module.exports = {
  STORE_NAME,
  EVENT_PREFIX,
  PACKET_PREFIX,
  HEALTH_KEY,
  nowIso,
  uid,
  response,
  parseBody,
  storageStatus,
  roundTrip,
  putJson,
  getJson,
  deleteKey,
  listJson,
  clearPrefix,
  normalizeEvent,
  verifySignatureIfConfigured
};
