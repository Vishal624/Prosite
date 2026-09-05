import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const INTENTS = {
  POSITIVE: ["yes","interested","love to","sounds good","tell me more","send me","let's do","let's talk","when can","book","schedule","pricing","how much","cost","price","what's the","proposal","mockup","demo"],
  NEGATIVE: ["not interested","no thanks","remove me","don't contact","stop","unsubscribe","not looking","happy with","no need"],
  QUESTION: ["what is","how do","can you","do you","what kind","which","how long","how many","what technologies"],
  OUT_OF_OFFICE: ["out of office","on vacation","on leave","away from","will be back","auto-reply","automatic reply"],
  CALL_REQUEST: ["call","zoom","meet","calendar","schedule a","book a","chat"],
};

function classifyIntent(body) {
  const lower = body.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k))) return { intent, confidence: 0.85 };
  }
  return { intent: "UNCLEAR", confidence: 0.5 };
}

function aiSummary(intent, body) {
  const summaries = {
    POSITIVE: "Lead expressed interest. Follow up immediately with pricing or mockup.",
    NEGATIVE: "Lead declined. Stop sequence and mark as lost.",
    QUESTION: "Lead has a question. Reply with clear answer to move forward.",
    OUT_OF_OFFICE: "Lead is away. Sequence rescheduled automatically.",
    CALL_REQUEST: "Lead wants to talk. Book a call ASAP.",
    UNCLEAR: "Intent unclear. Read reply and respond manually.",
  };
  return summaries[intent] || summaries.UNCLEAR;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SLACK = process.env.SLACK_WEBHOOK;

  try {
    const { from, subject, text, to } = req.body;
    if (!from || !text) return res.status(400).json({ error: "Missing fields" });

    // Find lead by email
    const senderEmail = from.includes("<") ? from.match(/<(.+)>/)?.[1] : from;
    const lead = await prisma.lead.findFirst({
      where: { email: { contains: senderEmail?.split("@")[1] || senderEmail } },
    });

    const { intent, confidence } = classifyIntent(text);
    const summary = aiSummary(intent, text);
    const requiresHuman = ["POSITIVE", "CALL_REQUEST", "QUESTION"].includes(intent);

    // Store reply
    const reply = await prisma.reply.create({
      data: {
        leadId: lead?.id || "unknown",
        sender: from,
        subject: subject || "",
        body: text.slice(0, 2000),
        intent,
        confidence,
        requiresHuman,
        aiSummary: summary,
      },
    });

    // Update lead status
    if (lead) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: intent === "NEGATIVE" ? "lost" : "replied" },
      });

      // Cancel pending followups if replied
      await prisma.followup.updateMany({
        where: { leadId: lead.id, status: "pending" },
        data: { status: "cancelled", cancelReason: "lead_replied" },
      });

      await prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          eventType: "REPLY_RECEIVED",
          actorType: "AI",
          title: `Reply classified: ${intent}`,
          description: summary,
          metadata: { intent, confidence, requiresHuman },
        },
      });
    }

    // Slack alert
    if (SLACK) {
      const emoji = { POSITIVE: "🔥", NEGATIVE: "❌", QUESTION: "❓", CALL_REQUEST: "📞", OUT_OF_OFFICE: "✈️", UNCLEAR: "🤔" };
      const msg = requiresHuman
        ? `${emoji[intent] || "📩"} *REPLY — ACTION NEEDED!*\n👤 From: ${from}\n🏢 Company: ${lead?.company || "Unknown"}\n📧 Subject: ${subject}\n💬 Message: "${text.slice(0, 150)}..."\n\n🤖 AI: *${intent}* (${Math.round(confidence * 100)}% confidence)\n📋 ${summary}\n\n⚡ *YOU NEED TO RESPOND!*`
        : `${emoji[intent] || "📩"} *Reply received*\nFrom: ${from}\nIntent: ${intent}\nAI: ${summary}`;
      await fetch(SLACK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: msg }) });
    }

    return res.status(200).json({ success: true, intent, confidence, requiresHuman, summary });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  } finally {
    await prisma.$disconnect(); }
}
