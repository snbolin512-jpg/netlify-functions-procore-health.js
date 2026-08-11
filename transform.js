/**
 * Turns a fetched Procore resource into a "workable packet" — the same
 * shape the OhmBoy frontend's PacketCard component renders. Field names
 * below are best-guess based on Procore's public API docs; once you see a
 * real payload in your logs, adjust the `raw.xxx` lookups to match exactly
 * what your account/API version actually returns.
 */

const { resolveNotify } = require("./notifyMap");

function safe(val, fallback = "—") {
  return val === undefined || val === null || val === "" ? fallback : val;
}

function transformDrawingRevision(raw, meta) {
  const revisionNumber = safe(raw.revision ?? raw.current_revision ?? raw.revision_number, "Rev ?");
  const priorRevision = safe(raw.superseded_revision ?? raw.previous_revision, null);
  const isSuperseding = priorRevision && priorRevision !== revisionNumber;
  const area = safe(raw.area ?? raw.location, "Unassigned area");
  const discipline = safe(raw.discipline ?? raw.trade ?? raw.drawing_type);

  return {
    id: `drawing_${raw.id ?? meta.drawingId}`,
    kind: "drawing",
    priority: isSuperseding ? "high" : "normal",
    discipline,
    headline: `${safe(raw.number ?? raw.drawing_number)} bumped to ${revisionNumber}`,
    summary: isSuperseding
      ? `${safe(raw.title)} superseded ${priorRevision}. Uploaded by ${safe(raw.uploaded_by?.name ?? raw.created_by?.name)}.`
      : `${safe(raw.title)} uploaded by ${safe(raw.uploaded_by?.name ?? raw.created_by?.name)}.`,
    area,
    action: isSuperseding
      ? "Pull the new sheet before doing more work in this area."
      : "New sheet available — review when convenient.",
    notify: resolveNotify({ area, discipline, kind: "drawing" }),
    receivedAt: new Date().toISOString(),
    raw,
  };
}

function transformScheduleActivity(raw, meta) {
  const oldFinish = safe(raw.finish_date ?? raw.old_finish_date);
  const newFinish = safe(raw.updated_finish_date ?? raw.finish_date);
  const criticalPath = Boolean(raw.critical_path ?? raw.is_critical);
  const area = safe(raw.wbs_path ?? raw.location, "—");

  return {
    id: `schedule_${raw.id ?? meta.activityId}`,
    kind: "schedule",
    priority: criticalPath ? "high" : "normal",
    discipline: "Schedule",
    headline: `${safe(raw.name ?? raw.activity_name)} updated`,
    summary: `Finish date now ${newFinish}${oldFinish !== newFinish ? ` (was ${oldFinish})` : ""}.${
      criticalPath ? " On critical path." : ""
    }`,
    area,
    action: criticalPath ? "Flag to the super — critical path impact." : "Note for the next look-ahead meeting.",
    notify: resolveNotify({ area, kind: "schedule" }),
    receivedAt: new Date().toISOString(),
    raw,
  };
}

module.exports = { transformDrawingRevision, transformScheduleActivity };
