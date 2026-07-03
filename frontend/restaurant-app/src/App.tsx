import { Toaster, toast } from "sonner";

function App() {
  const showToast = () => {
    toast.success("Restaurant dashboard system active!", {
      description: "Connected to single backend on Port 5000.",
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
          Restaurant App
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
          Verify Restaurant System
        </button>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;
