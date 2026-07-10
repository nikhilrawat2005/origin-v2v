require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const { checkDeadlinesAndSendEmails } = require("./services/deadlineChecker");
const { verifyEmailConnection } = require("./services/emailService");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const CRON_SCHEDULE = process.env.DEADLINE_CHECK_CRON || "0 8 * * *"; // daily 08:00

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "origin-backend", time: new Date().toISOString() });
});

// Manual trigger — handy for testing without waiting for the cron.
app.post("/run-deadline-check", async (_req, res) => {
  try {
    const results = await checkDeadlinesAndSendEmails();
    res.json({ ok: true, results });
  } catch (err) {
    console.error("[server] Manual deadline check failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

async function start() {
  try {
    await verifyEmailConnection();
    console.log("[server] Gmail SMTP connection verified.");
  } catch (err) {
    console.warn("[server] Email connection not verified:", err.message);
    console.warn("[server] Check backend/.env — server will still start, but emails will fail until fixed.");
  }

  cron.schedule(CRON_SCHEDULE, () => {
    console.log(`[cron] Running scheduled deadline check (${new Date().toISOString()})`);
    checkDeadlinesAndSendEmails().catch((err) =>
      console.error("[cron] Deadline check failed:", err)
    );
  });
  console.log(`[server] Deadline check cron scheduled: "${CRON_SCHEDULE}"`);

  app.listen(PORT, () => {
    console.log(`[server] Origin backend listening on http://localhost:${PORT}`);
  });
}

start();
