const fs = require("fs");
const path = require("path");

const required = [
  "index.html",
  "package.json",
  "netlify.toml",
  "assets/jackson-ohmboy-source.png",
  "assets/jackson-ohmboy-v0163.png",
  "assets/omegaboy-mascot.png",
  "netlify/functions/_lib/store.js",
  "netlify/functions/procore-health.js",
  "netlify/functions/procore-mock-event.js",
  "netlify/functions/procore-webhook.js",
  "netlify/functions/procore-process-event.js",
  "netlify/functions/procore-auth-start.js",
  "netlify/functions/procore-auth-callback.js",
  "netlify/functions/ohmboy-health.js",
  "netlify/functions/ohmboy-events.js",
  "netlify/functions/ohmboy-clear.js"
];

const forbidden = [
  "netlify/functions/ohmboy-api-health.js",
  "netlify/functions/ohmboy-api-events.js",
  "netlify/functions/ohmboy-api-intake.js",
  "netlify/functions/ohmboy-api-health-v2.mjs",
  "netlify/functions/ohmboy-api-events-v2.mjs",
  "netlify/functions/ohmboy-api-intake-v2.mjs"
];

let ok = true;

for (const f of required) {
  if (!fs.existsSync(path.join(process.cwd(), f))) {
    console.error("MISSING", f);
    ok = false;
  }
}

for (const f of forbidden) {
  if (fs.existsSync(path.join(process.cwd(), f))) {
    console.error("FORBIDDEN OLD API FILE PRESENT", f);
    ok = false;
  }
}

const index = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
if (!index.includes("Jackson")) {
  console.error("Index does not contain Jackson reference.");
  ok = false;
}
if (!index.includes("Packet") || !index.includes("Financial") || !index.includes("CO/RFI")) {
  console.error("Index appears stripped; full UI markers missing.");
  ok = false;
}

const store = fs.readFileSync(path.join(process.cwd(), "netlify/functions/_lib/store.js"), "utf8");
if (!store.includes('await import("@netlify/blobs")')) {
  console.error("store.js missing dynamic @netlify/blobs import.");
  ok = false;
}
if (!store.includes('consistency: "strong"')) {
  console.error("store.js missing strong consistency.");
  ok = false;
}

if (!ok) process.exit(1);
console.log("OhmBoy V0.20 full restore validation passed.");
