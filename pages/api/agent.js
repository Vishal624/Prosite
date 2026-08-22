export default async function handler(req, res) {
  try {
    const APOLLO_KEY = process.env.APOLLO_API_KEY;
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

    // Test API call
    const response = await fetch('https://api.apollo.io/v1/people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_KEY,
      },
      body: JSON.stringify({
        q_keywords: ['founder'],
        person_locations: ['United States'],
        per_page: 5,
      }),
    });

    const data = await response.json();
    const leads = data.people?.length || 0;

    // Send Slack message
    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        text: `✅ ProSites Agent Running!\n📊 Leads found: ${leads}\n🚀 Status: Active`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*✅ ProSites Agent*\n📊 Leads: ${leads}\n🔥 Status: Working!`,
            },
          },
        ],
      }),
    });

    res.status(200).json({ 
      success: true, 
      leads,
      message: 'Agent running, check Slack!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
