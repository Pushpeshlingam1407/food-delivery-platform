import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
        if (user.role !== "restaurant_owner" && user.role !== "admin") {
          notify.error(
            "Access Denied: You must be a restaurant owner to sign in here.",
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

        notify.authSuccess("Welcome back, Chef!", "Opening your dashboard.");
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
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <PremiumCard
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "48px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-anthropic)",
            fontSize: "2rem",
            color: "var(--text-slate)",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          Merchant Sign In
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            marginBottom: "32px",
          }}
        >
          Access your restaurant dashboard and orders
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-slate)",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              required
              className="input-premium"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-slate)",
              }}
            >
              Password
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
            style={{
              padding: "14px",
              fontSize: "1rem",
              marginTop: "12px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--accent-orange)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create one
          </Link>
        </div>
      </PremiumCard>
    </div>
  );
};
