import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const RESEND = process.env.RESEND_API_KEY;
  const SLACK = process.env.SLACK_WEBHOOK;

  try {
    // GET - list all proposals
    if (req.method === "GET") {
      const deals = await prisma.deal.findMany({
        orderBy: { createdAt: "desc" },
        include: { lead: { select: { firstName: true, company: true, email: true, industry: true } } },
      });
      return res.status(200).json({ success: true, proposals: deals });
    }

    // POST - create + send proposal
    if (req.method === "POST") {
      const { leadId, value = 750, scope, timeline = "7 days", notes } = req.body;
      if (!leadId) return res.status(400).json({ error: "leadId required" });

      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) return res.status(404).json({ error: "Lead not found" });

      // Create deal
      const deal = await prisma.deal.create({
        data: {
          leadId,
          value,
          currency: "USD",
          stage: "PROPOSAL",
          probability: 60,
          status: "open",
          notes: notes || "",
        },
      });

      // Log event
      await prisma.leadEvent.create({
        data: {
          leadId,
          eventType: "PROPOSAL_SENT",
          actorType: "HUMAN",
          title: `Proposal sent — $${value}`,
          description: `Proposal for ${lead.company} sent via email`,
          metadata: { dealId: deal.id, value },
        },
      });

      // Update lead status
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "interested" },
      });

      // Send proposal email
      const proposalScope = scope || `
        <ul>
          <li>Custom website design (5-7 pages)</li>
          <li>Mobile responsive</li>
          <li>Fast load time optimized</li>
          <li>Contact form + lead capture</li>
          <li>SEO basics setup</li>
          <li>2 rounds of revisions</li>
          <li>Delivered in ${timeline}</li>
        </ul>
      `;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Vishal from ProSites <outreach@pro-sites.online>",
          reply_to: "vishal0786sandhu@gmail.com",
          to: lead.email,
          subject: `Website Proposal for ${lead.company} — $${value}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; }
              .header { background: #111; color: #fff; padding: 32px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .header p { margin: 8px 0 0; color: #aaa; font-size: 14px; }
              .body { padding: 32px; }
              .price-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
              .price { font-size: 48px; font-weight: 700; color: #16a34a; }
              .price-label { font-size: 14px; color: #666; margin-top: 4px; }
              .section { margin: 24px 0; }
              .section h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
              .section ul { padding-left: 20px; line-height: 2; color: #444; }
              .cta { background: #111; color: #fff; padding: 16px 32px; border-radius: 8px; text-align: center; display: block; text-decoration: none; font-size: 16px; font-weight: 600; margin: 24px 0; }
              .footer { background: #f9f9f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
              .timeline { display: flex; gap: 16px; margin-top: 12px; }
              .timeline-item { flex: 1; background: #f9f9f9; border-radius: 8px; padding: 12px; text-align: center; font-size: 13px; }
              .timeline-day { font-size: 20px; font-weight: 700; color: #111; }
            </style></head>
            <body>
              <div class="header">
                <h1>ProSites.online</h1>
                <p>Website Proposal for ${lead.company}</p>
              </div>
              <div class="body">
                <p>Hi ${lead.firstName},</p>
                <p>Thank you for your interest! Here's my proposal for <strong>${lead.company}'s</strong> new website.</p>

                <div class="price-box">
                  <div class="price">$${value}</div>
                  <div class="price-label">One-time payment · No hidden fees</div>
                </div>

                <div class="section">
                  <h3>What's included</h3>
                  ${proposalScope}
                </div>

                <div class="section">
                  <h3>Project timeline</h3>
                  <div class="timeline">
                    <div class="timeline-item"><div class="timeline-day">Day 1</div>Discovery call + brief</div>
                    <div class="timeline-item"><div class="timeline-day">Day 2-3</div>Design mockup</div>
                    <div class="timeline-item"><div class="timeline-day">Day 4-6</div>Development</div>
                    <div class="timeline-item"><div class="timeline-day">Day 7</div>Launch! 🚀</div>
                  </div>
                </div>

                <div class="section">
                  <h3>Payment terms</h3>
                  <ul>
                    <li>50% deposit to start ($${Math.round(value/2)})</li>
                    <li>50% on delivery ($${Math.round(value/2)})</li>
                    <li>Pay via bank transfer or PayPal</li>
                  </ul>
                </div>

                <div class="section">
                  <h3>Why ProSites?</h3>
                  <ul>
                    <li>Fast delivery — 7 days guaranteed</li>
                    <li>Modern, conversion-focused design</li>
                    <li>Mobile-first approach</li>
                    <li>Money-back if not satisfied</li>
                  </ul>
                </div>

                <a href="mailto:vishal0786sandhu@gmail.com?subject=Re: Website Proposal for ${lead.company}" class="cta">
                  ✅ Accept Proposal — Reply to this email
                </a>

                <p style="color:#888;font-size:13px;text-align:center">This proposal is valid for 7 days. Questions? Just reply to this email.</p>
              </div>
              <div class="footer">
                Vishal · ProSites.online · outreach@pro-sites.online<br/>
                <a href="mailto:vishal0786sandhu@gmail.com?subject=Unsubscribe">Unsubscribe</a>
              </div>
            </body>
            </html>
          `,
        }),
      });

      // Slack notification
      if (SLACK) {
        await fetch(SLACK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `💼 *Proposal Sent!*\n👤 ${lead.firstName} — ${lead.company}\n💰 Value: $${value}\n📧 Sent to: ${lead.email}\n⏰ Timeline: ${timeline}\n\n🔥 Follow up in 24 hours if no reply!`,
          }),
        });
      }

      return res.status(200).json({
        success: true,
        deal,
        emailSent: emailRes.ok,
        message: `Proposal sent to ${lead.email}!`,
      });
    }

    // PATCH - update deal stage
    if (req.method === "PATCH") {
      const { id, stage, status, value } = req.body;
      if (!id) return res.status(400).json({ error: "id required" });

      const deal = await prisma.deal.update({
        where: { id },
        data: {
          ...(stage && { stage }),
          ...(status && { status }),
          ...(value && { value }),
        },
        include: { lead: true },
      });

      if (status === "won") {
        await prisma.lead.update({ where: { id: deal.leadId }, data: { status: "closed" } });
        await prisma.leadEvent.create({
          data: {
            leadId: deal.leadId,
            eventType: "DEAL_WON",
            actorType: "HUMAN",
            title: `Deal WON — $${deal.value}`,
            description: `${deal.lead.company} closed!`,
            metadata: { dealId: id, value: deal.value },
          },
        });
        if (SLACK) {
          await fetch(SLACK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: `🎉 *DEAL WON!*\n🏢 ${deal.lead.company}\n💰 $${deal.value}\n\nFirst revenue! Keep going! 🚀` }),
          });
        }
      }

      return res.status(200).json({ success: true, deal });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally { await prisma.$disconnect(); }
}
