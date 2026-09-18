import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getEmail(firstName, company, industry) {
  const i = (industry || "").toLowerCase();

  if (["saas","tech","ai","fintech","hr tech","information technology & services","community platform","lead generation","tech consulting"].some(x => i.includes(x)))
    return {
      subject: `quick question about ${company}`,
      html: `<p>Hi ${firstName},</p><p>I was checking out ${company} — looks like you're doing interesting work.</p><p>I noticed your website could do a better job converting visitors into leads. I help tech founders fix this — usually takes about a week.</p><p>Would it be useful if I put together some quick ideas for ${company}? No strings attached.</p><p>Vishal</p>`
    };

  if (["pr","sales consulting","recruiting","staffing","executive search","it services","management consulting"].some(x => i.includes(x)))
    return {
      subject: `${company} — quick thought`,
      html: `<p>Hi ${firstName},</p><p>In your line of work, clients are checking your website before they ever call you.</p><p>I help service businesses make a stronger first impression online. Curious if that's something on your radar for ${company}?</p><p>Vishal</p>`
    };

  if (["media","entertainment","3d media","online media","publishing"].some(x => i.includes(x)))
    return {
      subject: `thought on ${company}'s online presence`,
      html: `<p>Hi ${firstName},</p><p>I came across ${company} and was impressed by what you're building.</p><p>I work with founders in creative industries to make their websites match the quality of their work. Is that something you're thinking about?</p><p>Vishal</p>`
    };

  if (["hospitality","hotels"].some(x => i.includes(x)))
    return {
      subject: `quick question for ${firstName}`,
      html: `<p>Hi ${firstName},</p><p>I've been looking at hospitality businesses and how their websites affect bookings.</p><p>I help owners like you get more direct bookings through a better website. Worth a quick chat about ${company}?</p><p>Vishal</p>`
    };

  if (["marketing","advertising","public relations"].some(x => i.includes(x)))
    return {
      subject: `${firstName} — honest question`,
      html: `<p>Hi ${firstName},</p><p>You help clients with their marketing — I'm curious if ${company}'s own website is generating the leads you want.</p><p>I help founders in your space improve this. Happy to share what I've seen work if you're open to it.</p><p>Vishal</p>`
    };

  if (["real estate","construction","architecture"].some(x => i.includes(x)))
    return {
      subject: `quick thought on ${company}`,
      html: `<p>Hi ${firstName},</p><p>I work with founders in real estate and construction who want their website to better reflect the quality of their work.</p><p>Is that something you're thinking about for ${company}?</p><p>Vishal</p>`
    };

  if (["healthcare","dental","medical","health"].some(x => i.includes(x)))
    return {
      subject: `question about ${company}`,
      html: `<p>Hi ${firstName},</p><p>Patients are checking websites before choosing a provider. I help healthcare founders make sure ${company} makes the right first impression.</p><p>Is improving your website something on your list this year?</p><p>Vishal</p>`
    };

  // Default
  return {
    subject: `quick question, ${firstName}`,
    html: `<p>Hi ${firstName},</p><p>I came across ${company} and wanted to reach out directly.</p><p>I help founders improve how their business looks online — it's something I've been doing for a while and I enjoy it.</p><p>Is your website something you're happy with, or is it on your list to improve?</p><p>Vishal</p>`
  };
}

export default async function handler(req, res) {
  const SLACK = process.env.SLACK_WEBHOOK;
  const RESEND = process.env.RESEND_API_KEY;

  try {
    const [allLeads, emailsSentCount, followupsDue, positiveReplies, revenue] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.leadEvent.count({ where: { eventType: "EMAIL_SENT" } }),
      prisma.followup.count({ where: { status: "pending", scheduledAt: { lte: new Date() } } }),
      prisma.reply.count({ where: { intent: "POSITIVE" } }),
      prisma.deal.aggregate({ where: { status: "won" }, _sum: { value: true } }),
    ]);

    const newLeads = allLeads.filter(l => l.status === "new");
    let sent = 0, failed = 0;

    for (const lead of newLeads) {
      const { subject, html } = getEmail(lead.firstName, lead.company, lead.industry);
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "Vishal from ProSites <outreach@pro-sites.in>", to: lead.email, subject, html }),
        });
        if (r.ok) {
          const now = new Date();
          await Promise.all([
            prisma.lead.update({ where: { id: lead.id }, data: { status: "contacted", lastContactedAt: now } }),
            prisma.leadEvent.create({ data: { leadId: lead.id, eventType: "EMAIL_SENT", actorType: "AI", title: "Initial cold email sent", metadata: { industry: lead.industry } } }),
            ...[[1,3],[2,7],[3,12],[4,18]].map(([seq, days]) => {
              const d = new Date(now); d.setDate(d.getDate() + days);
              return prisma.followup.upsert({ where: { id: `fu-${lead.id}-${seq}` }, update: {}, create: { id: `fu-${lead.id}-${seq}`, leadId: lead.id, sequenceNumber: seq, scheduledAt: d, status: "pending" } });
            }),
          ]);
          sent++;
        } else { failed++; }
        await new Promise(r => setTimeout(r, 300));
      } catch(e) { failed++; }
    }

    const totalEmailed = emailsSentCount + sent;
    await fetch(SLACK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🤖 *ProSites Daily Report*\n📊 Total Leads: ${allLeads.length}\n📧 Total Emailed: ${totalEmailed}\n📨 New Today: ${sent}\n❌ Failed: ${failed}\n⏰ Follow-ups Due: ${followupsDue}\n💬 Positive Replies: ${positiveReplies}\n💰 Revenue: $${revenue._sum.value || 0}\n✅ Status: Running!`,
      }),
    });

    return res.status(200).json({ success: true, totalLeads: allLeads.length, totalEmailed, newSent: sent, failed });
  } catch(e) {
    if (process.env.SLACK_WEBHOOK) await fetch(process.env.SLACK_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `❌ Error: ${e.message}` }) });
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
