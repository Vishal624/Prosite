export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  const leads = [
    { first_name: "Eli", email: "eli@liveonlucida.com", company: "Lucida Surfaces" },
    { first_name: "Conrad", email: "conrad@publicize.co", company: "Publicize" },
    { first_name: "Andrew", email: "andrew@acquire.com", company: "acquire.com" },
    { first_name: "Tom", email: "tombilyeu@impacttheory.com", company: "Impact Theory" },
    { first_name: "Tito", email: "tito@altisales.com", company: "AltiSales" },
    { first_name: "Giovanna", email: "giovanna@hohmp.com", company: "Heart of Hollywood" },
    { first_name: "Shawn", email: "sdoyle@releaseteam.com", company: "ReleaseTEAM" },
    { first_name: "David", email: "david@davidbagga.com", company: "David Bagga Co" },
    { first_name: "Ruben", email: "ruben@outrival.com", company: "OutRival" },
    { first_name: "Dave", email: "dperry@blinkai.com", company: "BLiNKAI Automotive" },
    { first_name: "Jamie", email: "jamie@thepeopleavenue.com", company: "People Avenue" },
    { first_name: "Jake", email: "jake@groundswell.io", company: "Groundswell" },
    { first_name: "Kevin", email: "kevin@hubble.social", company: "Hubble" },
    { first_name: "Andrew", email: "andrew.price@poliigon.com", company: "Poliigon" },
    { first_name: "Will", email: "william@uplead.com", company: "UpLead" },
    { first_name: "Kevin", email: "kbrody@kloverdata.com", company: "Klover Data" },
    { first_name: "Jay", email: "jay@casperstudios.xyz", company: "Casper Studios" },
    { first_name: "Paul", email: "pbarham@harrellhospitality.com", company: "Harrell Hospitality" },
    { first_name: "Debbie", email: "debbie@jhammerglobal.com", company: "Jack Hammer" },
    { first_name: "Matt", email: "matt@wedgehr.com", company: "WedgeHR" },
    { first_name: "Steven", email: "swp@alpha.ac", company: "Alpha" },
    { first_name: "Jason", email: "jason@phillipscollection.com", company: "Phillips Collection" },
    { first_name: "Jennifer", email: "jen@risingteam.com", company: "Rising Team" },
    { first_name: "Joshua", email: "jbroder@vertawireless.com", company: "Verta" },
  ];

  // First test Resend with YOUR email
  const testRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "outreach@pro-sites.online",
      to: "vishal0786sandhu@gmail.com",
      subject: "Test - ProSites Agent Working!",
      html: "<p>Test email from ProSites agent. If you see this, Resend is working!</p>",
    }),
  });

  const testData = await testRes.json();
  console.log("Test email result:", JSON.stringify(testData));

  if (!testRes.ok) {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `❌ Resend Test Failed!\nError: ${JSON.stringify(testData)}\nResend Key: ${RESEND_KEY ? "Present" : "MISSING!"}`,
      }),
    });
    return res.status(200).json({ success: false, error: testData });
  }

  // If test passes, send to all leads
  let emailsSent = 0;
  let emailsFailed = 0;
  const errors = [];

  for (const lead of leads) {
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "outreach@pro-sites.online",
          to: lead.email,
          subject: `Quick question about ${lead.company}'s website`,
          html: `
            <p>Hi ${lead.first_name},</p>
            <p>I came across ${lead.company} and love what you're building.</p>
            <p>I help founders get a modern, professional website that converts — built in days for $500–$1,000.</p>
            <p>Can I send a free mockup for ${lead.company}?</p>
            <p>Best,<br/>Vishal<br/>ProSites.online</p>
          `,
        }),
      });

      if (emailRes.ok) {
        emailsSent++;
      } else {
        const err = await emailRes.json();
        errors.push(`${lead.first_name}: ${err.message || JSON.stringify(err)}`);
        emailsFailed++;
      }

      await new Promise(r => setTimeout(r, 300));

    } catch (e) {
      emailsFailed++;
      errors.push(`${lead.first_name}: ${e.message}`);
    }
  }

  await fetch(SLACK_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🤖 *ProSites Daily Report*\n📊 Total Leads: ${leads.length}\n📧 Emails Sent: ${emailsSent}\n❌ Failed: ${emailsFailed}\n${errors.length > 0 ? `🔍 First Error: ${errors[0]}` : "✅ No errors!"}\n💰 Status: Running!`,
    }),
  });

  return res.status(200).json({
    success: true,
    emailsSent,
    emailsFailed,
    errors: errors.slice(0, 3),
    testEmail: testData,
  });
}
