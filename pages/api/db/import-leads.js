import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ALL_LEADS = [
  // ORIGINAL 24
   { firstName: "virender", email: "vk509816@gmail.com", company: "Lucida Surfaces", industry: "building materials", leadScore: 72 },
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
  { firstName: "Andrew", email: "andrew.price@poliigon.com", company: "Poliigon", industry: "3D media", leadScore: 71 },
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
  // NEW 72
  { firstName: "Ashpreet", email: "ashpreet@phidata.com", company: "Agno", industry: "information technology & services", leadScore: 72 },
  { firstName: "Eden", email: "eden@firstlook.gg", company: "FirstLook.gg", industry: "computer games", leadScore: 68 },
  { firstName: "Oswaldo", email: "oswald@progresus.co", company: "Progresus", industry: "information technology & services", leadScore: 70 },
  { firstName: "Saul", email: "saul@outcomesrocket.com", company: "Outcomes Rocket", industry: "marketing & advertising", leadScore: 74 },
  { firstName: "Mac", email: "macleod@carvertise.com", company: "Carvertise", industry: "marketing & advertising", leadScore: 75 },
  { firstName: "Keith", email: "kfriedenberg@thectnx.com", company: "Clinical Trials Network", industry: "research", leadScore: 65 },
  { firstName: "Anderson", email: "anderson@lootrush.com", company: "LootRush", industry: "financial services", leadScore: 70 },
  { firstName: "Cassandra", email: "cassandra@partnertap.com", company: "PartnerTap", industry: "information technology & services", leadScore: 78 },
  { firstName: "Will", email: "wrmoss@hbcuconnect.com", company: "HBCU CONNECT", industry: "marketing & advertising", leadScore: 66 },
  { firstName: "Patrick", email: "pbarry@blub0x.com", company: "BluB0X Security", industry: "information technology & services", leadScore: 73 },
  { firstName: "Dragos", email: "dragos@bytex.net", company: "Bytex Technologies", industry: "information technology & services", leadScore: 71 },
  { firstName: "Dan", email: "danloveday@viridangroup.com", company: "Viridan Group", industry: "staffing & recruiting", leadScore: 69 },
  { firstName: "Ben", email: "ben@speero.com", company: "Speero", industry: "management consulting", leadScore: 76 },
  { firstName: "Paul", email: "paul@arcol.io", company: "Arcol", industry: "information technology & services", leadScore: 74 },
  { firstName: "Justin", email: "jwatkins@nativedigital.com", company: "Native Digital", industry: "marketing & advertising", leadScore: 72 },
  { firstName: "Akash", email: "akash@vellum.ai", company: "Vellum", industry: "information technology & services", leadScore: 82 },
  { firstName: "Cory", email: "cory.garner@garner-advisory.com", company: "Garner Advisory", industry: "management consulting", leadScore: 73 },
  { firstName: "Preston", email: "preston@simpledocs.com", company: "SimpleDocs", industry: "information technology & services", leadScore: 74 },
  { firstName: "Ashish", email: "ashish@lionreach.com", company: "Lion Reach Media", industry: "marketing & advertising", leadScore: 71 },
  { firstName: "Meny", email: "mhoffman@ptexgroup.com", company: "Ptex Group", industry: "marketing & advertising", leadScore: 72 },
  { firstName: "Ali", email: "ali@stealth1000.com", company: "STEALTH", industry: "venture capital", leadScore: 75 },
  { firstName: "Ayoola", email: "ayoola@astronaut.chat", company: "Astronaut", industry: "information technology & services", leadScore: 70 },
  { firstName: "Dave", email: "dave.schneider@shortlist.io", company: "Shortlist", industry: "marketing & advertising", leadScore: 73 },
  { firstName: "Allison", email: "ahemming@thehiredguns.com", company: "The Hired Guns", industry: "staffing & recruiting", leadScore: 71 },
  { firstName: "Jennifer", email: "jmaffia@advancedrecruitingpartners.com", company: "Advanced Recruiting Partners", industry: "staffing & recruiting", leadScore: 70 },
  { firstName: "Nadia", email: "nadia@nationalcareergroup.com", company: "National Career Group", industry: "staffing & recruiting", leadScore: 69 },
  { firstName: "Justin", email: "justin@cassidyai.com", company: "Cassidy", industry: "information technology & services", leadScore: 80 },
  { firstName: "Camille", email: "cfetter@talentfoot.com", company: "Talentfoot", industry: "staffing & recruiting", leadScore: 72 },
  { firstName: "Justin", email: "justin@executivepresence.io", company: "Executive Presence", industry: "public relations", leadScore: 74 },
  { firstName: "Chris", email: "ch@apiarymedical.com", company: "Apiary Medical", industry: "medical devices", leadScore: 71 },
  { firstName: "Moises", email: "meilemberg@xiltrixusa.com", company: "XiltriX North America", industry: "information technology & services", leadScore: 70 },
  { firstName: "Adam", email: "ab@clarasight.com", company: "Clarasight", industry: "information technology & services", leadScore: 73 },
  { firstName: "Chris", email: "chris@astronomic.com", company: "Astronomic", industry: "information technology & services", leadScore: 75 },
  { firstName: "Fernando", email: "fernando@bipsearch.com", company: "Barbachano International", industry: "staffing & recruiting", leadScore: 72 },
  { firstName: "Joey", email: "joey@trangistics.com", company: "Trangistics", industry: "logistics & supply chain", leadScore: 69 },
  { firstName: "Alex", email: "alex@superpath.co", company: "Superpath", industry: "marketing & advertising", leadScore: 74 },
  { firstName: "Will", email: "william@grailpay.com", company: "GrailPay", industry: "financial services", leadScore: 76 },
  { firstName: "Veronica", email: "vramirez@josephchris.com", company: "Joseph Chris Partners", industry: "staffing & recruiting", leadScore: 70 },
  { firstName: "Sachin", email: "sachin@xeni.com", company: "Xeni", industry: "hospitality", leadScore: 72 },
  { firstName: "Michael", email: "mpatten@pattenco.com", company: "Patten Properties", industry: "real estate", leadScore: 73 },
  { firstName: "Courtney", email: "cbspaeth@growthprd.com", company: "growth[period]", industry: "management consulting", leadScore: 74 },
  { firstName: "Yehuda", email: "yfreilich@exclusivelyremote.com", company: "Exclusively Remote", industry: "staffing & recruiting", leadScore: 71 },
  { firstName: "Fia", email: "fia@moxieinstitute.com", company: "Moxie Institute", industry: "professional training", leadScore: 72 },
  { firstName: "Stefano", email: "stefano@podeo.co", company: "Podeo", industry: "online media", leadScore: 71 },
  { firstName: "Victor", email: "victor@zingage.com", company: "Zingage", industry: "information technology & services", leadScore: 72 },
  { firstName: "Allison", email: "allison@parentaly.com", company: "Parentaly", industry: "human resources", leadScore: 73 },
  { firstName: "Arindam", email: "arindam@centsai.com", company: "CentSai", industry: "e-learning", leadScore: 70 },
  { firstName: "Will", email: "willminor@nettingpros.com", company: "Netting Professionals", industry: "construction", leadScore: 68 },
  { firstName: "Amrit", email: "amrit@saxecap.com", company: "SaxeCap", industry: "venture capital", leadScore: 72 },
];

function getEmailContent(firstName, company, industry) {
  const i = (industry || "").toLowerCase();
  if (["saas","tech","ai","fintech","hr tech","information technology","computer software"].some(x => i.includes(x)))
    return { subject: `${company}'s website is costing you signups`, html: `<p>Hi ${firstName},</p><p>${company} looks solid — but your website isn't converting the way it should.</p><p>I build high-converting websites for founders in 5-7 days for $500–$1,000. Can I send a free audit?</p><p>Reply YES and I'll get it to you within 24 hours.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  if (["staffing","recruiting","executive search","consulting"].some(x => i.includes(x)))
    return { subject: `Are clients finding ${company} online?`, html: `<p>Hi ${firstName},</p><p>In your industry, your website is the first impression a client gets.</p><p>I build professional websites for service businesses in under a week for $500–$1,000. Free mockup for ${company}?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  if (["marketing","advertising","pr","public relations"].some(x => i.includes(x)))
    return { subject: `Is ${company}'s website generating leads for you?`, html: `<p>Hi ${firstName},</p><p>You help others with marketing — but is ${company}'s website generating enough leads for you?</p><p>I build high-converting sites in 5-7 days for $500–$1,000. Free audit?</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
  return { subject: `Quick thought on ${company}'s website`, html: `<p>Hi ${firstName},</p><p>I came across ${company} and think there's an opportunity to win more business with a sharper website.</p><p>I build modern sites for US founders in 5-7 days for $500–$1,000. Free mockup?</p><p>Reply YES and I'll send it over.</p><p>Best,<br/>Vishal<br/>ProSites.online</p>` };
}

export default async function handler(req, res) {
  const RESEND = process.env.RESEND_API_KEY;
  const SLACK = process.env.SLACK_WEBHOOK;

  try {
    let imported = 0, skipped = 0, emailed = 0, emailFailed = 0;

    for (const lead of ALL_LEADS) {
      try {
        const record = await prisma.lead.upsert({
          where: { email: lead.email },
          update: {},
          create: { firstName: lead.firstName, lastName: lead.lastName || null, email: lead.email, company: lead.company, title: "CEO", industry: lead.industry, leadScore: lead.leadScore, source: "apollo", status: "new" },
        });

        // Only email if not already contacted
        if (record.status === "new") {
          const { subject, html } = getEmailContent(record.firstName, record.company, record.industry);
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: "Vishal from ProSites <outreach@pro-sites.online>", reply_to: "vishal0786sandhu@gmail.com", to: record.email, subject, html }),
          });
          if (r.ok) {
            await prisma.lead.update({ where: { id: record.id }, data: { status: "contacted", lastContactedAt: new Date() } });
            await prisma.leadEvent.create({ data: { leadId: record.id, eventType: "EMAIL_SENT", actorType: "AI", title: "Initial cold email sent", metadata: { industry: record.industry } } });
            // Schedule followups
            for (const [seq, days] of [[1,3],[2,7],[3,12],[4,18]]) {
              const d = new Date(); d.setDate(d.getDate() + days);
              await prisma.followup.upsert({ where: { id: `fu-${record.id}-${seq}` }, update: {}, create: { id: `fu-${record.id}-${seq}`, leadId: record.id, sequenceNumber: seq, scheduledAt: d, status: "pending" } });
            }
            emailed++;
          } else { emailFailed++; }
          await new Promise(r => setTimeout(r, 300));
        } else { skipped++; }
        imported++;
      } catch(e) { if (e.code !== "P2002") console.error(e.message); }
    }

    if (SLACK) await fetch(SLACK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `📥 *Import + Email Complete!*\n📊 Total leads: ${imported}\n⏭️ Already emailed: ${skipped}\n📧 Newly emailed: ${emailed}\n❌ Failed: ${emailFailed}` }) });
    return res.status(200).json({ success: true, imported, skipped, emailed, emailFailed });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
