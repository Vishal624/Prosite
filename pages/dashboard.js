import { useState, useEffect } from "react";

const leads = [
  { id: 1, first_name: "Eli", email: "eli@liveonlucida.com", company: "Lucida Surfaces", industry: "Building Materials" },
  { id: 2, first_name: "Conrad", email: "conrad@publicize.co", company: "Publicize", industry: "PR" },
  { id: 3, first_name: "Andrew", email: "andrew@acquire.com", company: "acquire.com", industry: "Tech" },
  { id: 4, first_name: "Tom", email: "tombilyeu@impacttheory.com", company: "Impact Theory", industry: "Media" },
  { id: 5, first_name: "Tito", email: "tito@altisales.com", company: "AltiSales", industry: "Consulting" },
  { id: 6, first_name: "Giovanna", email: "giovanna@hohmp.com", company: "Heart of Hollywood", industry: "Entertainment" },
  { id: 7, first_name: "Shawn", email: "sdoyle@releaseteam.com", company: "ReleaseTEAM", industry: "IT Services" },
  { id: 8, first_name: "David", email: "david@davidbagga.com", company: "David Bagga Co", industry: "Recruiting" },
  { id: 9, first_name: "Ruben", email: "ruben@outrival.com", company: "OutRival", industry: "SaaS" },
  { id: 10, first_name: "Dave", email: "dperry@blinkai.com", company: "BLiNKAI Automotive", industry: "Auto AI" },
  { id: 11, first_name: "Jamie", email: "jamie@thepeopleavenue.com", company: "People Avenue", industry: "Staffing" },
  { id: 12, first_name: "Jake", email: "jake@groundswell.io", company: "Groundswell", industry: "Fintech" },
  { id: 13, first_name: "Kevin", email: "kevin@hubble.social", company: "Hubble", industry: "Community" },
  { id: 14, first_name: "Andrew", email: "andrew.price@poliigon.com", company: "Poliigon", industry: "3D Media" },
  { id: 15, first_name: "Will", email: "william@uplead.com", company: "UpLead", industry: "Lead Gen" },
  { id: 16, first_name: "Kevin", email: "kbrody@kloverdata.com", company: "Klover Data", industry: "Marketing" },
  { id: 17, first_name: "Jay", email: "jay@casperstudios.xyz", company: "Casper Studios", industry: "Tech" },
  { id: 18, first_name: "Paul", email: "pbarham@harrellhospitality.com", company: "Harrell Hospitality", industry: "Hotels" },
  { id: 19, first_name: "Debbie", email: "debbie@jhammerglobal.com", company: "Jack Hammer", industry: "Executive Search" },
  { id: 20, first_name: "Matt", email: "matt@wedgehr.com", company: "WedgeHR", industry: "HR Tech" },
  { id: 21, first_name: "Steven", email: "swp@alpha.ac", company: "Alpha", industry: "AI Consulting" },
  { id: 22, first_name: "Jason", email: "jason@phillipscollection.com", company: "Phillips Collection", industry: "Furniture" },
  { id: 23, first_name: "Jennifer", email: "jen@risingteam.com", company: "Rising Team", industry: "SaaS" },
  { id: 24, first_name: "Joshua", email: "jbroder@vertawireless.com", company: "Verta", industry: "Telecom" },
];

const STATUS_COLORS = {
  sent: { bg: "#dbeafe", text: "#1e40af", label: "📧 Sent" },
  opened: { bg: "#fef9c3", text: "#854d0e", label: "👀 Opened" },
  clicked: { bg: "#fde8d8", text: "#9a3412", label: "🔥 Clicked" },
  replied: { bg: "#dcfce7", text: "#166534", label: "💬 Replied" },
  closed: { bg: "#d1fae5", text: "#065f46", label: "💰 Closed!" },
  lost: { bg: "#fee2e2", text: "#991b1b", label: "❌ Lost" },
};

export default function Dashboard() {
  const [leadData, setLeadData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("prosites_leads");
      if (saved) return JSON.parse(saved);
    }
    return leads.map((l) => ({ ...l, status: "sent", notes: "", revenue: 0 }));
  });

  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [showAddRevenue, setShowAddRevenue] = useState(null);
  const [revenueInput, setRevenueInput] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("prosites_leads", JSON.stringify(leadData));
    }
  }, [leadData]);

  const updateStatus = (id, status) => {
    setLeadData((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  const updateNotes = (id, notes) => {
    setLeadData((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes } : l))
    );
  };

  const addRevenue = (id) => {
    const amount = parseInt(revenueInput);
    if (!isNaN(amount)) {
      setLeadData((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, revenue: amount, status: "closed" } : l
        )
      );
    }
    setShowAddRevenue(null);
    setRevenueInput("");
  };

  const stats = {
    total: leadData.length,
    sent: leadData.filter((l) => l.status === "sent").length,
    opened: leadData.filter((l) => l.status === "opened").length,
    clicked: leadData.filter((l) => l.status === "clicked").length,
    replied: leadData.filter((l) => l.status === "replied").length,
    closed: leadData.filter((l) => l.status === "closed").length,
    revenue: leadData.reduce((sum, l) => sum + (l.revenue || 0), 0),
  };

  const filtered =
    filter === "all" ? leadData : leadData.filter((l) => l.status === filter);

  return (
    <div style={{ fontFamily: "Arial", background: "#f9fafb", minHeight: "100vh", padding: "20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "#22c55e", margin: 0, fontSize: "28px" }}>🤖 ProSites Dashboard</h1>
        <p style={{ color: "#6b7280", margin: "4px 0 0" }}>Track your 24 US CEO leads</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Leads", value: stats.total, color: "#6366f1", icon: "📊" },
          { label: "Opened", value: stats.opened, color: "#f59e0b", icon: "👀" },
          { label: "Replied", value: stats.replied, color: "#3b82f6", icon: "💬" },
          { label: "Closed", value: stats.closed, color: "#22c55e", icon: "💰" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "24px" }}>{s.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "12px", padding: "20px", marginBottom: "24px", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: "14px", opacity: 0.9 }}>💵 Total Revenue Earned</div>
        <div style={{ fontSize: "40px", fontWeight: "bold", margin: "8px 0" }}>${stats.revenue.toLocaleString()}</div>
        <div style={{ fontSize: "13px", opacity: 0.8 }}>
          {stats.closed} closes × avg ${stats.closed > 0 ? Math.round(stats.revenue / stats.closed) : 0}
        </div>
      </div>

      {/* Funnel */}
      <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <h3 style={{ margin: "0 0 12px", color: "#374151" }}>📈 Conversion Funnel</h3>
        {[
          { label: "Emails Sent", value: stats.total, color: "#6366f1" },
          { label: "Opened", value: stats.opened, color: "#f59e0b" },
          { label: "Clicked", value: stats.clicked, color: "#f97316" },
          { label: "Replied", value: stats.replied, color: "#3b82f6" },
          { label: "Closed 💰", value: stats.closed, color: "#22c55e" },
        ].map((item) => (
          <div key={item.label} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", color: "#374151" }}>{item.label}</span>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: item.color }}>{item.value}</span>
            </div>
            <div style={{ background: "#f3f4f6", borderRadius: "4px", height: "8px" }}>
              <div style={{ background: item.color, width: `${(item.value / stats.total) * 100}%`, height: "8px", borderRadius: "4px", transition: "width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["all", "sent", "opened", "clicked", "replied", "closed", "lost"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              background: filter === f ? "#22c55e" : "#e5e7eb",
              color: filter === f ? "white" : "#374151",
              fontWeight: filter === f ? "bold" : "normal",
            }}
          >
            {f === "all" ? `All (${stats.total})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((lead) => {
          const statusInfo = STATUS_COLORS[lead.status] || STATUS_COLORS.sent;
          return (
            <div key={lead.id} style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${statusInfo.text}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#111827", fontSize: "15px" }}>
                    {lead.first_name} — {lead.company}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "13px" }}>{lead.email}</div>
                  <div style={{ color: "#9ca3af", fontSize: "12px" }}>{lead.industry}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ background: statusInfo.bg, color: statusInfo.text, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                    {statusInfo.label}
                  </span>
                  {lead.revenue > 0 && (
                    <span style={{ color: "#22c55e", fontWeight: "bold", fontSize: "14px" }}>+${lead.revenue}</span>
                  )}
                </div>
              </div>

              {/* Status Buttons */}
              <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
                {["sent", "opened", "clicked", "replied", "closed", "lost"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(lead.id, s)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      fontSize: "11px",
                      background: lead.status === s ? "#22c55e" : "white",
                      color: lead.status === s ? "white" : "#374151",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Revenue Input */}
              {showAddRevenue === lead.id ? (
                <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                  <input
                    type="number"
                    placeholder="Enter amount in $"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", flex: 1, fontSize: "13px" }}
                  />
                  <button
                    onClick={() => addRevenue(lead.id)}
                    style={{ padding: "6px 14px", background: "#22c55e", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddRevenue(null)}
                    style={{ padding: "6px 14px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddRevenue(lead.id)}
                  style={{ marginTop: "8px", padding: "4px 12px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                >
                  💰 Mark as Closed + Add Revenue
                </button>
              )}

              {/* Notes */}
              <input
                placeholder="Add notes (reply, interest level, follow-up date...)"
                value={lead.notes}
                onChange={(e) => updateNotes(lead.id, e.target.value)}
                style={{ marginTop: "8px", width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", boxSizing: "border-box", color: "#374151" }}
              />
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "24px", color: "#9ca3af", fontSize: "12px" }}>
        ProSites Dashboard • Data saved locally • Updates in real-time
      </div>
    </div>
  );
}
