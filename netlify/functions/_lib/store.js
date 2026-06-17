const crypto = require("crypto");

const STORE_NAME = "ohmboy-v020-full-restore";
const MEMORY_KEY = "__OHMBOY_V020_MEMORY__";
const EVENT_PREFIX = "event:";
const PACKET_PREFIX = "packet:";
const RAW_PREFIX = "raw:";
let lastBlobError = null;

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "OHM") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,x-ohmboy-signature,x-procore-signature,x-procore-event,x-ohmboy-test"
    },
    body: JSON.stringify(body, null, 2)
  };
}

function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (err) {
    return { rawBody: event.body };
  }
}

async function getBlobStore() {
  try {
    const mod = await import("@netlify/blobs");
    const store = mod.getStore({ name: STORE_NAME, consistency: "strong" });
    lastBlobError = null;
    return store;
  } catch (err) {
    lastBlobError = {
      name: err && err.name ? err.name : "BlobStoreError",
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
  const store = await getBlobStore();
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
    warning: "Netlify Blobs did not load. Memory fallback does not persist between function calls.",
    error: lastBlobError
  };
}

async function put(key, value) {
  const store = await getBlobStore();
  if (store) {
    await store.setJSON(key, value);
    return { backend: "netlify-blobs", durable: true, key };
  }
  memoryStore()[key] = value;
  return { backend: "memory-fallback", durable: false, key, error: lastBlobError };
}

async function get(key) {
  const store = await getBlobStore();
  if (store) {
    try {
      return await store.get(key, { type: "json", consistency: "strong" });
    } catch (err) {
      return null;
    }
  }
  return memoryStore()[key] || null;
}

async function del(key) {
  const store = await getBlobStore();
  if (store) {
    await store.delete(key);
    return { backend: "netlify-blobs", durable: true, key };
  }
  delete memoryStore()[key];
  return { backend: "memory-fallback", durable: false, key };
}

async function listKeys(prefix) {
  const store = await getBlobStore();
  if (store) {
    const list = await store.list({ prefix });
    return (list.blobs || []).map((b) => b.key);
  }
  return Object.keys(memoryStore()).filter((k) => k.startsWith(prefix));
}

async function list(prefix, limit = 100) {
  const keys = await listKeys(prefix);
  const rows = [];
  for (const key of keys) {
    const row = await get(key);
    if (row) rows.push(row);
  }
  rows.sort((a, b) => String(b.updatedAt || b.receivedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.receivedAt || a.createdAt || "")));
  return rows.slice(0, limit);
}

async function clear(prefix) {
  const keys = await listKeys(prefix);
  for (const key of keys) await del(key);
  return keys.length;
}

async function roundTrip() {
  const id = uid("OHM-ROUNDTRIP");
  const key = `health:${id}`;
  const payload = {
    id,
    key,
    createdAt: nowIso(),
    message: "OhmBoy V0.20 full restore storage roundtrip"
  };

  const write = await put(key, payload);
  const readBack = await get(key);
  await del(key);
  const status = await storageStatus();
  const ok = Boolean(status.durable && readBack && readBack.id === id);

  return {
    ok,
    checkedAt: nowIso(),
    storage: status,
    write,
    readBack: readBack ? { id: readBack.id, key: readBack.key, createdAt: readBack.createdAt } : null
  };
}

function signatureCheck(event) {
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

function normalizeProcoreLike(raw = {}) {
  const type = raw.eventType || raw.event_type || raw.type || "unknown.event";
  const obj = raw.object || raw.drawing || raw.schedule || raw.data || {};
  const lower = String(type).toLowerCase();
  const isSchedule = lower.includes("schedule");
  const isDrawing = lower.includes("drawing");

  let title = `API Event: ${type}`;
  let summary = `Received ${type}.`;
  let severity = "MODERATE";
  let recommendedBranches = ["Risk / Constraint", "Coordination"];
  let moneyAtRisk = 6500;

  if (isDrawing) {
    title = `Procore Drawing REV: ${obj.drawingNumber || obj.number || "Unknown"} — ${obj.title || "Drawing Revision"}`;
    summary = `${obj.revision || "REV"} detected from Procore/API. Review for scope, procurement, schedule, and CO exposure.`;
    severity = "HIGH";
    recommendedBranches = ["RFI", "CO Candidate", "Risk / Constraint", "Procurement Check", "Schedule Review"];
    moneyAtRisk = 42000;
  }

  if (isSchedule) {
    title = `Procore Schedule Update: ${obj.name || obj.id || "Schedule File"}`;
    summary = obj.change || "Schedule update requires baseline comparison.";
    severity = "HIGH";
    recommendedBranches = ["Risk / Constraint", "Coordination", "Manpower Review", "CO Candidate"];
    moneyAtRisk = 30000;
  }

  return {
    id: uid("OHM-NORM"),
    source: raw.source || "procore",
    eventType: type,
    detectedAt: raw.detectedAt || nowIso(),
    packet: {
      type: isSchedule ? "SCH" : "REV",
      title,
      summary,
      severity,
      criticalPath: isSchedule || isDrawing,
      procurementImpact: isDrawing,
      manpowerImpact: isSchedule,
      rfiNeeded: isDrawing,
      score: 0,
      detectedAt: raw.detectedAt || nowIso(),
      source: raw.source || "procore",
      moneyAtRisk,
      recommendedBranches
    }
  };
}

function drawingMock() {
  return {
    source: "procore",
    eventType: "drawing.revision.created",
    detectedAt: nowIso(),
    projectId: "MC-DEMO-001",
    object: {
      id: uid("DWG"),
      drawingNumber: "E6.0",
      title: "One-Line / Gear Schedule",
      revision: "REV-04",
      changedScope: [
        "ATS note revised",
        "main electrical room feeder path adjusted",
        "possible procurement/startup impact"
      ]
    }
  };
}

function scheduleMock() {
  return {
    source: "procore",
    eventType: "schedule.update.created",
    detectedAt: nowIso(),
    projectId: "MC-DEMO-001",
    object: {
      id: uid("SCH"),
      name: "Mission Critical Baseline Schedule",
      revision: "REV-07",
      change: "Energize MSB-1 shifted by five days; startup sequence and L2 QA/QC walkdown need review."
    }
  };
}

module.exports = {
  STORE_NAME,
  EVENT_PREFIX,
  PACKET_PREFIX,
  RAW_PREFIX,
  nowIso,
  uid,
  json,
  parseJsonBody,
  storageStatus,
  put,
  get,
  del,
  list,
  clear,
  roundTrip,
  signatureCheck,
  normalizeProcoreLike,
  drawingMock,
  scheduleMock
};
