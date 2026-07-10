// HTML email template for deadline alerts.
// Kept framework-free (plain string builder) so it has zero extra deps.

const URGENCY_STYLES = {
  7: { color: "#f59e0b", label: "7 Days Left" },
  3: { color: "#ef4444", label: "3 Days Left — Act Now!" },
  1: { color: "#dc2626", label: "Last Day!" },
};

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build the HTML body for a single deadline alert email.
 * @param {{
 *   opportunityTitle: string,
 *   organization: string,
 *   deadline: string, // YYYY-MM-DD
 *   daysLeft: 7 | 3 | 1,
 *   applyLink?: string,
 *   appUrl: string
 * }} params
 */
function buildDeadlineEmailHtml(params) {
  const { opportunityTitle, organization, deadline, daysLeft, applyLink, appUrl } = params;
  const style = URGENCY_STYLES[daysLeft] || URGENCY_STYLES[7];
  const formattedDeadline = new Date(deadline).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff;">
    <div style="background: ${style.color}; padding: 20px 28px; border-radius: 16px 16px 0 0;">
      <p style="margin: 0; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;">
        ${escapeHtml(style.label)}
      </p>
    </div>
    <div style="border: 1px solid #eee; border-top: none; border-radius: 0 0 16px 16px; padding: 28px;">
      <h2 style="margin: 0 0 6px; font-size: 20px; color: #111;">${escapeHtml(opportunityTitle)}</h2>
      <p style="margin: 0 0 20px; font-size: 13px; color: #666; font-weight: 600;">${escapeHtml(organization)}</p>

      <div style="background: #f8f8f8; border-radius: 12px; padding: 16px 18px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700;">Deadline</p>
        <p style="margin: 4px 0 0; font-size: 15px; color: #111; font-weight: 700;">${formattedDeadline}</p>
      </div>

      <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 24px;">
        ${
          daysLeft === 1
            ? "This is your last day to submit. Don't miss it!"
            : `You have ${daysLeft} days left to complete and submit your application.`
        }
      </p>

      <div style="text-align: center;">
        <a href="${escapeHtml(applyLink || appUrl)}"
           style="display: inline-block; background: ${style.color}; color: #fff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 999px;">
          ${applyLink ? "Apply Now" : "View in Tracker"}
        </a>
      </div>

      <p style="margin: 28px 0 0; font-size: 11px; color: #aaa; text-align: center;">
        Sent by Bloom — your opportunity tracker.
        <a href="${escapeHtml(appUrl)}/dashboard/tracker" style="color: #aaa;">Manage your tracker</a>
      </p>
    </div>
  </div>`;
}

function buildDeadlineEmailSubject(opportunityTitle, daysLeft) {
  if (daysLeft === 7) return `⚠️ 7 Days Left — ${opportunityTitle}`;
  if (daysLeft === 3) return `🔴 3 Days Left — Act Now!`;
  if (daysLeft === 1) return `🚨 Last Day — ${opportunityTitle}`;
  return `Deadline Reminder — ${opportunityTitle}`;
}

module.exports = { buildDeadlineEmailHtml, buildDeadlineEmailSubject };
