import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import notify from "../../../shared/utils/toast";
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
        if (user.role !== "delivery_partner" && user.role !== "admin") {
          notify.error(
            "Access Denied: You must be a delivery partner to sign in here.",
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

        notify.authSuccess(
          "Ready to hit the road?",
          "Signing into your driver account.",
        );
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
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Delivery Sign In</h2>
        <p className="auth-subtitle">
          Access your logistics shift and wallet earnings
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@delivery.com"
              required
              className="auth-input-style"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="auth-input-style"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn-style">
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer-prompt">
          Don't have an account?{" "}
          <Link to="/register" className="auth-footer-link">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};
