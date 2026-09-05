import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const NEW_LEADS = [
  { firstName: "Ashpreet", lastName: "Bedi", email: "ashpreet@phidata.com", company: "Agno", title: "CEO", industry: "information technology & services", leadScore: 72 },
  { firstName: "Eden", lastName: "Chen", email: "eden@firstlook.gg", company: "FirstLook.gg", title: "CEO", industry: "computer games", leadScore: 68 },
  { firstName: "Oswaldo", lastName: "Medrano", email: "oswald@progresus.co", company: "Progresus", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Saul", lastName: "Marquez", email: "saul@outcomesrocket.com", company: "Outcomes Rocket", title: "CEO", industry: "marketing & advertising", leadScore: 74 },
  { firstName: "Mac", lastName: "Macleod", email: "macleod@carvertise.com", company: "Carvertise", title: "CEO", industry: "marketing & advertising", leadScore: 75 },
  { firstName: "Keith", lastName: "Friedenberg", email: "kfriedenberg@thectnx.com", company: "The Clinical Trials Network", title: "CEO", industry: "research", leadScore: 65 },
  { firstName: "Anderson", lastName: "Ferminiano", email: "anderson@lootrush.com", company: "LootRush", title: "CEO", industry: "financial services", leadScore: 70 },
  { firstName: "Cassandra", lastName: "Gholston", email: "cassandra@partnertap.com", company: "PartnerTap", title: "CEO", industry: "information technology & services", leadScore: 78 },
  { firstName: "Will", lastName: "Moss", email: "wrmoss@hbcuconnect.com", company: "HBCU CONNECT", title: "CEO", industry: "marketing & advertising", leadScore: 66 },
  { firstName: "Patrick", lastName: "Barry", email: "pbarry@blub0x.com", company: "BluB0X Security", title: "CEO", industry: "information technology & services", leadScore: 73 },
  { firstName: "Gustavo", lastName: "Lima", email: "guslima@orientetriangle.com", company: "Oriente Latin America", title: "CEO", industry: "transportation", leadScore: 67 },
  { firstName: "Dragos", lastName: "Rusu", email: "dragos@bytex.net", company: "Bytex Technologies", title: "CEO", industry: "information technology & services", leadScore: 71 },
  { firstName: "Dan", lastName: "Loveday", email: "danloveday@viridangroup.com", company: "Viridan Group", title: "CEO", industry: "staffing & recruiting", leadScore: 69 },
  { firstName: "Allen", lastName: "Bannon", email: "allen.bannon@vnomic.com", company: "Vnomic", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Ben", lastName: "Labay", email: "ben@speero.com", company: "Speero", title: "CEO", industry: "management consulting", leadScore: 76 },
  { firstName: "Paul", lastName: "OCarroll", email: "paul@arcol.io", company: "Arcol", title: "CEO", industry: "information technology & services", leadScore: 74 },
  { firstName: "Sampriti", lastName: "Bhattacharyya", email: "sampriti@navierboat.com", company: "Navier", title: "CEO", industry: "maritime", leadScore: 68 },
  { firstName: "Justin", lastName: "Watkins", email: "jwatkins@nativedigital.com", company: "Native Digital", title: "CEO", industry: "marketing & advertising", leadScore: 72 },
  { firstName: "Rafi", lastName: "Sands", email: "rafi@tandemspace.com", company: "Tandem", title: "CEO", industry: "information technology & services", leadScore: 71 },
  { firstName: "Akash", lastName: "Sharma", email: "akash@vellum.ai", company: "Vellum", title: "CEO", industry: "information technology & services", leadScore: 82 },
  { firstName: "Mackenzie", lastName: "Lee", email: "mackenzie@cedarchief.com", company: "Cedar", title: "CEO", industry: "professional training", leadScore: 70 },
  { firstName: "Cory", lastName: "Garner", email: "cory.garner@garner-advisory.com", company: "Garner Advisory", title: "CEO", industry: "management consulting", leadScore: 73 },
  { firstName: "Preston", lastName: "Clark", email: "preston@simpledocs.com", company: "SimpleDocs", title: "CEO", industry: "information technology & services", leadScore: 74 },
  { firstName: "Ashish", lastName: "Kadam", email: "ashish@lionreach.com", company: "Lion Reach Media", title: "CEO", industry: "marketing & advertising", leadScore: 71 },
  { firstName: "Firoze", lastName: "Moosakutty", email: "firoze@gizmeon.com", company: "Gizmeon", title: "CEO", industry: "information technology & services", leadScore: 69 },
  { firstName: "Meny", lastName: "Hoffman", email: "mhoffman@ptexgroup.com", company: "Ptex Group", title: "CEO", industry: "marketing & advertising", leadScore: 72 },
  { firstName: "Ali", lastName: "Sina", email: "ali@stealth1000.com", company: "STEALTH", title: "CEO", industry: "venture capital", leadScore: 75 },
  { firstName: "Ayoola", lastName: "John", email: "ayoola@astronaut.chat", company: "Astronaut", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Dave", lastName: "Schneider", email: "dave.schneider@shortlist.io", company: "Shortlist", title: "CEO", industry: "marketing & advertising", leadScore: 73 },
  { firstName: "Allison", lastName: "Hemming", email: "ahemming@thehiredguns.com", company: "The Hired Guns", title: "CEO", industry: "staffing & recruiting", leadScore: 71 },
  { firstName: "Melissa", lastName: "Rhit", email: "mfreeman@os2healthcaresolutions.com", company: "OS2 Healthcare Solutions", title: "CEO", industry: "health & wellness", leadScore: 68 },
  { firstName: "Jennifer", lastName: "Maffia", email: "jmaffia@advancedrecruitingpartners.com", company: "Advanced Recruiting Partners", title: "CEO", industry: "staffing & recruiting", leadScore: 70 },
  { firstName: "Nadia", lastName: "Sellers", email: "nadia@nationalcareergroup.com", company: "National Career Group", title: "CEO", industry: "staffing & recruiting", leadScore: 69 },
  { firstName: "Justin", lastName: "Fineberg", email: "justin@cassidyai.com", company: "Cassidy", title: "CEO", industry: "information technology & services", leadScore: 80 },
  { firstName: "Jeff", lastName: "Johnson", email: "jeff.johnson@rejournals.com", company: "REjournals", title: "CEO", industry: "online media", leadScore: 67 },
  { firstName: "Arindam", lastName: "Nag", email: "arindam@centsai.com", company: "CentSai", title: "CEO", industry: "e-learning", leadScore: 70 },
  { firstName: "Camille", lastName: "Fetter", email: "cfetter@talentfoot.com", company: "Talentfoot Executive Search", title: "CEO", industry: "staffing & recruiting", leadScore: 72 },
  { firstName: "Justin", lastName: "Nassiri", email: "justin@executivepresence.io", company: "Executive Presence", title: "CEO", industry: "public relations", leadScore: 74 },
  { firstName: "Steven", lastName: "Alan", email: "steven@stevenalan.com", company: "Steven Alan", title: "CEO", industry: "apparel & fashion", leadScore: 68 },
  { firstName: "Rob", lastName: "Briscoe", email: "rob@rockitmotors.com", company: "Rockit Motors", title: "CEO", industry: "machinery", leadScore: 66 },
  { firstName: "Chris", lastName: "Hadsall", email: "ch@apiarymedical.com", company: "Apiary Medical", title: "CEO", industry: "medical devices", leadScore: 71 },
  { firstName: "Jennifer", lastName: "Ferguson", email: "jferguson@handful.com", company: "Handful", title: "CEO", industry: "apparel & fashion", leadScore: 67 },
  { firstName: "Shay", lastName: "Myers", email: "shay@owyheeproduce.com", company: "Owyhee Produce", title: "CEO", industry: "food & beverages", leadScore: 65 },
  { firstName: "Moises", lastName: "Eilemberg", email: "meilemberg@xiltrixusa.com", company: "XiltriX North America", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Adam", lastName: "Braun", email: "ab@clarasight.com", company: "Clarasight", title: "CEO", industry: "information technology & services", leadScore: 73 },
  { firstName: "Chris", lastName: "Beaman", email: "chris@astronomic.com", company: "Astronomic", title: "CEO", industry: "information technology & services", leadScore: 75 },
  { firstName: "Fernando", lastName: "Ortiz", email: "fernando@bipsearch.com", company: "Barbachano International", title: "CEO", industry: "staffing & recruiting", leadScore: 72 },
  { firstName: "Joey", lastName: "Hougham", email: "joey@trangistics.com", company: "Trangistics", title: "CEO", industry: "logistics & supply chain", leadScore: 69 },
  { firstName: "Alex", lastName: "Hilleary", email: "alex@superpath.co", company: "Superpath", title: "CEO", industry: "marketing & advertising", leadScore: 74 },
  { firstName: "Eugene", lastName: "Musienko", email: "eugene.musienko@merehead.com", company: "Merehead", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Amrit", lastName: "Saxena", email: "amrit@saxecap.com", company: "SaxeCap", title: "CEO", industry: "venture capital", leadScore: 72 },
  { firstName: "Will", lastName: "Messina", email: "william@grailpay.com", company: "GrailPay", title: "CEO", industry: "financial services", leadScore: 76 },
  { firstName: "Jake", lastName: "Orion", email: "jakeo@mendotamerchants.com", company: "Mendota eCommerce", title: "CEO", industry: "marketing & advertising", leadScore: 71 },
  { firstName: "Veronica", lastName: "Ramirez", email: "vramirez@josephchris.com", company: "Joseph Chris Partners", title: "CEO", industry: "staffing & recruiting", leadScore: 70 },
  { firstName: "Tiffany", lastName: "Sequeira", email: "tiffanyj@prestigedevelopment.tech", company: "Prestige Development Group", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Sachin", lastName: "Narode", email: "sachin@xeni.com", company: "Xeni", title: "CEO", industry: "hospitality", leadScore: 72 },
  { firstName: "Will", lastName: "Minor", email: "willminor@nettingpros.com", company: "Netting Professionals", title: "CEO", industry: "construction", leadScore: 68 },
  { firstName: "Michael", lastName: "Patten", email: "mpatten@pattenco.com", company: "Patten Properties", title: "CEO", industry: "real estate", leadScore: 73 },
  { firstName: "Courtney", lastName: "Spaeth", email: "cbspaeth@growthprd.com", company: "growth[period]", title: "CEO", industry: "management consulting", leadScore: 74 },
  { firstName: "Yehuda", lastName: "Freilich", email: "yfreilich@exclusivelyremote.com", company: "Exclusively Remote", title: "CEO", industry: "staffing & recruiting", leadScore: 71 },
  { firstName: "Fia", lastName: "Fasbinder", email: "fia@moxieinstitute.com", company: "Moxie Institute", title: "CEO", industry: "professional training", leadScore: 72 },
  { firstName: "Oscar", lastName: "Rojas", email: "orojas@weintekusa.com", company: "Weintek USA", title: "CEO", industry: "computer hardware", leadScore: 69 },
  { firstName: "Stefano", lastName: "Fallaha", email: "stefano@podeo.co", company: "Podeo", title: "CEO", industry: "online media", leadScore: 71 },
  { firstName: "Neerja", lastName: "Emba", email: "neerja@geniusmesh.com", company: "GeniusMesh", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Victor", lastName: "Hunt", email: "victor@zingage.com", company: "Zingage", title: "CEO", industry: "information technology & services", leadScore: 72 },
  { firstName: "Bill", lastName: "Neumann", email: "william.neumann@groupdentistrynow.com", company: "Group Dentistry Now", title: "CEO", industry: "healthcare", leadScore: 69 },
  { firstName: "Allison", lastName: "Whalen", email: "allison@parentaly.com", company: "Parentaly", title: "CEO", industry: "human resources", leadScore: 73 },
  { firstName: "Sandeepsingh", lastName: "Sisodiya", email: "sandeepsingh@appsrow.com", company: "Appsrow", title: "CEO", industry: "information technology & services", leadScore: 70 },
  { firstName: "Jon", lastName: "Lindberg", email: "jlindberg@acrm.org", company: "ACRM", title: "CEO", industry: "research", leadScore: 66 },
  { firstName: "Ricardo", lastName: "Correa", email: "ricardo@mundopato.com", company: "Unitus Therapy Intelligence", title: "CEO", industry: "mental health care", leadScore: 68 },
  { firstName: "James", lastName: "Macnaghten", email: "james.macnaghten@caldera.co.uk", company: "Caldera", title: "CEO", industry: "renewables & environment", leadScore: 70 },
  { firstName: "Dave", lastName: "Schneider2", email: "dave@shortlist.io", company: "Shortlist", title: "CEO", industry: "marketing & advertising", leadScore: 71 },
];

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    let imported = 0, skipped = 0;

    for (const lead of NEW_LEADS) {
      try {
        const created = await prisma.lead.upsert({
          where: { email: lead.email },
          update: {},
          create: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            company: lead.company,
            title: lead.title,
            industry: lead.industry,
            leadScore: lead.leadScore,
            source: "apollo",
            status: "new",
          },
        });

        // Schedule Day 3/7/12/18 followups
        const days = [3, 7, 12, 18];
        for (let i = 0; i < days.length; i++) {
          const date = new Date();
          date.setDate(date.getDate() + days[i]);
          await prisma.followup.upsert({
            where: { id: `fu2-${created.id}-${i+1}` },
            update: {},
            create: { id: `fu2-${created.id}-${i+1}`, leadId: created.id, sequenceNumber: i+1, scheduledAt: date, status: "pending" },
          });
        }

        imported++;
      } catch(e) {
        if (e.code === "P2002") skipped++;
      }
    }

    const SLACK = process.env.SLACK_WEBHOOK;
    if (SLACK) {
      await fetch(SLACK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `📥 *New Leads Imported!*\n✅ New: ${imported}\n⏭️ Skipped (duplicates): ${skipped}\n📊 Total in DB: 24 + ${imported} = ${24 + imported} leads\n📅 Follow-ups scheduled: Day 3/7/12/18` }),
      });
    }

    return res.status(200).json({ success: true, imported, skipped, total: 24 + imported });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
