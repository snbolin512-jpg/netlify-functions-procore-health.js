const express = require("express");
const config = require("./src/config");
const procoreAuth = require("./src/procoreAuth");
const webhookRoutes = require("./src/webhookRoutes");
const { listPackets } = require("./src/packetStore");

const app = express();

// --- CORS (minimal, no extra dependency) ---
app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && (config.allowedOrigins.includes(origin) || config.allowedOrigins.includes("*"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (req, res) => {
  res.send("OhmBoy Procore backend is running. See README.md for setup.");
});

app.use("/auth/procore", procoreAuth);
app.use("/webhooks", webhookRoutes);

/**
 * This is what OhmBoy.jsx's pollProcoreRevisions() should call instead of
 * generating fake events. Optional ?since=<ISO timestamp> to only get
 * packets newer than the frontend's last poll.
 */
app.get("/api/packets", (req, res) => {
  const packets = listPackets(req.query.since);
  res.json({ packets });
});

app.listen(config.port, () => {
  console.log(`OhmBoy backend listening on http://localhost:${config.port}`);
  console.log(`Connect Procore once at http://localhost:${config.port}/auth/procore/login`);
});
