import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import notify from "../../../shared/utils/toast";
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
      notify.error("Please enter a valid phone number to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/otp/send", { phone });
      if (response.data.status === "success") {
        setOtpSent(true);
        notify.success(
          "Verification code sent!",
          `Check your phone for the code.`,
        );
      }
    } catch (error: any) {
      console.error(error);
      notify.error(
        "We couldn't send the code. Please check your number and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otpCode) {
      notify.warning("Please enter the 6-digit code we sent you.");
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

        notify.authSuccess(
          "Welcome to Bites!",
          `You're signed in as ${user.first_name}.`,
        );
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      notify.error(
        "That code didn't work. Please try again or request a new one.",
      );
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
