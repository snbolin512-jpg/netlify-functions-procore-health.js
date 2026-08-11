/**
 * Decides who a packet goes to. Reads crew-map.json fresh on every call
 * (cheap for a small file, and it means editing crew-map.json takes effect
 * immediately with no server restart) rather than caching it at boot.
 *
 * Lookup order for a drawing/general packet: area match, then discipline
 * match, then the global default.
 * Schedule packets fall back to `scheduleDefault` instead of `default`,
 * since "who owns this area's electrical work" and "who owns the
 * schedule" are usually different people.
 */

const fs = require("fs");
const path = require("path");

const MAP_FILE = path.join(__dirname, "..", "crew-map.json");

function loadMap() {
  try {
    return JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  } catch (err) {
    console.warn("[notifyMap] Couldn't read crew-map.json, using bare fallback.", err.message);
    return { byArea: {}, byDiscipline: {}, default: "Project Engineer", scheduleDefault: "Superintendent" };
  }
}

function resolveNotify({ area, discipline, kind }) {
  const map = loadMap();

  if (area && map.byArea && map.byArea[area]) {
    return map.byArea[area];
  }
  if (discipline && map.byDiscipline && map.byDiscipline[discipline]) {
    return map.byDiscipline[discipline];
  }
  if (kind === "schedule") {
    return map.scheduleDefault || map.default || "Project Engineer";
  }
  return map.default || "Project Engineer";
}

module.exports = { resolveNotify };
