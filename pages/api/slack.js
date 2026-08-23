export default async function handler(req, res) {
  const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";

  const response = await fetch(SLACK_WEBHOOK, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      text: "✅ ProSites Agent - System Working!",
    }),
  });

  if (response.ok) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
}
