export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
  const APOLLO_KEY = process.env.APOLLO_API_KEY;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  try {
    // Test Apollo first
    const apolloRes = await fetch("https://api.apollo.io/api/v1/people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": APOLLO_KEY,
      },
      body: JSON.stringify({
        page: 1,
        per_page: 10,
        person_titles: ["founder", "ceo"],
        person_locations: ["United States"],
      }),
    });

    const apolloData = await apolloRes.json();
    const leads = apolloData.people || [];
    const validLeads = leads.filter(p => p.email);

    // Send emails via Resend
    let emailsSent = 0;
    for (const lead of validLeads.slice(0, 5)) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Vishal from ProSites <outreach@pro-sites.online>",
          to: lead.email,
          subject: `Website idea for ${lead.organization?.name || "your business"}`,
          html: `
            <p>Hi ${lead.first_name || "there"},</p>
            <p>I build modern websites for US founders — fast and affordable ($500-$1000).</p>
            <p>Can I show you a free mockup for ${lead.organization?.name || "your business"}?</p>
            <p>Best,<br/>Vishal<br/>ProSites.online</p>
          `,
        }),
      });

      if (emailRes.ok) emailsSent++;
    }

    // Slack report
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Leads Found: ${leads.length}\n✅ Valid Emails: ${validLeads.length}\n📧 Emails Sent: ${emailsSent}\n🔑 Apollo: ${apolloData.pagination ? "✅ Working" : "❌ Error: " + JSON.stringify(apolloData)}\n💰 Status: Running!`,
      }),
    });

    res.status(200).json({
      success: true,
      leads: leads.length,
      validLeads: validLeads.length,
      emailsSent,
      apolloStatus: apolloData.pagination ? "working" : apolloData,
    });

  } catch (error) {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `❌ Error: ${error.message}`,
      }),
    });

    res.status(200).json({ success: false, error: error.message });
  }
}
