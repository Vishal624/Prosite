import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TEMPLATES = {
  1: {
    subject: (c) => `re: ${c}`,
    html: (n, c) => `<p>Hi ${n},</p><p>Just wanted to follow up on my last note.</p><p>Still happy to share some ideas for ${c}'s website if you're open to it.</p><p>Vishal</p>`,
  },
  2: {
    subject: (c) => `${c} — one thing I noticed`,
    html: (n, c) => `<p>Hi ${n},</p><p>I took another look at ${c}'s site. On mobile it's not quite as strong as it could be — that's usually where most traffic comes from these days.</p><p>Worth a conversation?</p><p>Vishal</p>`,
  },
  3: {
    subject: (c) => `last note from me`,
    html: (n, c) => `<p>Hi ${n},</p><p>I'll stop following up after this — I know your inbox is busy.</p><p>If improving ${c}'s website ever becomes a priority, feel free to reach out.</p><p>Vishal</p>`,
  },
  4: {
    subject: (c) => `closing the loop`,
    html: (n, c) => `<p>Hi ${n},</p><p>This is my last email. If the timing is ever right for ${c}, you know where to find me.</p><p>Vishal</p>`,
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
        orderBy: { scheduledAt: "asc" },
      });

      let sent = 0, failed = 0;

      for (const f of due) {
        const { lead, sequenceNumber } = f;
        if (!lead || lead.status === "lost" || lead.status === "closed") {
          await prisma.followup.update({ where: { id: f.id }, data: { status: "cancelled", cancelReason: "lead closed/lost" } });
          continue;
        }

        const tpl = TEMPLATES[sequenceNumber];
        if (!tpl) continue;

        try {
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "Vishal from ProSites <outreach@pro-sites.in>",
              to: lead.email,
              subject: tpl.subject(lead.company),
              html: tpl.html(lead.firstName, lead.company),
            }),
          });

          if (r.ok) {
            await Promise.all([
              prisma.followup.update({ where: { id: f.id }, data: { status: "sent", sentAt: new Date() } }),
              prisma.lead.update({ where: { id: lead.id }, data: { lastContactedAt: new Date() } }),
              prisma.leadEvent.create({ data: { leadId: lead.id, eventType: "FOLLOWUP_SENT", actorType: "AI", title: `Follow-up #${sequenceNumber} sent`, metadata: { sequenceNumber } } }),
            ]);
            sent++;
          } else { failed++; }

          await new Promise(r => setTimeout(r, 300));
        } catch(e) { failed++; }
      }

      if (SLACK) {
        await fetch(SLACK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `📨 Follow-ups: ${sent} sent, ${failed} failed` }),
        });
      }

      return res.status(200).json({ success: true, sent, failed, total: due.length });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally {
    await prisma.$disconnect();
  }
}
