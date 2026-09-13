import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const limit = parseInt(req.query.limit) || 200;
      const leads = await prisma.lead.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          followups: { orderBy: { scheduledAt: 'asc' } },
          deals: true,
        },
      });
      return res.status(200).json({ leads });
    }

    if (req.method === 'PATCH') {
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const lead = await prisma.lead.update({ where: { id }, data });
      return res.status(200).json({ lead });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  } finally { await prisma.$disconnect(); }
}
