
import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "ohmboy-api-events-v2";

export function nowIso() {
  return new Date().toISOString();
}

export function id(prefix = "EVT") {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

export function store() {
  return getStore(STORE_NAME);
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,x-ohmboy-signature,x-ohmboy-test,x-procore-signature,x-procore-event"
    }
  });
}

export async function parseJson(req) {
  const text = await req.text();
  if (!text) return {};
  try { return JSON.parse(text); }
  catch (err) { return { rawBody: text }; }
}

export async function putJson(key, value) {
  const s = store();
  await s.setJSON(key, value);
  return { backend: "netlify-blobs-modern", durable: true, store: STORE_NAME };
}

export async function getJson(key) {
  const s = store();
  try { return await s.get(key, { type: "json" }); }
  catch (err) { return null; }
}

export async function listEvents(limit = 50) {
  const s = store();
  const list = await s.list({ prefix: "event:" });
  const keys = (list.blobs || []).map((b) => b.key);
  const rows = [];
  for (const key of keys) {
    const row = await getJson(key);
    if (row) rows.push(row);
  }
  rows.sort((a, b) => String(b.receivedAt || "").localeCompare(String(a.receivedAt || "")));
  return rows.slice(0, limit);
}

export async function clearEvents() {
  const s = store();
  const list = await s.list({ prefix: "event:" });
  const keys = (list.blobs || []).map((b) => b.key);
  for (const key of keys) await s.delete(key);
  return keys.length;
}

export function normalizeEvent(raw = {}, headers = new Headers()) {
  const eventType = raw.event_type || raw.type || raw.event || headers.get("x-procore-event") || "unknown.event";
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
    source: raw.source || headers.get("x-ohmboy-source") || (headers.get("x-procore-event") ? "procore" : "api"),
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

export async function verifySignatureIfConfigured(req, rawBody = "") {
  const secret = process.env.OHMBOY_WEBHOOK_SECRET || "";
  if (!secret) return { ok: true, mode: "not-configured" };
  const signature = req.headers.get("x-ohmboy-signature") || req.headers.get("x-procore-signature") || "";
  if (!signature) return { ok: false, error: "Missing webhook signature" };
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const clean = String(signature).replace(/^sha256=/, "");
  if (expected.length !== clean.length) return { ok: false, error: "Invalid webhook signature length" };
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean));
  return ok ? { ok: true, mode: "verified" } : { ok: false, error: "Invalid webhook signature" };
}
