/**
 * Stores the Procore access/refresh token pair.
 *
 * This is a flat JSON file on disk, which is fine for a single-instance
 * deploy (Render/Railway/a single VM) but WILL NOT WORK if you scale to
 * multiple instances or a serverless platform with ephemeral disk (e.g.
 * Vercel functions wipe the filesystem between invocations). If you deploy
 * there, swap this module for a real store — Postgres, Redis, DynamoDB,
 * whatever you've already got — and keep the same get/set function shapes
 * so nothing else in the app has to change.
 */

const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(__dirname, "..", ".tokens.json");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
  } catch {
    return null;
  }
}

function saveTokens({ access_token, refresh_token, expires_in }) {
  const record = {
    access_token,
    refresh_token,
    // expires_in is seconds from Procore; store an absolute expiry instead
    // so we don't need to remember when the response arrived.
    expires_at: Date.now() + Number(expires_in) * 1000,
  };
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(record, null, 2));
  return record;
}

function getTokens() {
  return readAll();
}

function clearTokens() {
  try {
    fs.unlinkSync(TOKEN_FILE);
  } catch {
    /* nothing to clear */
  }
}

module.exports = { saveTokens, getTokens, clearTokens };
