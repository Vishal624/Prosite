import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const [totalLeads, emailsSent, followupsDue, followupsSent, positiveReplies, allReplies, dealsWon, revenue, recentEvents, leadsByStatus, leadsByIndustry] = await Promise.all([
      prisma.lead.count(),
      prisma.leadEvent.count({ where: { eventType: "EMAIL_SENT" } }),
      prisma.followup.count({ where: { status: "pending", scheduledAt: { lte: new Date() } } }),
      prisma.followup.count({ where: { status: "sent" } }),
      prisma.reply.count({ where: { intent: "POSITIVE" } }),
      prisma.reply.count(),
      prisma.deal.count({ where: { status: "won" } }),
      prisma.deal.aggregate({ where: { status: "won" }, _sum: { value: true } }),
      prisma.leadEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { lead: { select: { firstName: true, company: true } } } }),
      prisma.lead.groupBy({ by: ["status"], _count: true }),
      prisma.lead.groupBy({ by: ["industry"], _count: true, orderBy: { _count: { industry: "desc" } }, take: 6 }),
    ]);
    return res.status(200).json({
      success: true,
      metrics: { totalLeads, emailsSent, followupsDue, followupsSent, positiveReplies, allReplies, dealsWon, revenue: revenue._sum.value || 0, recentEvents, leadsByStatus, leadsByIndustry },
    });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
