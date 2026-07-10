import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../utils/toast";
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
    <div className="auth-container">
      <PremiumCard className="auth-card">
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">
          Enter your details below to access your account
        </p>

        <form onSubmit={handleLogin} className="auth-form">
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
            className="auth-button"
          >
            Sign In
          </PremiumButton>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </div>
      </PremiumCard>
    </div>
  );
};
