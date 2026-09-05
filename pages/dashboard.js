import { useState, useEffect } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAll() {
    try {
      const [mRes, lRes] = await Promise.all([
        fetch("/api/db/metrics"),
        fetch("/api/db/leads?limit=50"),
      ]);
      const mData = await mRes.json();
      const lData = await lRes.json();
      if (mData.success) setMetrics(mData.metrics);
      if (lData.success) setLeads(lData.leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(id, status) {
    await fetch("/api/db/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchAll();
  }

  async function sendFollowups() {
    await fetch("/api/db/followups", { method: "POST" });
    fetchAll();
  }

  const STATUS_COLORS = {
    new: { bg: "#f3f4f6", text: "#374151" },
    contacted: { bg: "#dbeafe", text: "#1e40af" },
    opened: { bg: "#fef9c3", text: "#854d0e" },
    replied: { bg: "#dcfce7", text: "#166534" },
    interested: { bg: "#d1fae5", text: "#065f46" },
    closed: { bg: "#bbf7d0", text: "#14532d" },
    lost: { bg: "#fee2e2", text: "#991b1b" },
  };

  const s = {
    app: { fontFamily: "system-ui,sans-serif", background: "#0f0f0f", minHeight: "100vh", color: "#f5f5f5" },
    sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: 180, background: "#1a1a1a", borderRight: "1px solid #2a2a2a", padding: "16px 0", zIndex: 100 },
    logo: { padding: "0 16px 16px", fontSize: 16, fontWeight: 600, borderBottom: "1px solid #2a2a2a", marginBottom: 8, color: "#22c55e" },
    nav: { display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13, color: "#888", cursor: "pointer", transition: "all 0.15s" },
    navActive: { color: "#f5f5f5", background: "#2a2a2a" },
    main: { marginLeft: 180, padding: 24 },
    topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 600 },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 },
    kpi: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "14px 16px" },
    kpiVal: { fontSize: 28, fontWeight: 600, lineHeight: 1.1 },
    kpiLabel: { fontSize: 12, color: "#888", marginTop: 4 },
    card: { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, marginBottom: 14, overflow: "hidden" },
    cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2a2a2a" },
    cardTitle: { fontSize: 13, fontWeight: 500 },
    cardBody: { padding: "12px 16px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
    actRow: { display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid #1f1f1f", fontSize: 12, color: "#aaa", alignItems: "flex-start" },
    actTime: { color: "#555", minWidth: 55, fontSize: 11, marginTop: 1 },
    actorAI: { fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "#1e3a5f", color: "#60a5fa", marginRight: 4 },
    actorHuman: { fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "#14532d", color: "#4ade80", marginRight: 4 },
    funnelRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
    funnelLabel: { fontSize: 12, color: "#888", minWidth: 80 },
    funnelBarWrap: { flex: 1, background: "#2a2a2a", borderRadius: 4, height: 7 },
    funnelBar: { height: 7, borderRadius: 4 },
    funnelVal: { fontSize: 12, fontWeight: 500, minWidth: 28, textAlign: "right" },
    leadRow: { display: "grid", gridTemplateColumns: "1fr 90px 80px 70px 110px", gap: 10, padding: "8px 0", borderBottom: "1px solid #1f1f1f", fontSize: 12, alignItems: "center" },
    leadHead: { fontSize: 11, color: "#555", fontWeight: 500, display: "grid", gridTemplateColumns: "1fr 90px 80px 70px 110px", gap: 10, marginBottom: 8 },
    badge: { fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500 },
    btn: { fontSize: 11, padding: "4px 12px", borderRadius: 6, border: "1px solid #333", cursor: "pointer", background: "#2a2a2a", color: "#f5f5f5" },
    btnGreen: { background: "#14532d", color: "#4ade80", border: "1px solid #166534" },
    select: { fontSize: 11, padding: "3px 6px", borderRadius: 6, border: "1px solid #333", background: "#2a2a2a", color: "#f5f5f5", cursor: "pointer" },
    followRow: { display: "grid", gridTemplateColumns: "1fr 60px 80px 80px", gap: 10, padding: "7px 0", borderBottom: "1px solid #1f1f1f", fontSize: 12, alignItems: "center" },
    revenueCard: { background: "linear-gradient(135deg,#14532d,#166534)", borderRadius: 10, padding: 20, textAlign: "center", marginBottom: 14 },
  };

  if (loading) return (
    <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #22c55e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "#888", fontSize: 14 }}>Loading ProSites OS...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const m = metrics || {};
  const totalLeads = m.totalLeads || 0;
  const emailsSent = m.emailsSent || 0;
  const followupsDue = m.followupsDue || 0;
  const positiveReplies = m.positiveReplies || 0;
  const revenue = m.revenue || 0;
  const events = m.recentEvents || [];
  const byIndustry = m.leadsByIndustry || [];

  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "leads", label: "Leads" },
    { id: "followups", label: "Follow-ups" },
    { id: "pipeline", label: "Pipeline" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div style={s.app}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>ProSites OS</div>
        {navItems.map(n => (
          <div key={n.id} style={{ ...s.nav, ...(page === n.id ? s.navActive : {}) }} onClick={() => setPage(n.id)}>
            {n.label}
            {n.id === "followups" && followupsDue > 0 && (
              <span style={{ marginLeft: "auto", background: "#dc2626", color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 10 }}>{followupsDue}</span>
            )}
          </div>
        ))}
        <div style={{ padding: "16px", marginTop: "auto", borderTop: "1px solid #2a2a2a", position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <div style={{ fontSize: 11, color: "#555" }}>System status</div>
          <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>● All systems live</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Cron: 9:00 AM IST</div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.title}>{navItems.find(n => n.id === page)?.label}</div>
          <div style={{ fontSize: 12, color: "#555" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · Live
          </div>
        </div>

        {/* HOME */}
        {page === "home" && (
          <>
            <div style={s.kpiGrid}>
              <div style={s.kpi}>
                <div style={{ ...s.kpiVal, color: "#60a5fa" }}>{totalLeads}</div>
                <div style={s.kpiLabel}>Total leads</div>
              </div>
              <div style={s.kpi}>
                <div style={{ ...s.kpiVal, color: "#f59e0b" }}>{emailsSent}</div>
                <div style={s.kpiLabel}>Emails sent</div>
              </div>
              <div style={s.kpi}>
                <div style={{ ...s.kpiVal, color: followupsDue > 0 ? "#ef4444" : "#888" }}>{followupsDue}</div>
                <div style={s.kpiLabel}>Follow-ups due</div>
              </div>
              <div style={s.kpi}>
                <div style={{ ...s.kpiVal, color: "#22c55e" }}>${revenue}</div>
                <div style={s.kpiLabel}>Revenue</div>
              </div>
            </div>

            {followupsDue > 0 && (
              <div style={{ background: "#1c1917", border: "1px solid #92400e", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fbbf24" }}>⚡ {followupsDue} follow-ups due now</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Send to stay top of mind with your leads</div>
                </div>
                <button style={{ ...s.btn, ...s.btnGreen }} onClick={sendFollowups}>Send all now</button>
              </div>
            )}

            <div style={s.grid2}>
              <div style={s.card}>
                <div style={s.cardHead}>
                  <div style={s.cardTitle}>AI activity feed</div>
                  <span style={{ fontSize: 11, color: "#555" }}>Last 10 events</span>
                </div>
                <div style={{ ...s.cardBody, padding: "8px 16px" }}>
                  {events.length === 0 && <div style={{ color: "#555", fontSize: 13, padding: "8px 0" }}>No events yet</div>}
                  {events.map((e, i) => (
                    <div key={i} style={{ ...s.actRow, ...(i === events.length - 1 ? { borderBottom: "none" } : {}) }}>
                      <div style={s.actTime}>{new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                      <span style={e.actorType === "HUMAN" ? s.actorHuman : s.actorAI}>{e.actorType === "HUMAN" ? "You" : "AI"}</span>
                      <span>{e.lead?.firstName} — {e.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.card}>
                <div style={s.cardHead}><div style={s.cardTitle}>Conversion funnel</div></div>
                <div style={s.cardBody}>
                  {[
                    { label: "Leads", val: totalLeads, color: "#60a5fa" },
                    { label: "Emailed", val: emailsSent, color: "#f59e0b" },
                    { label: "Opened", val: m.allReplies || 0, color: "#a78bfa" },
                    { label: "Replied", val: m.allReplies || 0, color: "#34d399" },
                    { label: "Positive", val: positiveReplies, color: "#22c55e" },
                    { label: "Won", val: m.dealsWon || 0, color: "#4ade80" },
                  ].map((r, i) => (
                    <div key={i} style={s.funnelRow}>
                      <div style={s.funnelLabel}>{r.label}</div>
                      <div style={s.funnelBarWrap}>
                        <div style={{ ...s.funnelBar, width: `${totalLeads > 0 ? (r.val / totalLeads) * 100 : 0}%`, background: r.color }} />
                      </div>
                      <div style={{ ...s.funnelVal, color: r.val > 0 ? r.color : "#555" }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardHead}><div style={s.cardTitle}>Leads by industry</div></div>
              <div style={s.cardBody}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {byIndustry.map((b, i) => (
                    <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#2a2a2a", color: "#aaa", border: "1px solid #333" }}>
                      {b.industry} <strong style={{ color: "#f5f5f5" }}>{b._count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* LEADS */}
        {page === "leads" && (
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardTitle}>All leads ({leads.length})</div>
              <span style={{ fontSize: 12, color: "#555" }}>Live from database</span>
            </div>
            <div style={{ padding: "0 16px" }}>
              <div style={s.leadHead}>
                <span>Lead</span><span>Industry</span><span>Score</span><span>Status</span><span>Action</span>
              </div>
              {leads.map((lead, i) => {
                const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
                return (
                  <div key={lead.id} style={{ ...s.leadRow, ...(i === leads.length - 1 ? { borderBottom: "none" } : {}) }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{lead.firstName} — {lead.company}</div>
                      <div style={{ color: "#555", fontSize: 11 }}>{lead.email}</div>
                    </div>
                    <div style={{ color: "#888", fontSize: 12 }}>{lead.industry}</div>
                    <div style={{ fontWeight: 500, color: lead.leadScore >= 80 ? "#22c55e" : lead.leadScore >= 70 ? "#f59e0b" : "#888" }}>{lead.leadScore}</div>
                    <span style={{ ...s.badge, background: sc.bg, color: sc.text }}>{lead.status}</span>
                    <select style={s.select} value={lead.status} onChange={e => updateLeadStatus(lead.id, e.target.value)}>
                      {["new","contacted","opened","replied","interested","closed","lost"].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOLLOW-UPS */}
        {page === "followups" && (
          <>
            <div style={{ ...s.kpiGrid, gridTemplateColumns: "repeat(3,1fr)" }}>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#ef4444" }}>{followupsDue}</div><div style={s.kpiLabel}>Due now</div></div>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#f59e0b" }}>{m.followupsSent || 0}</div><div style={s.kpiLabel}>Sent total</div></div>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#22c55e" }}>{leads.length * 4}</div><div style={s.kpiLabel}>Scheduled total</div></div>
            </div>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardTitle}>Follow-up sequences (Day 3 / 7 / 12 / 18)</div>
                <button style={{ ...s.btn, ...s.btnGreen }} onClick={sendFollowups}>Send due now</button>
              </div>
              <div style={{ padding: "0 16px" }}>
                <div style={{ ...s.followRow, fontSize: 11, color: "#555", fontWeight: 500, marginBottom: 6 }}>
                  <span>Lead</span><span>Day</span><span>Status</span><span>Scheduled</span>
                </div>
                {leads.slice(0, 10).map((lead, i) => (
                  [1,2,3,4].map(seq => (
                    <div key={`${lead.id}-${seq}`} style={{ ...s.followRow, ...(i === 9 && seq === 4 ? { borderBottom: "none" } : {}) }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{lead.firstName} — {lead.company}</div>
                      </div>
                      <div style={{ color: "#888" }}>Day {seq === 1 ? 3 : seq === 2 ? 7 : seq === 3 ? 12 : 18}</div>
                      <span style={{ ...s.badge, background: "#1e3a5f", color: "#60a5fa" }}>pending</span>
                      <div style={{ color: "#555", fontSize: 11 }}>+{seq === 1 ? 3 : seq === 2 ? 7 : seq === 3 ? 12 : 18}d</div>
                    </div>
                  ))
                ))}
              </div>
            </div>
          </>
        )}

        {/* PIPELINE */}
        {page === "pipeline" && (
          <>
            <div style={{ ...s.revenueCard }}>
              <div style={{ fontSize: 13, color: "#86efac" }}>Total Revenue</div>
              <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", margin: "8px 0" }}>${revenue.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: "#86efac" }}>{m.dealsWon || 0} deals closed · First close expected Week 2</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {["Contacted","Interested","Proposal","Won"].map((stage, si) => (
                <div key={stage} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, color: "#555", fontWeight: 500, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {stage} <span style={{ color: "#333" }}>({si === 0 ? leads.length : 0})</span>
                  </div>
                  {si === 0 && leads.slice(0, 4).map(lead => (
                    <div key={lead.id} style={{ background: "#2a2a2a", borderRadius: 6, padding: 8, marginBottom: 6, fontSize: 12 }}>
                      <div style={{ fontWeight: 500 }}>{lead.firstName}</div>
                      <div style={{ color: "#555", fontSize: 11 }}>{lead.company}</div>
                    </div>
                  ))}
                  {si === 0 && leads.length > 4 && (
                    <div style={{ fontSize: 11, color: "#555", textAlign: "center", padding: "4px 0" }}>+{leads.length - 4} more</div>
                  )}
                  {si > 0 && <div style={{ fontSize: 12, color: "#555", textAlign: "center", padding: 16 }}>Empty</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ANALYTICS */}
        {page === "analytics" && (
          <>
            <div style={s.kpiGrid}>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#888" }}>0%</div><div style={s.kpiLabel}>Open rate (target 20%)</div></div>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#888" }}>0%</div><div style={s.kpiLabel}>Reply rate (target 5%)</div></div>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#888" }}>0%</div><div style={s.kpiLabel}>Close rate (target 25%)</div></div>
              <div style={s.kpi}><div style={{ ...s.kpiVal, color: "#22c55e" }}>₹99</div><div style={s.kpiLabel}>Total AI cost</div></div>
            </div>
            <div style={s.grid2}>
              <div style={s.card}>
                <div style={s.cardHead}><div style={s.cardTitle}>Top industries</div></div>
                <div style={s.cardBody}>
                  {byIndustry.map((b, i) => (
                    <div key={i} style={s.funnelRow}>
                      <div style={s.funnelLabel}>{b.industry}</div>
                      <div style={s.funnelBarWrap}>
                        <div style={{ ...s.funnelBar, width: `${(b._count / totalLeads) * 100}%`, background: "#60a5fa" }} />
                      </div>
                      <div style={{ ...s.funnelVal, color: "#60a5fa" }}>{b._count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={s.card}>
                <div style={s.cardHead}><div style={s.cardTitle}>What to do next</div></div>
                <div style={s.cardBody}>
                  {[
                    { label: "Send Day 3 follow-ups", urgency: "Now", color: "#ef4444" },
                    { label: "Get 25 more leads (Apollo)", urgency: "This week", color: "#f59e0b" },
                    { label: "Set up reply inbox", urgency: "Next", color: "#60a5fa" },
                    { label: "Connect Paperclip agents", urgency: "Week 2", color: "#888" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 3 ? "1px solid #1f1f1f" : "none", fontSize: 13 }}>
                      <span>{item.label}</span>
                      <span style={{ fontSize: 11, color: item.color, fontWeight: 500 }}>{item.urgency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
