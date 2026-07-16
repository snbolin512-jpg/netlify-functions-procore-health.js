exports.handler = async function (event) {
  const qs = event.queryStringParameters || {};
  const kind = qs.kind === "schedule" ? "schedule" : "drawing";
  const payload = kind === "schedule" ? {
    ok: true, source: "procore-mock", event_type: "schedule.update.created", project_id: "CMH-232",
    schedule: { id: "SCH-MCB-001", name: "Mission Critical Baseline Schedule", revision: "REV-04",
      changed_activities: [
        { id: "A-1020", name: "Energize MSB-1", critical_path: true, shift_days: 5 },
        { id: "A-1045", name: "L2 QA/QC Walkdown", critical_path: false, shift_days: 2 }
      ]}
  } : {
    ok: true, source: "procore-mock", event_type: "drawing.revision.created", project_id: "CMH-232",
    drawing: { id: "DWG-E6.0", number: "E6.0", title: "One-Line / Gear Schedule", revision: "REV-04", discipline: "Electrical",
      changed_scope: ["gear schedule revised", "possible feeder / procurement impact", "review CO/RFI exposure"] }
  };
  return { statusCode: 200, headers: { "content-type": "application/json", "access-control-allow-origin": "*" }, body: JSON.stringify(payload, null, 2) };
};