import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const leads = await prisma.lead.findMany({
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
      const lead = await prisma.lead.update({ where: { id }, data });
      return res.status(200).json({ lead });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
