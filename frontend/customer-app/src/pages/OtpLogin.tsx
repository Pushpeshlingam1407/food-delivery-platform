import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../shared/services/api";

export const OtpLogin: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/otp/send", { phone });
      if (response.data.status === "success") {
        setOtpSent(true);
        toast.success("OTP Sent!", {
          description: `Simulated Code: ${response.data.code || "Check console/backend logs."}`,
          duration: 8000,
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to send OTP. Please check parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otpCode) {
      toast.error("Please input the received 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/otp/verify", {
        phone,
        code: otpCode,
      });
      if (response.data.status === "success") {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", user.role || "customer");
        localStorage.setItem("userName", `${user.first_name} ${user.last_name || ""}`);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("realEmail", user.email);
        localStorage.setItem(
          "userEmail",
          `${user.first_name} ${user.last_name || ""}`,
        );

        toast.success("OTP Verified successfully!", {
          description: `Logged in as ${user.first_name}.`,
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Invalid or expired OTP code.");
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
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "48px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
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
          OTP Login
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
            marginBottom: "32px",
          }}
        >
          {!otpSent
            ? "Enter your mobile number to sign in or register"
            : "Enter the 6-digit code sent to your phone"}
        </p>

        {!otpSent ? (
          <form
            onSubmit={handleSendOTP}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-slate)",
                }}
              >
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-standard)",
                  border: "1px solid var(--glass-border)",
                  fontFamily: "var(--font-apple)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium"
              style={{
                padding: "14px",
                fontSize: "1rem",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Sending..." : "Request Verification Code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyOTP}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-slate)",
                }}
              >
                OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-standard)",
                  border: "1px solid var(--glass-border)",
                  fontFamily: "var(--font-apple)",
                  fontSize: "1.2rem",
                  letterSpacing: "8px",
                  textAlign: "center",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium"
              style={{
                padding: "14px",
                fontSize: "1rem",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
