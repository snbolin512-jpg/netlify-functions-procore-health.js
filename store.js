/* Shared helpers for OhmBoy's Netlify functions.
   ---------------------------------------------------------------------------
   The previous version exported only the storage calls, while
   procore-auth-start, procore-auth-callback and procore-process-event all
   imported { json, parseJsonBody, normalizeProcoreLike, put, EVENT_PREFIX,
   uid, nowIso, storageStatus } from it. Those names were undefined, so all
   three functions threw "json is not a function" on every invocation. The
   missing helpers are defined here.

   STORAGE IS IN-MEMORY AND NOT DURABLE. Netlify functions are stateless and
   cold-start, so anything written here disappears. It is fine for wiring and
   health checks; move to a real store before you depend on webhook data.
   Everything below routes through get/put/del so that swap is one file. */

const EVENT_PREFIX = "event:";
const TOKEN_PREFIX = "token:";

const GLOBAL_KEY = "__OHMBOY_MEMORY_STORE__";
function memory() {
  globalThis[GLOBAL_KEY] = globalThis[GLOBAL_KEY] || {};
  return globalThis[GLOBAL_KEY];
}

const nowIso = () => new Date().toISOString();

function uid(prefix) {
  return (
    (prefix || "OHM") +
    "-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(16).slice(2, 8).toUpperCase()
  );
}

/* ---- storage ---- */

async function put(key, value) {
  memory()[key] = value;
  return { backend: "memory", durable: false, key };
}
async function get(key) {
  return memory()[key] || null;
}
async function del(key) {
  delete memory()[key];
}
async function listKeys(prefix = "") {
  return Object.keys(memory()).filter((k) => k.startsWith(prefix));
}
async function listJSON(prefix = "", limit = 100) {
  return (await listKeys(prefix)).map((k) => memory()[k]).filter(Boolean).slice(0, limit);
}
async function clearPrefix(prefix = "") {
  const keys = await listKeys(prefix);
  for (const k of keys) delete memory()[k];
  return keys.length;
}
async function storageStatus() {
  return {
    backend: "memory",
    durable: false,
    keys: Object.keys(memory()).length,
    note: "Ephemeral. Netlify functions cold-start; swap this file for a real store before relying on persistence."
  };
}

/* Back-compat aliases — the older function files call these names. */
const setJSON = put;
const getJSON = get;
const deleteKey = del;
const diagnostic = storageStatus;

/* ---- http ---- */

const CORS = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization"
};

function json(statusCode, body, extraHeaders) {
  return {
    statusCode,
    headers: { ...CORS, ...(extraHeaders || {}) },
    body: JSON.stringify(body, null, 2)
  };
}

function redirect(location) {
  return { statusCode: 302, headers: { location }, body: "" };
}

function parseJsonBody(event) {
  const raw = event && event.body ? event.body : "";
  if (!raw) return {};
  try {
    return JSON.parse(
      event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf8") : raw
    );
  } catch {
    return { _unparsed: raw };
  }
}

/* Normalises a Procore-shaped webhook payload into the packet-ish shape the
   OhmBoy frontend already understands, so the transform layer has one input
   contract regardless of which resource fired. */
function normalizeProcoreLike(raw) {
  const body = raw || {};
  const evt = body.event || body;
  const resource = evt.resource_name || evt.resource || body.resource_name || "";
  const isSchedule = /schedule|activity|task/i.test(resource);
  const isDrawing = /drawing/i.test(resource);

  return {
    id: evt.id || evt.ulid || uid("OHM-EVT"),
    receivedAt: nowIso(),
    resourceName: resource || "unknown",
    resourceId: evt.resource_id ?? null,
    eventType: evt.event_type || body.event_type || body.type || "unknown",
    companyId: evt.company_id ?? body.company_id ?? null,
    projectId: evt.project_id ?? body.project_id ?? null,
    apiVersion: evt.api_version || body.api_version || null,
    timestamp: evt.timestamp || null,
    kind: isSchedule ? "schedule" : isDrawing ? "drawing" : "other",
    // Kept so loop-filtering can drop events this integration caused itself.
    sourceUserId: evt.source_user_id ?? null,
    sourceApplicationId: evt.source_application_id ?? null
  };
}

module.exports = {
  EVENT_PREFIX, TOKEN_PREFIX,
  uid, nowIso,
  put, get, del, listKeys, listJSON, clearPrefix, storageStatus,
  setJSON, getJSON, deleteKey, diagnostic,
  json, redirect, parseJsonBody, normalizeProcoreLike, CORS
};
