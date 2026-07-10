const nodemailer = require("nodemailer");
const { buildDeadlineEmailHtml, buildDeadlineEmailSubject } = require("../templates/deadlineEmail");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error(
      "GMAIL_USER / GMAIL_APP_PASSWORD missing. Set them in backend/.env (see .env.example)."
    );
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  return transporter;
}

/**
 * Send a single deadline alert email.
 * @param {string} to
 * @param {{opportunityTitle:string, organization:string, deadline:string, daysLeft:7|3|1, applyLink?:string}} entry
 */
async function sendDeadlineAlert(to, entry) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const fromName = process.env.EMAIL_FROM_NAME || "Bloom Opportunity Tracker";

  const html = buildDeadlineEmailHtml({ ...entry, appUrl });
  const subject = buildDeadlineEmailSubject(entry.opportunityTitle, entry.daysLeft);

  const mailer = getTransporter();
  const info = await mailer.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}

/** Quick startup check so bad SMTP creds fail loudly instead of silently. */
async function verifyEmailConnection() {
  const mailer = getTransporter();
  await mailer.verify();
}

module.exports = { sendDeadlineAlert, verifyEmailConnection };
