import { Toaster, toast } from "sonner";

function App() {
  const showToast = () => {
    toast.success("Delivery shift logistics system active!", {
      description: "Emitting Socket.IO coordinate updates.",
    });
  };

  return (
    <div style={{ padding: "60px 20px", maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "40px",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
        }}
      >
        <h1
          style={{
            marginBottom: "16px",
            color: "var(--text-slate)",
            fontSize: "2.5rem",
          }}
        >
          Delivery App
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "32px",
            fontSize: "1.1rem",
            lineHeight: "1.6",
          }}
        >
          Designed with the warm sand tones of Claude, Apple frosted glass
          cards, and Samsung accent highlights. Only Cohere, Anthropic, and
          Apple typography families are active.
        </p>
        <button className="btn-premium" onClick={showToast}>
          Verify Delivery System
        </button>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
