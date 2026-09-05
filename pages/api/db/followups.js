import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TEMPLATES = {
  1: {
    subject: (c) => `Following up — ${c}`,
    html: (n, c) => `<p>Hi ${n},</p><p>Just checking in on my last email about ${c}'s website.</p><p>Still happy to send a free mockup. Just reply YES.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>`,
  },
  2: {
    subject: (c) => `One quick thing about ${c}`,
    html: (n, c) => `<p>Hi ${n},</p><p>I audited ${c}'s website and spotted an issue — your mobile experience is losing you leads.</p><p>I can fix this in 5-7 days for $500-$1,000. Worth a look?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>`,
  },
  3: {
    subject: (c) => `Last note from me — ${c}`,
    html: (n, c) => `<p>Hi ${n},</p><p>I'll stop reaching out after this.</p><p>If ${c} ever needs a modern website that converts, I'm here. Built 20+ sites this year.</p><p>Best of luck,<br/>Vishal<br/>ProSites.online</p>`,
  },
  4: {
    subject: (c) => `Closing the loop — ${c}`,
    html: (n, c) => `<p>Hi ${n},</p><p>This is my last email — I don't want to clutter your inbox.</p><p>If timing is ever right for a new website for ${c}, you know where to find me.</p><p>Vishal<br/>ProSites.online</p>`,
  },
};

export default async function handler(req, res) {
  const RESEND = process.env.RESEND_API_KEY;
  const SLACK = process.env.SLACK_WEBHOOK;

  try {
    if (req.method === "GET") {
      const followups = await prisma.followup.findMany({
        where: { status: req.query.status || "pending" },
        include: { lead: true },
        orderBy: { scheduledAt: "asc" },
      });
      return res.status(200).json({ success: true, followups, total: followups.length });
    }

    if (req.method === "POST") {
      const due = await prisma.followup.findMany({
        where: { status: "pending", scheduledAt: { lte: new Date() } },
        include: { lead: true },
        take: 50,
      });

      let sent = 0, failed = 0;
      for (const fu of due) {
        const { lead } = fu;
        // Stop if lead already replied
        const replied = await prisma.reply.findFirst({ where: { leadId: lead.id } });
        if (replied) {
          await prisma.followup.update({ where: { id: fu.id }, data: { status: "cancelled", cancelReason: "lead_replied" } });
          continue;
        }
        const tmpl = TEMPLATES[fu.sequenceNumber] || TEMPLATES[4];
        try {
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: "Vishal from ProSites <outreach@pro-sites.online>", to: lead.email, subject: tmpl.subject(lead.company), html: tmpl.html(lead.firstName, lead.company) }),
          });
          if (r.ok) {
            await prisma.followup.update({ where: { id: fu.id }, data: { status: "sent", sentAt: new Date() } });
            await prisma.leadEvent.create({ data: { leadId: lead.id, eventType: "FOLLOWUP_SENT", actorType: "AI", title: `Follow-up #${fu.sequenceNumber} sent` } });
            await prisma.lead.update({ where: { id: lead.id }, data: { lastContactedAt: new Date() } });
            sent++;
          } else { failed++; }
          await new Promise(r => setTimeout(r, 300));
        } catch(e) { failed++; }
      }

      if (SLACK && due.length > 0) {
        await fetch(SLACK, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text: `♻️ *Follow-up Report*\n📧 Sent: ${sent}\n❌ Failed: ${failed}\n📋 Due: ${due.length}` }) });
      }

      return res.status(200).json({ success: true, sent, failed, total: due.length });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
