/**
 * Sanity-checks the transform + notify-routing pipeline with fake-but-shaped
 * data, no Procore account or network access required. Run with:
 *   node test/transform.test.js
 *
 * This does NOT test the OAuth flow or the webhook HTTP endpoint — only
 * the pure logic in transform.js + notifyMap.js, which is the part you can
 * verify before you've registered a Procore app at all.
 */

const { transformDrawingRevision, transformScheduleActivity } = require("../src/transform");

const sampleDrawing = {
  id: 9931,
  number: "E-118",
  title: "Electrical — Data Hall 3",
  discipline: "Electrical",
  area: "Data Hall 3",
  revision: "Rev C",
  superseded_revision: "Rev B",
  uploaded_by: { name: "V. Alvarez (EOR)" },
};

const sampleSchedule = {
  id: 4471,
  name: "Rough-in electrical — Generator Yard",
  wbs_path: "Generator Yard",
  finish_date: "2026-08-04",
  updated_finish_date: "2026-08-07",
  critical_path: true,
};

function check(label, condition) {
  console.log(`${condition ? "PASS" : "FAIL"} — ${label}`);
  if (!condition) process.exitCode = 1;
}

const drawingPacket = transformDrawingRevision(sampleDrawing, { drawingId: sampleDrawing.id });
console.log("\nDrawing packet:", JSON.stringify(drawingPacket, null, 2));
check("drawing packet flags high priority on a real revision bump", drawingPacket.priority === "high");
check("drawing packet routes to the Data Hall 3 crew from crew-map.json", drawingPacket.notify === "Crew A — Feeders");

const schedulePacket = transformScheduleActivity(sampleSchedule, { activityId: sampleSchedule.id });
console.log("\nSchedule packet:", JSON.stringify(schedulePacket, null, 2));
check("schedule packet flags high priority on critical path", schedulePacket.priority === "high");
check(
  "schedule packet routes to the Generator Yard crew from crew-map.json",
  schedulePacket.notify === "Startup & Commissioning"
);

console.log("\nDone. Edit crew-map.json and rerun to confirm your own routing rules resolve correctly.");
