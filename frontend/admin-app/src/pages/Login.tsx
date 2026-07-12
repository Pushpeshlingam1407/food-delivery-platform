import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import notify from "../../../shared/utils/toast";
import { PremiumCard } from "../../../shared/components/PremiumCard";
import api from "../../../shared/services/api";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      notify.warning("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.status === "success") {
        const { accessToken, refreshToken, user } = response.data.data;

        // Strict role validation
        if (user.role !== "admin") {
          notify.error("Access Denied: This area is for administrators only.");
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

        notify.authSuccess("Welcome back, Admin!", "Accessing the console...");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      }
    } catch (error: any) {
      console.error(error);
      notify.error("Login failed. Please check your credentials.");
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
      <PremiumCard
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
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
            bites
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
              className="input-premium"
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
              className="input-premium"
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
      </PremiumCard>
    </div>
  );
};
