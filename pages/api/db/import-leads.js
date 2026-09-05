import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const LEADS = [
  { firstName: "Eli", email: "eli@liveonlucida.com", company: "Lucida Surfaces", industry: "building materials", leadScore: 72 },
  { firstName: "Conrad", email: "conrad@publicize.co", company: "Publicize", industry: "PR", leadScore: 68 },
  { firstName: "Andrew", email: "andrew@acquire.com", company: "acquire.com", industry: "tech", leadScore: 91 },
  { firstName: "Tom", email: "tombilyeu@impacttheory.com", company: "Impact Theory", industry: "media", leadScore: 85 },
  { firstName: "Tito", email: "tito@altisales.com", company: "AltiSales", industry: "sales consulting", leadScore: 78 },
  { firstName: "Giovanna", email: "giovanna@hohmp.com", company: "Heart of Hollywood", industry: "entertainment", leadScore: 65 },
  { firstName: "Shawn", email: "sdoyle@releaseteam.com", company: "ReleaseTEAM", industry: "IT services", leadScore: 70 },
  { firstName: "David", email: "david@davidbagga.com", company: "David Bagga Co", industry: "recruiting", leadScore: 73 },
  { firstName: "Ruben", email: "ruben@outrival.com", company: "OutRival", industry: "SaaS", leadScore: 88 },
  { firstName: "Dave", email: "dperry@blinkai.com", company: "BLiNKAI Automotive", industry: "automotive AI", leadScore: 76 },
  { firstName: "Jamie", email: "jamie@thepeopleavenue.com", company: "People Avenue", industry: "staffing", leadScore: 67 },
  { firstName: "Jake", email: "jake@groundswell.io", company: "Groundswell", industry: "fintech", leadScore: 82 },
  { firstName: "Kevin", email: "kevin@hubble.social", company: "Hubble", industry: "community platform", leadScore: 75 },
  { firstName: "Andrew", lastName: "Price", email: "andrew.price@poliigon.com", company: "Poliigon", industry: "3D media", leadScore: 71 },
  { firstName: "Will", email: "william@uplead.com", company: "UpLead", industry: "lead generation", leadScore: 80 },
  { firstName: "Kevin", lastName: "Brody", email: "kbrody@kloverdata.com", company: "Klover Data", industry: "marketing", leadScore: 74 },
  { firstName: "Jay", email: "jay@casperstudios.xyz", company: "Casper Studios", industry: "tech consulting", leadScore: 69 },
  { firstName: "Paul", email: "pbarham@harrellhospitality.com", company: "Harrell Hospitality", industry: "hospitality", leadScore: 72 },
  { firstName: "Debbie", email: "debbie@jhammerglobal.com", company: "Jack Hammer", industry: "executive search", leadScore: 76 },
  { firstName: "Matt", email: "matt@wedgehr.com", company: "WedgeHR", industry: "HR tech", leadScore: 83 },
  { firstName: "Steven", email: "swp@alpha.ac", company: "Alpha", industry: "AI consulting", leadScore: 87 },
  { firstName: "Jason", email: "jason@phillipscollection.com", company: "Phillips Collection", industry: "furniture", leadScore: 66 },
  { firstName: "Jennifer", email: "jen@risingteam.com", company: "Rising Team", industry: "SaaS", leadScore: 79 },
  { firstName: "Joshua", email: "jbroder@vertawireless.com", company: "Verta", industry: "telecom", leadScore: 71 },
];

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    let imported = 0, skipped = 0;
    for (const lead of LEADS) {
      try {
        const created = await prisma.lead.upsert({
          where: { email: lead.email },
          update: {},
          create: {
            firstName: lead.firstName,
            lastName: lead.lastName || null,
            email: lead.email,
            company: lead.company,
            title: "CEO",
            industry: lead.industry,
            leadScore: lead.leadScore,
            source: "apollo",
            status: "contacted",
            lastContactedAt: new Date(),
          },
        });
        await prisma.leadEvent.upsert({
          where: { id: `evt-email-${created.id}` },
          update: {},
          create: {
            id: `evt-email-${created.id}`,
            leadId: created.id,
            eventType: "EMAIL_SENT",
            actorType: "AI",
            title: "Initial cold email sent",
            description: `Personalized email sent via Resend to ${lead.email}`,
            metadata: { template: lead.industry, from: "outreach@pro-sites.online" },
          },
        });
        const day3 = new Date(); day3.setDate(day3.getDate() + 3);
        const day7 = new Date(); day7.setDate(day7.getDate() + 7);
        const day12 = new Date(); day12.setDate(day12.getDate() + 12);
        const day18 = new Date(); day18.setDate(day18.getDate() + 18);
        for (const [seq, date] of [[1,day3],[2,day7],[3,day12],[4,day18]]) {
          await prisma.followup.upsert({
            where: { id: `fu-${created.id}-${seq}` },
            update: {},
            create: { id: `fu-${created.id}-${seq}`, leadId: created.id, sequenceNumber: seq, scheduledAt: date, status: "pending" },
          });
        }
        imported++;
      } catch(e) { if (e.code === "P2002") skipped++; }
    }
    const today = new Date(); today.setHours(0,0,0,0);
    await prisma.dailyMetric.upsert({
      where: { date: today },
      update: { leadsAdded: imported, emailsSent: imported },
      create: { date: today, leadsAdded: imported, emailsSent: imported },
    });
    const SLACK = process.env.SLACK_WEBHOOK;
    if (SLACK) await fetch(SLACK, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text: `🗄️ *DB Import Complete!*\n✅ Imported: ${imported}\n⏭️ Skipped: ${skipped}\n📅 Follow-ups scheduled: Day 3/7/12/18\n🔥 DB is live!` }) });
    return res.status(200).json({ success: true, imported, skipped });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
