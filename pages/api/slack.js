export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
  const APOLLO_KEY = process.env.APOLLO_API_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  try {
    // STEP 1: Scrape leads from Apollo (fixed endpoint)
    const apolloRes = await fetch("https://api.apollo.io/v1/people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": APOLLO_KEY,
      },
      body: JSON.stringify({
        page: 1,
        per_page: 10,
        person_titles: ["founder", "ceo", "owner"],
        person_locations: ["United States"],
        contact_email_status: ["verified", "guessed"],
      }),
    });

    const apolloData = await apolloRes.json();
    console.log("Apollo response:", JSON.stringify(apolloData).slice(0, 500));
    
    const leads = apolloData.people || [];
    const validLeads = leads.filter(p => p.email);

    // STEP 2: Send emails (only if domain verified)
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
            from: "Vishal from ProSites <outreach@pro-sites.com>",
            to: lead.email,
            subject: `Quick question about ${lead.organization?.name || "your business"}`,
            html: `
              <p>Hi ${lead.first_name || "there"},</p>
              <p>I help founders like you get a modern, professional website that actually converts.</p>
              <p>Would love to show you what we could build for ${lead.organization?.name || "your company"}.</p>
              <p>Interested in a free mockup?</p>
              <p>Best,<br/>Vishal<br/>ProSites.com</p>
            `,
          }),
        });

        if (emailRes.ok) emailsSent++;
      } catch (e) {
        console.log("Email error:", e.message);
      }
    }

    // STEP 3: Slack report
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Leads Found: ${leads.length}\n✅ Valid Emails: ${validLeads.length}\n📧 Emails Sent: ${emailsSent}\n🔑 Apollo Status: ${apolloData.pagination ? "✅ Working" : "❌ Check Key"}\n💰 Status: Running!`,
      }),
    });

    res.status(200).json({
      success: true,
      leads: leads.length,
      validLeads: validLeads.length,
      emailsSent,
      apolloRaw: apolloData,
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
