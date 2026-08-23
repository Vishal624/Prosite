export default function Test() {
  async function sendTest() {
    const result = document.getElementById('result');
    result.innerHTML = 'Sending...';

    try {
      const response = await fetch('/api/slack', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        result.innerHTML = '✅ Message sent! Check #sales-bot in Slack!';
      } else {
        result.innerHTML = '❌ Failed to send';
      }
    } catch (error) {
      result.innerHTML = '❌ Error: ' + error.message;
    }
  }

  return (
    <div style={{ fontFamily: 'Arial', textAlign: 'center', padding: '50px' }}>
      <h1 style={{ color: '#22c55e' }}>🧪 ProSites Agent Test</h1>
      <button
        onClick={sendTest}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          background: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Send Test Message to Slack
      </button>
      <div
        id="result"
        style={{
          marginTop: '20px',
          padding: '20px',
          background: '#f0f0f0',
          borderRadius: '5px',
        }}
      >
        Ready to test...
      </div>
    </div>
  );
}
