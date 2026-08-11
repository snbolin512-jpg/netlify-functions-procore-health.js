const { json } = require("./_lib/response.js");
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
  const kind = (event.queryStringParameters || {}).kind === "schedule" ? "schedule" : "drawing";
  const payload = kind === "schedule" ? {
    ok: true,
    source: "procore-mock",
    event_type: "schedule.activity.updated",
    project_id: process.env.PROCORE_PROJECT_ID || "sandbox-project",
    schedule: {
      id: "SCH-MCB-001",
      name: "Mission Critical Baseline Schedule",
      revision: "REV-04",
      changed_activities: [
        { id: "A-1020", name: "Energize MSB-1", critical_path: true, shift_days: 5 }
      ]
    }
  } : {
    ok: true,
    source: "procore-mock",
    event_type: "drawings.revision.created",
    project_id: process.env.PROCORE_PROJECT_ID || "sandbox-project",
    drawing: {
      id: "DWG-E6.0",
      number: "E6.0",
      title: "One-Line / Gear Schedule",
      revision: "REV-04",
      discipline: "Electrical",
      changed_scope: ["gear schedule revised", "possible feeder / procurement impact", "review CO/RFI exposure"]
    }
  };
  return json(200, payload);
};