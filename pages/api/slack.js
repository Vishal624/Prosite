export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  const leads = [
    { first_name: "Eli", email: "eli@liveonlucida.com", company: "Lucida Surfaces", industry: "building materials" },
    { first_name: "Conrad", email: "conrad@publicize.co", company: "Publicize", industry: "public relations" },
    { first_name: "Andrew", email: "andrew@acquire.com", company: "acquire.com", industry: "tech" },
    { first_name: "Tom", email: "tombilyeu@impacttheory.com", company: "Impact Theory", industry: "media" },
    { first_name: "Tito", email: "tito@altisales.com", company: "AltiSales", industry: "consulting" },
    { first_name: "Giovanna", email: "giovanna@hohmp.com", company: "Heart of Hollywood Motion Pictures", industry: "entertainment" },
    { first_name: "Shawn", email: "sdoyle@releaseteam.com", company: "ReleaseTEAM", industry: "IT services" },
    { first_name: "David", email: "david@davidbagga.com", company: "David Bagga Company", industry: "recruiting" },
    { first_name: "Ruben", email: "ruben@outrival.com", company: "OutRival", industry: "SaaS" },
    { first_name: "Dave", email: "dperry@blinkai.com", company: "BLiNKAI Automotive", industry: "automotive AI" },
    { first_name: "Jamie", email: "jamie@thepeopleavenue.com", company: "People Avenue", industry: "staffing" },
    { first_name: "Jake", email: "jake@groundswell.io", company: "Groundswell", industry: "fintech" },
    { first_name: "Kevin", email: "kevin@hubble.social", company: "Hubble", industry: "community platform" },
    { first_name: "Andrew", email: "andrew.price@poliigon.com", company: "Poliigon", industry: "3D media" },
    { first_name: "Will", email: "william@uplead.com", company: "UpLead", industry: "lead generation" },
    { first_name: "Kevin", email: "kbrody@kloverdata.com", company: "Klover Data", industry: "marketing" },
    { first_name: "Jay", email: "jay@casperstudios.xyz", company: "Casper Studios", industry: "tech consulting" },
    { first_name: "Paul", email: "pbarham@harrellhospitality.com", company: "Harrell Hospitality Group", industry: "hospitality" },
    { first_name: "Debbie", email: "debbie@jhammerglobal.com", company: "Jack Hammer", industry: "executive search" },
    { first_name: "Matt", email: "matt@wedgehr.com", company: "WedgeHR", industry: "HR tech" },
    { first_name: "Steven", email: "swp@alpha.ac", company: "Alpha", industry: "AI consulting" },
    { first_name: "Jason", email: "jason@phillipscollection.com", company: "Phillips Collection", industry: "furniture" },
    { first_name: "Jennifer", email: "jen@risingteam.com", company: "Rising Team", industry: "SaaS" },
    { first_name: "Joshua", email: "jbroder@vertawireless.com", company: "Verta", industry: "telecom" },
  ];

  try {
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const lead of leads) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Vishal from ProSites <onboarding@resend.dev>",
            to:"vishal0786sandhu@gmail.com",
            subject: `Quick question about ${lead.company}'s website`,
            html: `
              <p>Hi ${lead.first_name},</p>
              <p>I came across ${lead.company} and love what you're building in ${lead.industry}.</p>
              <p>I help founders like you get a modern, professional website that actually converts visitors into customers — built in days, not months, for $500–$1,000.</p>
              <p>Would it be okay if I sent over a free mockup for ${lead.company}?</p>
              <p>Takes me 30 mins to build and costs you nothing to look at.</p>
              <p>Best,<br/>Vishal<br/>ProSites.online<br/><a href="https://pro-sites.online">pro-sites.online</a></p>
            `,
          }),
        });

        if (emailRes.ok) {
          emailsSent++;
        } else {
          emailsFailed++;
        }

        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        emailsFailed++;
      }
    }

    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Total Leads: ${leads.length}\n📧 Emails Sent: ${emailsSent}\n❌ Failed: ${emailsFailed}\n💰 Status: Running!\n\n🎯 *Leads Contacted:*\n${leads.slice(0, 5).map(l => `• ${l.first_name} - ${l.company}`).join('\n')}\n...and ${leads.length - 5} more!`,
      }),
    });

    res.status(200).json({ success: true, total: leads.length, emailsSent, emailsFailed });

  } catch (error) {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `❌ Error: ${error.message}` }),
    });
    res.status(200).json({ success: false, error: error.message });
  }
}
