export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
  const APOLLO_KEY = process.env.APOLLO_API_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  try {
    // STEP 1: Scrape real leads from Apollo
    const apolloRes = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": APOLLO_KEY,
      },
      body: JSON.stringify({
        q_keywords: "founder ceo",
        q_organization_domains: [],
        page: 1,
        per_page: 10,
        person_locations: ["United States"],
        person_titles: ["founder", "ceo", "owner"],
        contact_email_status: ["verified"],
      }),
    });

    const apolloData = await apolloRes.json();
    const leads = apolloData.people || [];
    const validLeads = leads.filter(p => p.email);

    // STEP 2: Send emails via Resend
    let emailsSent = 0;
    for (const lead of validLeads.slice(0, 5)) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "outreach@pro-sites.com",
            to: lead.email,
            subject: `Website for ${lead.organization?.name || "your business"}`,
            html: `
              <p>Hi ${lead.first_name || "there"},</p>
              <p>I noticed ${lead.organization?.name || "your company"} and wanted to reach out.</p>
              <p>We build modern, professional websites for founders like you — fast, affordable, and conversion-focused.</p>
              <p>Would love to show you what we could build. Interested?</p>
              <p>Best,<br/>Vishal<br/>ProSites</p>
            `,
          }),
        });

        if (emailRes.ok) emailsSent++;
      } catch (e) {
        console.log("Email error:", e.message);
      }
    }

    // STEP 3: Send Slack report
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Leads Found: ${leads.length}\n✅ Valid Emails: ${validLeads.length}\n📧 Emails Sent: ${emailsSent}\n💰 Status: Running!`,
      }),
    });

    res.status(200).json({
      success: true,
      leads: leads.length,
      validLeads: validLeads.length,
      emailsSent,
    });

  } catch (error) {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `❌ ProSites Agent Error: ${error.message}`,
      }),
    });

    res.status(200).json({ success: false, error: error.message });
  }
}
