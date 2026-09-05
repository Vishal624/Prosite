import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const replies = await prisma.reply.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { lead: { select: { firstName: true, company: true, email: true } } },
      });
      return res.status(200).json({ success: true, replies, total: replies.length });
    }
    if (req.method === "PATCH") {
      const { id } = req.body;
      const updated = await prisma.reply.update({ where: { id }, data: { handled: true } });
      return res.status(200).json({ success: true, reply: updated });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
