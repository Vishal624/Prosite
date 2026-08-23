export default async function handler(req, res) {
  const SLACK_WEBHOOK =
    "https://hooks.slack.com/services/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";

  try {
    const response = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ ProSites Agent - System Working! Leads: 20 | Emails: 10 | Status: Active",
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
