import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../shared/services/api";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.status === "success") {
        const { accessToken, refreshToken, user } = response.data.data;

        // Strict role validation
        if (user.role !== "admin") {
          toast.error(
            "Access Denied: Only system administrators can sign in here.",
          );
          setLoading(false);
          return;
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userId", user.id);
        localStorage.setItem(
          "userName",
          `${user.first_name} ${user.last_name}`,
        );

        toast.success(`Welcome back, Administrator ${user.first_name}!`);
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        "Invalid credentials. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "40px",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              fontFamily: "var(--font-cohere)",
              fontSize: "2.5rem",
              fontWeight: 900,
              background: "var(--primary-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}
          >
            bites.
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            System Admin Portal
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--text-slate)",
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fooddelivery.com"
              required
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--glass-border)",
                fontSize: "0.95rem",
                outline: "none",
                background: "rgba(255, 255, 255, 0.8)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--text-slate)",
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--glass-border)",
                fontSize: "0.95rem",
                outline: "none",
                background: "rgba(255, 255, 255, 0.8)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium"
            style={{ width: "100%", padding: "14px", marginTop: "10px" }}
          >
            {loading ? "Verifying..." : "Access Console"}
          </button>
        </form>
      </div>
    </div>
  );
};
