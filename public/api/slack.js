export default async function handler(req, res) {
  const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";

  try {
    const response = await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        text: '✅ ProSites Agent Test - System Working!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*✅ ProSites Agent*\n🧪 Test Message\n🚀 Status: Webhook Working!',
            },
          },
        ],
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Message sent to Slack!' });
    } else {
      return res.status(response.status).json({ success: false, error: 'Failed to send' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
