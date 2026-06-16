const fs = require("fs");
const path = require("path");

const required = [
  "index.html",
  "netlify.toml",
  "package.json",
  "netlify/functions/ohmboy-health.js",
  "netlify/functions/ohmboy-events.js",
  "netlify/functions/ohmboy-intake.js",
  "netlify/functions/ohmboy-clear.js",
  "netlify/functions/ohmboy-promote.js",
  "netlify/functions/ohmboy-packet-ledger.js",
  "netlify/functions/_lib/store.js"
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
for (const file of required) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error("MISSING:", file);
    ok = false;
  }
}
for (const file of forbidden) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.error("FORBIDDEN OLD FILE PRESENT:", file);
    ok = false;
  }
}

const store = fs.readFileSync(path.join(process.cwd(), "netlify/functions/_lib/store.js"), "utf8");
if (!store.includes('await import("@netlify/blobs")')) {
  console.error("store.js does not use dynamic @netlify/blobs import");
  ok = false;
}
if (!store.includes('consistency: "strong"')) {
  console.error("store.js does not use strong consistency");
  ok = false;
}
if (!ok) process.exit(1);
console.log("OhmBoy clean rewrite validation passed.");
