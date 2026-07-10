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
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">OTP Login</h2>
        <p className="auth-subtitle">
          {!otpSent
            ? "Enter your mobile number to sign in or register"
            : "Enter the 6-digit code sent to your phone"}
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="auth-form-field">
              <label className="auth-label">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                required
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium auth-button"
            >
              {loading ? "Sending..." : "Request Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="auth-form-field">
              <label className="auth-label">OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                className="auth-input auth-input--otp"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium auth-button"
            >
              {loading ? "Verifying..." : "Verify & Log In"}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="auth-link-button"
            >
              Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
