import { useState, useEffect, useMemo } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [proposalModal, setProposalModal] = useState(null);
  const [proposalValue, setProposalValue] = useState("750");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAll();
    const i = setInterval(() => fetch("/api/db/metrics").then(r=>r.json()).then(d=>{ if(d.success) setMetrics(d.metrics); }), 30000);
    return () => clearInterval(i);
  }, []);

  async function fetchAll() {
    try {
      const [mRes, lRes, pRes] = await Promise.all([
        fetch("/api/db/metrics"), fetch("/api/db/leads?limit=200"), fetch("/api/db/proposals"),
      ]);
      const [mData, lData, pData] = await Promise.all([mRes.json(), lRes.json(), pRes.json()]);
      if (mData.success) setMetrics(mData.metrics);
      if (lData.leads) setLeads(lData.leads);
      if (pData.success) setProposals(pData.proposals);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || `${l.firstName} ${l.company} ${l.email}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  function showToast(msg, color = "#22c55e") {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }

  async function updateLeadStatus(id, status) {
    await fetch("/api/db/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchAll();
  }

  async function sendFollowups() {
    const r = await fetch("/api/db/followups", { method: "POST" });
    const d = await r.json();
    showToast(`✅ Sent ${d.sent} follow-ups!`);
    fetchAll();
  }

  async function sendProposal() {
    if (!proposalModal) return;
    setSending(true);
    try {
      const r = await fetch("/api/db/proposals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: proposalModal.id, value: parseInt(proposalValue) }) });
      const d = await r.json();
      if (d.success) { showToast(`💼 Proposal sent to ${proposalModal.firstName}!`); setProposalModal(null); fetchAll(); }
      else showToast(`❌ Error: ${d.error}`, "#ef4444");
    } catch(e) { showToast(`❌ ${e.message}`, "#ef4444"); }
    setSending(false);
  }

  async function markWon(dealId, value) {
    await fetch("/api/db/proposals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: dealId, status: "won" }) });
    showToast(`🎉 DEAL WON! $${value} revenue recorded!`);
    fetchAll();
  }

  const SC = { new:"#374151", contacted:"#1e40af", opened:"#854d0e", replied:"#166534", interested:"#065f46", closed:"#14532d", lost:"#991b1b" };
  const SB = { new:"#f3f4f6", contacted:"#dbeafe", opened:"#fef9c3", replied:"#dcfce7", interested:"#d1fae5", closed:"#bbf7d0", lost:"#fee2e2" };

  const s = {
    app: { fontFamily:"system-ui,sans-serif", background:"#0f0f0f", minHeight:"100vh", color:"#f5f5f5" },
    sidebar: { position:"fixed", left:0, top:0, bottom:0, width:180, background:"#1a1a1a", borderRight:"1px solid #2a2a2a", padding:"16px 0", zIndex:100 },
    logo: { padding:"0 16px 16px", fontSize:16, fontWeight:600, borderBottom:"1px solid #2a2a2a", marginBottom:8, color:"#22c55e" },
    nav: { display:"flex", alignItems:"center", gap:8, padding:"8px 16px", fontSize:13, color:"#888", cursor:"pointer" },
    navActive: { color:"#f5f5f5", background:"#2a2a2a" },
    main: { marginLeft:180, padding:24 },
    topbar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 },
    kpiGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 },
    kpi: { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"14px 16px" },
    kpiVal: { fontSize:28, fontWeight:600, lineHeight:1.1 },
    kpiLabel: { fontSize:12, color:"#888", marginTop:4 },
    card: { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, marginBottom:14, overflow:"hidden" },
    cardHead: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #2a2a2a" },
    cardTitle: { fontSize:13, fontWeight:500 },
    cardBody: { padding:"12px 16px" },
    grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
    actRow: { display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid #1f1f1f", fontSize:12, color:"#aaa", alignItems:"flex-start" },
    actTime: { color:"#555", minWidth:55, fontSize:11, marginTop:1 },
    actorAI: { fontSize:10, padding:"1px 6px", borderRadius:10, background:"#1e3a5f", color:"#60a5fa", marginRight:4, whiteSpace:"nowrap" },
    actorHuman: { fontSize:10, padding:"1px 6px", borderRadius:10, background:"#14532d", color:"#4ade80", marginRight:4, whiteSpace:"nowrap" },
    fRow: { display:"flex", alignItems:"center", gap:10, marginBottom:10 },
    fLabel: { fontSize:12, color:"#888", minWidth:80 },
    fBarWrap: { flex:1, background:"#2a2a2a", borderRadius:4, height:7 },
    fBar: { height:7, borderRadius:4 },
    fVal: { fontSize:12, fontWeight:500, minWidth:28, textAlign:"right" },
    leadRow: { display:"grid", gridTemplateColumns:"1fr 80px 60px 80px 80px 100px", gap:8, padding:"8px 0", borderBottom:"1px solid #1f1f1f", fontSize:12, alignItems:"center" },
    leadHead: { fontSize:11, color:"#555", fontWeight:500, display:"grid", gridTemplateColumns:"1fr 80px 60px 80px 80px 100px", gap:8, marginBottom:8 },
    badge: { fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:500 },
    btn: { fontSize:11, padding:"4px 10px", borderRadius:6, border:"1px solid #333", cursor:"pointer", background:"#2a2a2a", color:"#f5f5f5" },
    btnGreen: { background:"#14532d", color:"#4ade80", border:"1px solid #166534" },
    btnBlue: { background:"#1e3a5f", color:"#60a5fa", border:"1px solid #1e40af" },
    select: { fontSize:11, padding:"3px 6px", borderRadius:6, border:"1px solid #333", background:"#2a2a2a", color:"#f5f5f5", cursor:"pointer" },
    searchBar: { width:"100%", padding:"8px 12px", borderRadius:6, border:"1px solid #2a2a2a", background:"#111", color:"#f5f5f5", fontSize:13, marginBottom:12, outline:"none" },
    modal: { position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" },
    modalBox: { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:12, padding:24, width:400 },
    input: { width:"100%", padding:"8px 12px", borderRadius:6, border:"1px solid #333", background:"#2a2a2a", color:"#f5f5f5", fontSize:14, marginBottom:12, boxSizing:"border-box" },
    pipeCol: { background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:12 },
    pipeTitle: { fontSize:11, color:"#555", fontWeight:500, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.04em" },
    dealCard: { background:"#2a2a2a", borderRadius:6, padding:8, marginBottom:6, fontSize:12 },
  };

  if (loading) return (
    <div style={{ ...s.app, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <div style={{ width:40, height:40, border:"3px solid #22c55e", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <div style={{ color:"#888", fontSize:14 }}>Loading ProSites OS...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const m = metrics || {};
  const totalLeads = m.totalLeads || 0;
  const emailsSent = m.emailsSent || 0;
  const followupsDue = m.followupsDue || 0;
  const positiveReplies = m.positiveReplies || 0;
  const events = m.recentEvents || [];
  const byIndustry = m.leadsByIndustry || [];
  const wonDeals = proposals.filter(p => p.status === "won");
  const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
  const openDeals = proposals.filter(p => p.status === "open");

  // Real followup data from leads
  const allFollowups = leads.flatMap(l => (l.followups || []).map(f => ({ ...f, lead: l })));
  const pendingFollowups = allFollowups.filter(f => f.status === "pending");
  const sentFollowups = allFollowups.filter(f => f.status === "sent");

  const navItems = [
    { id:"home", label:"Dashboard" },
    { id:"leads", label:"Leads" },
    { id:"followups", label:"Follow-ups" },
    { id:"proposals", label:"Proposals" },
    { id:"pipeline", label:"Pipeline" },
    { id:"analytics", label:"Analytics" },
  ];

  return (
    <div style={s.app}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * {box-sizing:border-box}`}</style>

      {toast && (
        <div style={{ position:"fixed", top:16, right:16, background:toast.color, color:"#fff", padding:"10px 20px", borderRadius:8, fontSize:13, fontWeight:500, zIndex:300, boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>
          {toast.msg}
        </div>
      )}

      {proposalModal && (
        <div style={s.modal} onClick={() => setProposalModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>Send Proposal</div>
            <div style={{ fontSize:13, color:"#888", marginBottom:16 }}>{proposalModal.firstName} — {proposalModal.company}</div>
            <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>Proposal value ($)</div>
            <input style={s.input} type="number" value={proposalValue} onChange={e => setProposalValue(e.target.value)} placeholder="750" />
            <div style={{ fontSize:12, color:"#555", marginBottom:16 }}>
              Deposit: ${Math.round(parseInt(proposalValue||0)/2)} · Final: ${Math.round(parseInt(proposalValue||0)/2)}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ ...s.btn, flex:1 }} onClick={() => setProposalModal(null)}>Cancel</button>
              <button style={{ ...s.btn, ...s.btnGreen, flex:2 }} onClick={sendProposal} disabled={sending}>
                {sending ? "Sending..." : `💼 Send $${proposalValue} Proposal`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.sidebar}>
        <div style={s.logo}>ProSites OS</div>
        {navItems.map(n => (
          <div key={n.id} style={{ ...s.nav, ...(page===n.id ? s.navActive : {}) }} onClick={() => setPage(n.id)}>
            {n.label}
            {n.id==="followups" && followupsDue>0 && <span style={{ marginLeft:"auto", background:"#dc2626", color:"#fff", fontSize:10, padding:"1px 6px", borderRadius:10 }}>{followupsDue}</span>}
            {n.id==="proposals" && openDeals.length>0 && <span style={{ marginLeft:"auto", background:"#1e3a5f", color:"#60a5fa", fontSize:10, padding:"1px 6px", borderRadius:10 }}>{openDeals.length}</span>}
          </div>
        ))}
        <div style={{ padding:"16px", borderTop:"1px solid #2a2a2a", position:"absolute", bottom:0, left:0, right:0 }}>
          <div style={{ fontSize:11, color:"#555" }}>System status</div>
          <div style={{ fontSize:12, color:"#22c55e", marginTop:4 }}>● All systems live</div>
          <div style={{ fontSize:11, color:"#555", marginTop:4 }}>Cron: 9:00 AM IST</div>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={{ fontSize:20, fontWeight:600 }}>{navItems.find(n=>n.id===page)?.label}</div>
          <div style={{ fontSize:12, color:"#555" }}>{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})} · Live</div>
        </div>

        {/* HOME */}
        {page==="home" && <>
          <div style={s.kpiGrid}>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#60a5fa"}}>{totalLeads}</div><div style={s.kpiLabel}>Total leads</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#f59e0b"}}>{emailsSent}</div><div style={s.kpiLabel}>Emails sent</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:followupsDue>0?"#ef4444":"#888"}}>{followupsDue}</div><div style={s.kpiLabel}>Follow-ups due</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#22c55e"}}>${totalRevenue}</div><div style={s.kpiLabel}>Revenue won</div></div>
          </div>

          {followupsDue>0 && (
            <div style={{ background:"#1c1917", border:"1px solid #92400e", borderRadius:10, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:"#fbbf24" }}>⚡ {followupsDue} follow-ups due now</div>
                <div style={{ fontSize:12, color:"#888", marginTop:2 }}>Send to stay top of mind</div>
              </div>
              <button style={{...s.btn,...s.btnGreen}} onClick={sendFollowups}>Send all now</button>
            </div>
          )}

          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardHead}><div style={s.cardTitle}>AI activity feed</div><span style={{fontSize:11,color:"#555"}}>Last 10</span></div>
              <div style={{...s.cardBody,padding:"8px 16px"}}>
                {events.length===0 && <div style={{color:"#555",fontSize:13,padding:"8px 0"}}>No events yet</div>}
                {events.map((e,i) => (
                  <div key={i} style={{...s.actRow,...(i===events.length-1?{borderBottom:"none"}:{})}}>
                    <div style={s.actTime}>{new Date(e.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
                    <span style={e.actorType==="HUMAN"?s.actorHuman:s.actorAI}>{e.actorType==="HUMAN"?"You":"AI"}</span>
                    <span>{e.lead?.firstName} — {e.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardHead}><div style={s.cardTitle}>Conversion funnel</div></div>
              <div style={s.cardBody}>
                {[
                  {label:"Leads",val:totalLeads,color:"#60a5fa"},
                  {label:"Emailed",val:emailsSent,color:"#f59e0b"},
                  {label:"Replied",val:m.allReplies||0,color:"#34d399"},
                  {label:"Positive",val:positiveReplies,color:"#22c55e"},
                  {label:"Proposals",val:proposals.length,color:"#a78bfa"},
                  {label:"Won 💰",val:wonDeals.length,color:"#4ade80"},
                ].map((r,i) => (
                  <div key={i} style={s.fRow}>
                    <div style={s.fLabel}>{r.label}</div>
                    <div style={s.fBarWrap}><div style={{...s.fBar,width:`${totalLeads>0?(r.val/totalLeads)*100:0}%`,background:r.color}}/></div>
                    <div style={{...s.fVal,color:r.val>0?r.color:"#555"}}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>}

        {/* LEADS */}
        {page==="leads" && (
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardTitle}>All leads ({filteredLeads.length}/{leads.length})</div>
              <select style={s.select} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {["new","contacted","opened","replied","interested","closed","lost"].map(st=>(
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div style={{padding:"0 16px"}}>
              <input
                style={s.searchBar}
                placeholder="Search by name, company, email..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
              <div style={s.leadHead}><span>Lead</span><span>Industry</span><span>Score</span><span>Status</span><span>Update</span><span>Action</span></div>
              {filteredLeads.map((lead,i) => (
                <div key={lead.id} style={{...s.leadRow,...(i===filteredLeads.length-1?{borderBottom:"none"}:{})}}>
                  <div>
                    <div style={{fontWeight:500,fontSize:13}}>{lead.firstName} — {lead.company}</div>
                    <div style={{color:"#555",fontSize:11}}>{lead.email}</div>
                  </div>
                  <div style={{color:"#888",fontSize:12}}>{lead.industry}</div>
                  <div style={{fontWeight:500,color:lead.leadScore>=80?"#22c55e":lead.leadScore>=70?"#f59e0b":"#888"}}>{lead.leadScore}</div>
                  <span style={{...s.badge,background:SB[lead.status]||"#f3f4f6",color:SC[lead.status]||"#374151"}}>{lead.status}</span>
                  <select style={s.select} value={lead.status} onChange={e=>updateLeadStatus(lead.id,e.target.value)}>
                    {["new","contacted","opened","replied","interested","closed","lost"].map(st=>(
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <button style={{...s.btn,...s.btnBlue}} onClick={()=>setProposalModal(lead)}>💼 Propose</button>
                </div>
              ))}
              {filteredLeads.length===0 && <div style={{textAlign:"center",padding:24,color:"#555"}}>No leads match your search</div>}
            </div>
          </div>
        )}

        {/* FOLLOW-UPS */}
        {page==="followups" && <>
          <div style={{...s.kpiGrid,gridTemplateColumns:"repeat(3,1fr)"}}>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#ef4444"}}>{followupsDue}</div><div style={s.kpiLabel}>Due now</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#f59e0b"}}>{sentFollowups.length}</div><div style={s.kpiLabel}>Sent total</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#22c55e"}}>{pendingFollowups.length}</div><div style={s.kpiLabel}>Pending</div></div>
          </div>
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardTitle}>Pending follow-ups ({pendingFollowups.length})</div>
              <button style={{...s.btn,...s.btnGreen}} onClick={sendFollowups}>Send due now</button>
            </div>
            <div style={{...s.cardBody,padding:"0 16px"}}>
              {pendingFollowups.slice(0,20).map((f,i)=>(
                <div key={f.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<19?"1px solid #1f1f1f":"none",fontSize:12}}>
                  <div>
                    <span style={{fontWeight:500}}>{f.lead.firstName} — {f.lead.company}</span>
                    <span style={{color:"#555",marginLeft:8}}>{f.lead.email}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:"#1e3a5f",color:"#60a5fa"}}>Day {[3,7,12,18][f.sequenceNumber-1]||f.sequenceNumber}</span>
                    <span style={{fontSize:11,color: new Date(f.scheduledAt)<new Date()?"#ef4444":"#555"}}>
                      {new Date(f.scheduledAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                    </span>
                  </div>
                </div>
              ))}
              {pendingFollowups.length>20 && <div style={{fontSize:12,color:"#555",textAlign:"center",padding:"8px 0"}}>+{pendingFollowups.length-20} more</div>}
              {pendingFollowups.length===0 && <div style={{textAlign:"center",padding:24,color:"#555"}}>No pending follow-ups</div>}
            </div>
          </div>
        </>}

        {/* PROPOSALS */}
        {page==="proposals" && <>
          <div style={{...s.kpiGrid,gridTemplateColumns:"repeat(3,1fr)"}}>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#a78bfa"}}>{proposals.length}</div><div style={s.kpiLabel}>Total sent</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#22c55e"}}>{wonDeals.length}</div><div style={s.kpiLabel}>Won</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#22c55e"}}>${totalRevenue}</div><div style={s.kpiLabel}>Revenue</div></div>
          </div>
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardTitle}>All proposals</div>
              <span style={{fontSize:12,color:"#555"}}>Go to Leads → click 💼 Propose</span>
            </div>
            <div style={{...s.cardBody,padding:"0 16px"}}>
              {proposals.length===0 && (
                <div style={{textAlign:"center",padding:32,color:"#555"}}>
                  <div style={{fontSize:24,marginBottom:8}}>💼</div>
                  <div>No proposals yet</div>
                  <div style={{fontSize:12,marginTop:4}}>Go to Leads → click Propose on interested leads</div>
                </div>
              )}
              {proposals.map((p,i)=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<proposals.length-1?"1px solid #1f1f1f":"none",fontSize:13}}>
                  <div>
                    <div style={{fontWeight:500}}>{p.lead?.firstName} — {p.lead?.company}</div>
                    <div style={{fontSize:12,color:"#555"}}>{p.lead?.email} · {new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontWeight:600,color:"#22c55e"}}>${p.value}</span>
                    <span style={{...s.badge,background:p.status==="won"?"#14532d":"#1e3a5f",color:p.status==="won"?"#4ade80":"#60a5fa"}}>{p.status}</span>
                    {p.status==="open" && <button style={{...s.btn,...s.btnGreen}} onClick={()=>markWon(p.id,p.value)}>Mark Won 🎉</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* PIPELINE */}
        {page==="pipeline" && <>
          <div style={{background:"linear-gradient(135deg,#14532d,#166534)",borderRadius:10,padding:20,textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:13,color:"#86efac"}}>Total Revenue Won</div>
            <div style={{fontSize:42,fontWeight:700,color:"#fff",margin:"8px 0"}}>${totalRevenue.toLocaleString()}</div>
            <div style={{fontSize:13,color:"#86efac"}}>{wonDeals.length} deals closed · Pipeline: ${openDeals.reduce((s,d)=>s+d.value,0)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {["Contacted","Replied","Proposal","Won"].map((stage,si)=>{
              const stageLeads = si===0?leads.filter(l=>l.status==="contacted"):si===1?leads.filter(l=>["replied","interested"].includes(l.status)):si===2?openDeals:wonDeals;
              return (
                <div key={stage} style={s.pipeCol}>
                  <div style={s.pipeTitle}>{stage} <span style={{color:"#333"}}>({stageLeads.length})</span></div>
                  {stageLeads.slice(0,4).map(item=>(
                    <div key={item.id} style={s.dealCard}>
                      <div style={{fontWeight:500}}>{item.firstName||item.lead?.firstName}</div>
                      <div style={{color:"#555",fontSize:11}}>{item.company||item.lead?.company}</div>
                      {item.value && <div style={{color:"#22c55e",fontWeight:600,fontSize:12,marginTop:4}}>${item.value}</div>}
                    </div>
                  ))}
                  {stageLeads.length>4 && <div style={{fontSize:11,color:"#555",textAlign:"center",padding:"4px 0"}}>+{stageLeads.length-4} more</div>}
                </div>
              );
            })}
          </div>
        </>}

        {/* ANALYTICS */}
        {page==="analytics" && <>
          <div style={s.kpiGrid}>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#888"}}>0%</div><div style={s.kpiLabel}>Open rate (target 20%)</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#888"}}>0%</div><div style={s.kpiLabel}>Reply rate (target 5%)</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:proposals.length>0?"#22c55e":"#888"}}>{proposals.length>0?Math.round((wonDeals.length/proposals.length)*100):0}%</div><div style={s.kpiLabel}>Close rate (target 25%)</div></div>
            <div style={s.kpi}><div style={{...s.kpiVal,color:"#22c55e"}}>₹99</div><div style={s.kpiLabel}>Total AI cost</div></div>
          </div>
          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardHead}><div style={s.cardTitle}>Top industries</div></div>
              <div style={s.cardBody}>
                {byIndustry.map((b,i)=>(
                  <div key={i} style={s.fRow}>
                    <div style={s.fLabel}>{b.industry}</div>
                    <div style={s.fBarWrap}><div style={{...s.fBar,width:`${(b._count/totalLeads)*100}%`,background:"#60a5fa"}}/></div>
                    <div style={{...s.fVal,color:"#60a5fa"}}>{b._count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardHead}><div style={s.cardTitle}>Next actions</div></div>
              <div style={s.cardBody}>
                {[
                  {label:"Check Gmail for replies", urgency:"Daily", color:"#22c55e"},
                  {label:"Send follow-ups if due", urgency:"Daily", color:"#f59e0b"},
                  {label:"Send proposals to interested leads", urgency:"When ready", color:"#a78bfa"},
                  {label:"Get 25 more leads (Apollo)", urgency:"This week", color:"#60a5fa"},
                  {label:"Buy pro-sites.in domain", urgency:"Sep 15", color:"#ef4444"},
                ].map((item,i,arr)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<arr.length-1?"1px solid #1f1f1f":"none",fontSize:13}}>
                    <span>{item.label}</span>
                    <span style={{fontSize:11,color:item.color,fontWeight:500}}>{item.urgency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}
