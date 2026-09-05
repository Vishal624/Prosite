export default async function handler(req, res) {
  const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;
  const RESEND_KEY = process.env.RESEND_API_KEY;

  // Email templates by industry
  function getEmail(lead) {
    const { first_name, company, industry } = lead;

    // SaaS / Tech founders
    if (["SaaS", "tech", "AI consulting", "tech consulting", "community platform", "lead generation", "HR tech", "fintech"].includes(industry)) {
      return {
        subject: `${company}'s website is costing you signups`,
        html: `
          <p>Hi ${first_name},</p>
          <p>I looked at <strong>${company}</strong> — the product looks solid, but your website isn't converting the way it should.</p>
          <p>Most SaaS sites lose <strong>60-70% of visitors</strong> in the first 5 seconds because of slow load times, weak headlines, and no clear CTA above the fold.</p>
          <p>I build high-converting websites for SaaS founders like you — in <strong>5-7 days for $500–$1,000</strong>. No bloated agencies, no 3-month timelines.</p>
          <p>Can I send you a <strong>free website audit</strong> for ${company}? I'll show you exactly what's leaking conversions and how I'd fix it.</p>
          <p>Just reply <strong>"YES"</strong> and I'll get it to you within 24 hours.</p>
          <p>Best,<br/>
          <strong>Vishal</strong><br/>
          ProSites.online<br/>
          <small>Modern websites for founders — fast & affordable</small></p>
        `
      };
    }

    // Consulting / Recruiting / Staffing / Executive Search
    if (["PR", "sales consulting", "recruiting", "staffing", "executive search", "IT services"].includes(industry)) {
      return {
        subject: `Are clients finding ${company} online?`,
        html: `
          <p>Hi ${first_name},</p>
          <p>In consulting and professional services, your website is often the <strong>first impression</strong> a potential client gets.</p>
          <p>I checked out <strong>${company}</strong> and I think there's a big opportunity to win more clients with a sharper online presence.</p>
          <p>I build professional websites for service businesses like yours — <strong>fast, modern, and built to convert</strong> — in under a week for $500–$1,000.</p>
          <p>I'd love to put together a <strong>free mockup</strong> showing what ${company}'s site could look like. No strings attached.</p>
          <p>Interested? Just reply and I'll send it over.</p>
          <p>Best,<br/>
          <strong>Vishal</strong><br/>
          ProSites.online</p>
        `
      };
    }

    // Media / Entertainment
    if (["media", "entertainment", "3D media"].includes(industry)) {
      return {
        subject: `${company} deserves a better online presence`,
        html: `
          <p>Hi ${first_name},</p>
          <p>The creative work behind <strong>${company}</strong> is impressive — but I noticed your website doesn't quite match that energy.</p>
          <p>For media and entertainment brands, your website is your <strong>stage</strong>. It needs to instantly communicate who you are and why people should care.</p>
          <p>I design bold, modern websites for creative founders — <strong>done in 5-7 days for $500–$1,000</strong>.</p>
          <p>Want to see a <strong>free concept design</strong> for ${company}? I'll build it and send it to you — no commitment needed.</p>
          <p>Best,<br/>
          <strong>Vishal</strong><br/>
          ProSites.online</p>
        `
      };
    }

    // Hospitality / Hotels
    if (["hospitality", "hotels"].includes(industry)) {
      return {
        subject: `Is ${company}'s website winning bookings?`,
        html: `
          <p>Hi ${first_name},</p>
          <p>In hospitality, <strong>your website is your front desk</strong> — it's the first thing guests see before they decide to book.</p>
          <p>I checked out <strong>${company}</strong> and I believe a modern, fast-loading website could significantly increase your direct bookings.</p>
          <p>I build hospitality websites that look premium and convert visitors into guests — <strong>in under a week for $500–$1,000</strong>.</p>
          <p>Can I put together a <strong>free mockup</strong> for ${company}? No cost, no obligation — just a look at what's possible.</p>
          <p>Best,<br/>
          <strong>Vishal</strong><br/>
          ProSites.online</p>
        `
      };
    }

    // Automotive / Hardware / Physical products
    if (["automotive AI", "building materials", "furniture", "telecom"].includes(industry)) {
      return {
        subject: `${company}'s website — quick thought`,
        html: `
          <p>Hi ${first_name},</p>
          <p>I came across <strong>${company}</strong> and was impressed by what you're building.</p>
          <p>One thing I noticed — your online presence doesn't quite reflect the quality of your product. In today's market, a <strong>slow or outdated website costs you sales</strong> before a prospect even talks to you.</p>
          <p>I build clean, modern websites for product companies like yours — <strong>in 5-7 days for $500–$1,000</strong>.</p>
          <p>I'd love to send you a <strong>free mockup</strong> of what a new ${company} site could look like. Would that be useful?</p>
          <p>Best,<br/>
          <strong>Vishal</strong><br/>
          ProSites.online</p>
        `
      };
    }

    // Marketing / Data / Lead gen
    if (["marketing", "marketing/data", "lead generation"].includes(industry)) {
      return {
        subject: `Your website is your best lead gen tool — is it working?`,
        html: `
          <p>Hi ${first_name},</p>
          <p>You're in the business of generating leads for others — but I'm curious, is <strong>${company}'s website</strong> generating enough leads for you?</p>
          <p>I build high-converting websites specifically designed to turn visitors into leads — <strong>done in under a week for $500–$1,000</strong>.</p>
          <p>I'd love to show you what I could do for ${company}. Can I send over a <strong>free site audit + mockup</strong>?</p>
          <p>Best,<br/>
          <strong>Vishal</strong><br/>
          ProSites.online</p>
        `
      };
    }

    // Default (catch-all)
    return {
      subject: `Quick thought on ${company}'s website`,
      html: `
        <p>Hi ${first_name},</p>
        <p>I came across <strong>${company}</strong> and noticed your website might not be doing full justice to what you've built.</p>
        <p>I help US founders get a <strong>modern, professional website that converts</strong> — built in 5-7 days for $500–$1,000. No long timelines, no bloated costs.</p>
        <p>Would you be open to a <strong>free mockup</strong> of what a new ${company} site could look like? No commitment — just a look.</p>
        <p>Reply <strong>"YES"</strong> and I'll get it to you within 24 hours.</p>
        <p>Best,<br/>
        <strong>Vishal</strong><br/>
        ProSites.online<br/>
        <small>Built 20+ sites for US founders this year</small></p>
      `
    };
  }

  const leads = [
    { first_name: "Eli", email: "eli@liveonlucida.com", company: "Lucida Surfaces", industry: "building materials" },
    { first_name: "Conrad", email: "conrad@publicize.co", company: "Publicize", industry: "PR" },
    { first_name: "Andrew", email: "andrew@acquire.com", company: "acquire.com", industry: "tech" },
    { first_name: "Tom", email: "tombilyeu@impacttheory.com", company: "Impact Theory", industry: "media" },
    { first_name: "Tito", email: "tito@altisales.com", company: "AltiSales", industry: "sales consulting" },
    { first_name: "Giovanna", email: "giovanna@hohmp.com", company: "Heart of Hollywood", industry: "entertainment" },
    { first_name: "Shawn", email: "sdoyle@releaseteam.com", company: "ReleaseTEAM", industry: "IT services" },
    { first_name: "David", email: "david@davidbagga.com", company: "David Bagga Co", industry: "recruiting" },
    { first_name: "Ruben", email: "ruben@outrival.com", company: "OutRival", industry: "SaaS" },
    { first_name: "Dave", email: "dperry@blinkai.com", company: "BLiNKAI Automotive", industry: "automotive AI" },
    { first_name: "Jamie", email: "jamie@thepeopleavenue.com", company: "People Avenue", industry: "staffing" },
    { first_name: "Jake", email: "jake@groundswell.io", company: "Groundswell", industry: "fintech" },
    { first_name: "Kevin", email: "kevin@hubble.social", company: "Hubble", industry: "community platform" },
    { first_name: "Andrew", email: "andrew.price@poliigon.com", company: "Poliigon", industry: "3D media" },
    { first_name: "Will", email: "william@uplead.com", company: "UpLead", industry: "lead generation" },
    { first_name: "Kevin", email: "kbrody@kloverdata.com", company: "Klover Data", industry: "marketing" },
    { first_name: "Jay", email: "jay@casperstudios.xyz", company: "Casper Studios", industry: "tech consulting" },
    { first_name: "Paul", email: "pbarham@harrellhospitality.com", company: "Harrell Hospitality", industry: "hospitality" },
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
    const errors = [];

    for (const lead of leads) {
      try {
        const { subject, html } = getEmail(lead);

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          reply_to: "vishal0786sandhu@gmail.com",
            to: lead.email,
            subject,
            html,
          }),
        });

        if (emailRes.ok) {
          emailsSent++;
        } else {
          const err = await emailRes.json();
          errors.push(`${lead.first_name}: ${err.message || JSON.stringify(err)}`);
          emailsFailed++;
        }

        await new Promise(r => setTimeout(r, 400));

      } catch (e) {
        emailsFailed++;
        errors.push(`${lead.first_name}: ${e.message}`);
      }
    }

    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Total Leads: ${leads.length}\n📧 Emails Sent: ${emailsSent}\n❌ Failed: ${emailsFailed}\n${errors.length > 0 ? `🔍 Error: ${errors[0]}` : "✅ All emails sent!"}\n💰 Status: Running!\n\n🎯 *Personalized emails sent to:*\n${leads.slice(0, 5).map(l => `• ${l.first_name} - ${l.company}`).join('\n')}\n...and ${leads.length - 5} more!`,
      }),
    });

    return res.status(200).json({
      success: true,
      emailsSent,
      emailsFailed,
      errors: errors.slice(0, 3),
    });

  } catch (error) {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `❌ Error: ${error.message}` }),
    });
    return res.status(200).json({ success: false, error: error.message });
  }
}
