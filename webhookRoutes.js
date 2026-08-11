const express = require("express");
const config = require("./config");
const { fetchDrawingRevision, fetchScheduleActivity } = require("./procoreClient");
const { transformDrawingRevision, transformScheduleActivity } = require("./transform");
const { addPacket } = require("./packetStore");

const router = express.Router();

/**
 * Procore does NOT sign webhook bodies with an HMAC. Instead, when you
 * create the Hook in Procore (Project Admin > Webhooks > Create Hook),
 * there's an optional "Authorization Header" field — whatever value you
 * put there gets sent back on the Authorization header of every POST.
 * Set PROCORE_WEBHOOK_SECRET to that same value and we just compare it.
 */
function isAuthentic(req) {
  return req.get("Authorization") === config.webhookSecret;
}

/**
 * Actually go fetch + transform + store. Runs after we've already ack'd
 * the webhook, because Procore times out the delivery after 5 seconds and
 * we'd rather not race a slow downstream API call against that.
 */
async function processEvent(event) {
  try {
    const resourceName = event.resource_name || event.resource || "";
    const projectId = event.project_id || config.projectId;

    if (/drawing/i.test(resourceName)) {
      const drawingId = event.resource_id;
      const raw = await fetchDrawingRevision({ projectId, drawingId });
      const packet = transformDrawingRevision(raw, { drawingId });
      addPacket(packet);
      console.log(`[webhook] stored drawing packet ${packet.id}`);
    } else if (/schedule|activity/i.test(resourceName)) {
      const activityId = event.resource_id;
      const raw = await fetchScheduleActivity({ projectId, activityId });
      const packet = transformScheduleActivity(raw, { activityId });
      addPacket(packet);
      console.log(`[webhook] stored schedule packet ${packet.id}`);
    } else {
      console.log(`[webhook] ignored event for resource "${resourceName}" — not drawings or schedule.`);
    }
  } catch (err) {
    console.error("[webhook] failed to process event:", err);
    // In production: push this to a dead-letter queue or retry with backoff
    // instead of just logging it.
  }
}

router.post("/procore", express.json(), (req, res) => {
  if (!isAuthentic(req)) {
    return res.status(401).send("Bad or missing Authorization header.");
  }

  // Ack immediately — Procore's delivery times out at 5 seconds.
  res.status(200).send("ok");

  // Then do the actual work. If you expect high volume, swap this for a
  // real queue (SQS, a Redis list, etc.) instead of an in-process async call.
  processEvent(req.body);
});

module.exports = router;
