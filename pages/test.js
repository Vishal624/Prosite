import { useState } from "react";

export default function Test() {
  const [result, setResult] = useState("Ready to test...");
  const [loading, setLoading] = useState(false);

  async function sendTest() {
    setLoading(true);
    setResult("Sending...");

    try {
      const response = await fetch("/api/slack", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        setResult("✅ Message sent! Check #sales-bot in Slack!");
      } else {
        setResult("❌ Error: " + (data.error || "Unknown"));
      }
    } catch (error) {
      setResult("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "Arial", textAlign: "center", padding: "50px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "10px", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ color: "#22c55e" }}>🧪 ProSites Agent Test</h1>
        <p>Click the button to send a test message to Slack</p>
        <button
          onClick={sendTest}
          disabled={loading}
          style={{ padding: "15px 30px", fontSize: "16px", background: loading ? "#aaa" : "#22c55e", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "20px" }}
        >
          {loading ? "Sending..." : "Send Test Message to Slack"}
        </button>
        <div style={{ marginTop: "20px", padding: "20px", background: "#f0f0f0", borderRadius: "5px" }}>
          {result}
        </div>
      </div>
    </div>
  );
}
