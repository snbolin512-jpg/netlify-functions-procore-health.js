/**
 * Stores workable packets (the normalized output of transform.js) so the
 * OhmBoy frontend can poll GET /api/packets. Same caveat as tokenStore.js:
 * file-based, fine for one instance, swap for a real DB before you scale.
 */

const fs = require("fs");
const path = require("path");

const PACKET_FILE = path.join(__dirname, "..", ".packets.json");
const MAX_PACKETS = 500;

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(PACKET_FILE, "utf8"));
  } catch {
    return [];
  }
}

function addPacket(packet) {
  const all = readAll();
  all.unshift(packet);
  const trimmed = all.slice(0, MAX_PACKETS);
  fs.writeFileSync(PACKET_FILE, JSON.stringify(trimmed, null, 2));
  return packet;
}

/** Returns packets, optionally only those received after `sinceIso`. */
function listPackets(sinceIso) {
  const all = readAll();
  if (!sinceIso) return all;
  const since = new Date(sinceIso).getTime();
  return all.filter((p) => new Date(p.receivedAt).getTime() > since);
}

module.exports = { addPacket, listPackets };
