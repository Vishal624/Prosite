import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Find all contacted leads with no EMAIL_SENT event
    const leads = await prisma.lead.findMany({
      where: { status: "contacted" },
      include: { events: { where: { eventType: "EMAIL_SENT" } } },
    });

    let fixed = 0;
    for (const lead of leads) {
      if (lead.events.length === 0) {
        await prisma.leadEvent.create({
          data: {
            leadId: lead.id,
            eventType: "EMAIL_SENT",
            actorType: "AI",
            title: "Initial cold email sent",
            description: `Backfilled event for ${lead.email}`,
            metadata: { industry: lead.industry, backfilled: true },
          },
        });
        // Schedule followups if missing
        for (const [seq, days] of [[1,3],[2,7],[3,12],[4,18]]) {
          const d = new Date(); d.setDate(d.getDate() + days);
          await prisma.followup.upsert({
            where: { id: `fu-${lead.id}-${seq}` },
            update: {},
            create: { id: `fu-${lead.id}-${seq}`, leadId: lead.id, sequenceNumber: seq, scheduledAt: d, status: "pending" },
          });
        }
        fixed++;
      }
    }

    const SLACK = process.env.SLACK_WEBHOOK;
    if (SLACK) await fetch(SLACK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `🔧 *DB Fixed!*\n✅ Events backfilled: ${fixed}\n📊 Dashboard now shows correct data!` }) });

    return res.status(200).json({ success: true, fixed, total: leads.length });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
