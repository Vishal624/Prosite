import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { status, industry, limit = "50" } = req.query;
      const where = {};
      if (status) where.status = status;
      if (industry) where.industry = industry;
      const leads = await prisma.lead.findMany({
        where, orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }],
        take: parseInt(limit),
        include: {
          followups: { where: { status: "pending" }, orderBy: { scheduledAt: "asc" }, take: 1 },
          replies: { orderBy: { createdAt: "desc" }, take: 1 },
          deals: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { events: true } },
        },
      });
      return res.status(200).json({ success: true, leads, total: leads.length });
    }
    if (req.method === "PATCH") {
      const { id, status, notes, leadScore } = req.body;
      if (!id) return res.status(400).json({ error: "ID required" });
      const updated = await prisma.lead.update({
        where: { id },
        data: { ...(status && { status }), ...(notes !== undefined && { notes }), ...(leadScore && { leadScore }) },
      });
      await prisma.leadEvent.create({ data: { leadId: id, eventType: "LEAD_UPDATED", actorType: "HUMAN", title: `Status → ${status || "updated"}` } });
      return res.status(200).json({ success: true, lead: updated });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
