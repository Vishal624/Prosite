import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getEmail(firstName, company, industry) {
  const i = (industry || "").toLowerCase();
  if (["saas","tech","ai","fintech","hr tech","information technology & services","computer software"].some(x => i.includes(x))) {
    return {
      subject: `${company}'s website is costing you signups`,
      html: `<p>Hi ${firstName},</p><p>${company} looks like a solid product — but your website isn't converting the way it should.</p><p>I build high-converting websites for founders in 5-7 days for $500–$1,000. Can I send a free audit for ${company}?</p><p>Reply YES and I'll get it to you within 24 hours.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>`
    };
  }
  if (["staffing","recruiting","executive search","consulting","management consulting"].some(x => i.includes(x))) {
    return {
      subject: `Are clients finding ${company} online?`,
      html: `<p>Hi ${firstName},</p><p>In your industry, your website is often the first impression a potential client gets.</p><p>I build professional websites for service businesses in under a week for $500–$1,000.</p><p>Free mockup for ${company} — interested?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>`
    };
  }
  if (["marketing","advertising","pr","public relations"].some(x => i.includes(x))) {
    return {
      subject: `Your website is your best lead gen tool — is it working?`,
      html: `<p>Hi ${firstName},</p><p>You help others with marketing — but is ${company}'s website generating enough leads for you?</p><p>I build high-converting sites in 5-7 days for $500–$1,000. Free audit?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>`
    };
  }
  return {
    subject: `Quick thought on ${company}'s website`,
    html: `<p>Hi ${firstName},</p><p>I came across ${company} and think there's an opportunity to win more business with a sharper website.</p><p>I build modern sites for US founders in 5-7 days for $500–$1,000. Free mockup — want to see?</p><p>Reply YES and I'll send it over.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>`
  };
}

export default async function handler(req, res) {
  const RESEND = process.env.RESEND_API_KEY;
  const SLACK = process.env.SLACK_WEBHOOK;

  try {
    const newLeads = await prisma.lead.findMany({ where: { status: "new" } });
    if (newLeads.length === 0) return res.status(200).json({ success: true, message: "No new leads to email", sent: 0 });

    let sent = 0, failed = 0;
    for (const lead of newLeads) {
      const { subject, html } = getEmail(lead.firstName, lead.company, lead.industry);
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Vishal from ProSites <outreach@pro-sites.online>", reply_to: "vishal0786sandhu@gmail.com", to: lead.email, subject, html }),
      });
      if (r.ok) {
        await prisma.lead.update({ where: { id: lead.id }, data: { status: "contacted", lastContactedAt: new Date() } });
        await prisma.leadEvent.create({ data: { leadId: lead.id, eventType: "EMAIL_SENT", actorType: "AI", title: "Initial cold email sent", description: `Sent to ${lead.email}`, metadata: { industry: lead.industry } } });
        sent++;
      } else { failed++; }
      await new Promise(r => setTimeout(r, 300));
    }

    if (SLACK) await fetch(SLACK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `📧 *New Leads Emailed!*\n✅ Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total emailed: ${sent + 24} leads` }) });
    return res.status(200).json({ success: true, sent, failed, total: newLeads.length });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
