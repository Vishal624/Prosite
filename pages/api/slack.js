import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getEmail(firstName, company, industry) {
  const i = (industry || "").toLowerCase();
  if (["saas","tech","ai","fintech","hr tech","information technology & services","community platform","lead generation","tech consulting"].some(x => i.includes(x)))
    return { subject: `${company}'s website is costing you signups`, html: `<p>Hi ${firstName},</p><p>${company} looks solid — but your website isn't converting the way it should.</p><p>I build high-converting websites for founders in 5-7 days for $500–$1,000. Want a free audit?</p><p>Reply YES and I'll get it to you within 24 hours.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  if (["pr","sales consulting","recruiting","staffing","executive search","it services","management consulting"].some(x => i.includes(x)))
    return { subject: `Are clients finding ${company} online?`, html: `<p>Hi ${firstName},</p><p>In your industry, your website is the first impression a client gets.</p><p>I build professional websites for service businesses in under a week for $500–$1,000. Free mockup for ${company}?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  if (["media","entertainment","3d media","online media"].some(x => i.includes(x)))
    return { subject: `${company} deserves a better online presence`, html: `<p>Hi ${firstName},</p><p>The work behind ${company} is impressive — but your website doesn't quite match that energy.</p><p>I design bold, modern websites for creative founders in 5-7 days for $500–$1,000. Free concept?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  if (["hospitality","hotels"].some(x => i.includes(x)))
    return { subject: `Is ${company}'s website winning bookings?`, html: `<p>Hi ${firstName},</p><p>In hospitality, your website is your front desk. I build modern hospitality sites in under a week for $500–$1,000. Free mockup?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  if (["marketing","advertising","public relations"].some(x => i.includes(x)))
    return { subject: `Is ${company}'s website generating leads for you?`, html: `<p>Hi ${firstName},</p><p>You help others with marketing — but is ${company}'s site generating enough leads for you? I build high-converting sites in 5-7 days for $500–$1,000. Free audit?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  return { subject: `Quick thought on ${company}'s website`, html: `<p>Hi ${firstName},</p><p>I came across ${company} and think there's an opportunity to win more business with a sharper website.</p><p>I build modern sites for US founders in 5-7 days for $500–$1,000. Free mockup — want to see?</p><p>Reply YES and I'll send it over.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
}

export default async function handler(req, res) {
  const SLACK = process.env.SLACK_WEBHOOK;
  const RESEND = process.env.RESEND_API_KEY;

  try {
    // Get all leads from DB
    const allLeads = await prisma.lead.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Get metrics
    const [emailsSentCount, followupsDue, positiveReplies, revenue] = await Promise.all([
      prisma.leadEvent.count({ where: { eventType: "EMAIL_SENT" } }),
      prisma.followup.count({ where: { status: "pending", scheduledAt: { lte: new Date() } } }),
      prisma.reply.count({ where: { intent: "POSITIVE" } }),
      prisma.deal.aggregate({ where: { status: "won" }, _sum: { value: true } }),
    ]);

    // Send emails to new leads only
    const newLeads = allLeads.filter(l => l.status === "new");
    let sent = 0, failed = 0;

    for (const lead of newLeads) {
      const { subject, html } = getEmail(lead.firstName, lead.company, lead.industry);
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "Vishal from ProSites <outreach@pro-sites.online>", to: lead.email, subject, html }),
        });
        if (r.ok) {
          await prisma.lead.update({ where: { id: lead.id }, data: { status: "contacted", lastContactedAt: new Date() } });
          await prisma.leadEvent.create({ data: { leadId: lead.id, eventType: "EMAIL_SENT", actorType: "AI", title: "Initial cold email sent", metadata: { industry: lead.industry } } });
          // Schedule followups
          for (const [seq, days] of [[1,3],[2,7],[3,12],[4,18]]) {
            const d = new Date(); d.setDate(d.getDate() + days);
            await prisma.followup.upsert({ where: { id: `fu-${lead.id}-${seq}` }, update: {}, create: { id: `fu-${lead.id}-${seq}`, leadId: lead.id, sequenceNumber: seq, scheduledAt: d, status: "pending" } });
          }
          sent++;
        } else { failed++; }
        await new Promise(r => setTimeout(r, 300));
      } catch(e) { failed++; }
    }

    // Slack report
    const totalEmailed = emailsSentCount + sent;
    await fetch(SLACK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Total Leads: ${allLeads.length}\n📧 Total Emailed: ${totalEmailed}\n📨 New Today: ${sent}\n❌ Failed: ${failed}\n⏰ Follow-ups Due: ${followupsDue}\n💬 Positive Replies: ${positiveReplies}\n💰 Revenue: $${revenue._sum.value || 0}\n✅ Status: Running!\n\n🎯 *Sample leads:*\n${allLeads.slice(0,3).map(l=>`• ${l.firstName} - ${l.company}`).join('\n')}\n...and ${allLeads.length - 3} more!`,
      }),
    });

    return res.status(200).json({ success: true, totalLeads: allLeads.length, totalEmailed, newSent: sent, failed });
  } catch(e) {
    await fetch(SLACK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `❌ Error: ${e.message}` }) });
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
