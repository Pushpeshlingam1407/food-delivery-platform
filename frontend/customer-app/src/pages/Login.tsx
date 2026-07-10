import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../shared/services/api";
import { PremiumCard } from "../../../shared/components/PremiumCard";
import { PremiumInput } from "../../../shared/components/PremiumInput";
import { PremiumButton } from "../../../shared/components/PremiumButton";

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
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", user.role || "customer");
        localStorage.setItem(
          "userName",
          `${user.first_name} ${user.last_name || ""}`,
        );
        localStorage.setItem("userId", user.id);
        localStorage.setItem("realEmail", user.email);
        localStorage.setItem(
          "userEmail",
          `${user.first_name} ${user.last_name || ""}`,
        );

        window.location.href = "/";
      }
    } catch (err: any) {
      console.error(err);
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
        minHeight: "calc(100vh - 80px)",
        padding: "20px",
      }}
    >
      <PremiumCard
        style={{ width: "100%", maxWidth: "440px", padding: "48px" }}
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
          Sign In
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            marginBottom: "32px",
          }}
        >
          Enter your details below to access your account
        </p>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <PremiumInput
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            required
          />

          <PremiumInput
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <PremiumButton
            type="submit"
            loading={loading}
            loadingText="Authenticating..."
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "12px",
              fontSize: "1rem",
            }}
          >
            Sign In
          </PremiumButton>
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
