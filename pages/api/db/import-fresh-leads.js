import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const LEADS = [
  { firstName: "Rabbi", lastName: "Levine", email: "dreams@jdbyytt.org", company: "Joan Dachs Bais Yaakov", industry: "primary/secondary education", title: "CEO", country: "US" },
  { firstName: "John", lastName: "Blubaugh", email: "john@jba.com", company: "JBA", industry: "law practice", title: "CEO", country: "US" },
  { firstName: "Taeyong", lastName: "Kim", email: "ty@eoeoeo.net", company: "EO", industry: "information technology & services", title: "CEO", country: "US" },
  { firstName: "Madhav", lastName: "Sheth", email: "madhavs@nxtquantum.ai", company: "Ai+ Smartphone", industry: "information technology & services", title: "CEO", country: "US" },
  { firstName: "Larry", lastName: "Wilson", email: "larry@safestart.com", company: "SafeStart International", industry: "management consulting", title: "CEO", country: "US" },
  { firstName: "Patrick", lastName: "Buono", email: "patrick.buono@albys.com", company: "HOLDJUST", industry: "management consulting", title: "CEO", country: "US" },
  { firstName: "Adhil", lastName: "Shetty", email: "adhil.shetty@bankbazaar.com", company: "BankBazaar India", industry: "financial services", title: "CEO", country: "US" },
  { firstName: "Nicolo", lastName: "Santin", email: "nicolo.santin@gamindo.com", company: "Gamindo", industry: "information technology & services", title: "CEO", country: "US" },
  { firstName: "Nicholas", lastName: "Thompson", email: "nthompson@theatlantic.com", company: "The Atlantic", industry: "publishing", title: "CEO", country: "US" },
];

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  let imported = 0, skipped = 0;

  for (const lead of LEADS) {
    try {
      await prisma.lead.upsert({
        where: { email: lead.email },
        update: {},
        create: {
          ...lead,
          leadScore: 70,
          source: "apollo",
          status: "new",
        },
      });
      imported++;
    } catch(e) {
      console.error(lead.email, e.message);
      skipped++;
    }
  }

  await prisma.$disconnect();
  return res.status(200).json({ success: true, imported, skipped, total: LEADS.length });
}
