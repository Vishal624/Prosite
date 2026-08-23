export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

  if (!SLACK_WEBHOOK) {
    return res.status(200).json({ success: false, error: "Webhook not configured" });
  }

  try {
    const response = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ ProSites Agent - System Working!\n📊 Leads: 20 | Emails: 10 | Status: Active",
      }),
    });

    const text = await response.text();

    if (response.ok) {
      res.status(200).json({ success: true, message: "Sent to Slack!" });
    } else {
      res.status(200).json({ success: false, error: text });
    }
  } catch (error) {
    res.status(200).json({ success: false, error: error.message });
  }
}
