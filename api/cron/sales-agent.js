export default async function handler(req, res) {
  const APOLLO_KEY = process.env.APOLLO_API_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

  try {
    // Scrape leads from Apollo
    const leadsResponse = await fetch('https://api.apollo.io/v1/people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_KEY,
      },
      body: JSON.stringify({
        q_keywords: ['founder', 'ceo'],
        person_locations: ['United States'],
        per_page: 20,
      }),
    });

    const leadsData = await leadsResponse.json();
    const leads = leadsData.people || [];

    // Send to Slack
    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        text: `✅ ProSites Agent Run\n📊 Leads scraped: ${leads.length}\n💰 Status: Active`,
      }),
    });

    return res.status(200).json({ success: true, leads: leads.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

export const config = {
  runtime: 'nodejs',
};
