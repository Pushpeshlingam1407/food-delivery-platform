import React from "react";
import { Toaster as SonnerToaster, toast as sonner } from "sonner";
import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, TriangleAlert, Info } from "lucide-react";

const baseCredStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  borderRadius: "100px",
  padding: "14px 20px",
  fontSize: "0.92rem",
  fontWeight: 600,
  letterSpacing: "0.015em",
  fontFamily: "var(--font-apple, inherit)",
  color: "#fff",
  backdropFilter: "blur(24px)",
  width: "max-content",
  maxWidth: "92vw",
  margin: "0 auto",
  gap: "12px",
};

const credStyle = {
  ...baseCredStyle,
  background: "linear-gradient(135deg, rgba(15,15,15,0.95), rgba(30,30,30,0.98))",
  boxShadow: "0 20px 40px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const credSuccessStyle = {
  ...baseCredStyle,
  background: "linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(2, 44, 34, 0.98))",
  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15), inset 0 1px 1px rgba(16, 185, 129, 0.4)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
};

const credErrorStyle = {
  ...baseCredStyle,
  background: "linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(69, 10, 10, 0.98))",
  boxShadow: "0 20px 40px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(239, 68, 68, 0.4)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
};

const credWarningStyle = {
  ...baseCredStyle,
  background: "linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(69, 26, 3, 0.98))",
  boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15), inset 0 1px 1px rgba(245, 158, 11, 0.4)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
};

const credInfoStyle = {
  ...baseCredStyle,
  background: "linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(17, 24, 39, 0.98))",
  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15), inset 0 1px 1px rgba(59, 130, 246, 0.4)",
  border: "1px solid rgba(59, 130, 246, 0.3)",
};

/**
 * Global Toast Provider wrapping both Sonner (for UI feedback)
 * and React Hot Toast (for complex async promises).
 * Uses CRED-inspired neo-premium capsule aesthetics.
 */
export const ToastProvider = () => {
  return (
    <>
      <SonnerToaster
        position="top-center"
        toastOptions={{
          style: credStyle,
          success: {
            style: credSuccessStyle,
            icon: <CheckCircle2 size={18} color="#4ade80" />,
          },
          error: {
            style: credErrorStyle,
            icon: <AlertCircle size={18} color="#f87171" />,
          },
          warning: {
            style: credWarningStyle,
            icon: <TriangleAlert size={18} color="#fbbf24" />,
          },
          info: {
            style: credInfoStyle,
            icon: <Info size={18} color="#60a5fa" />,
          },
        }}
      />
      <HotToaster
        position="top-center"
        toastOptions={{
          style: credStyle,
          success: {
            style: credSuccessStyle,
            iconTheme: {
              primary: "#4ade80",
              secondary: "rgba(15,15,15,1)",
            },
          },
          error: {
            style: credErrorStyle,
            iconTheme: {
              primary: "#f87171",
              secondary: "rgba(15,15,15,1)",
            },
          },
        }}
      />
    </>
  );
};

/**
 * Sentiment-aware, centralized notification API.
 * Translates intent into appropriate visuals and libraries.
 */
export const notify = {
  success: (message: string, description?: string) => {
    sonner.success(message, { description, duration: 4000 });
  },
  error: (message: string, description?: string) => {
    sonner.error(message, { description, duration: 6000 });
  },
  warning: (message: string, description?: string) => {
    sonner.warning(message, { description, duration: 5000 });
  },
  info: (message: string, description?: string) => {
    sonner.info(message, { description, duration: 4000 });
  },
  authSuccess: (title: string, subtitle?: string) => {
    sonner.custom(
      (t) => (
        <div
          style={{
            ...credStyle,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            boxShadow:
              "0 20px 40px rgba(16, 185, 129, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
            border: "none",
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            <CheckCircle2 size={24} color="#fff" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>
      ),
      { duration: 4000 },
    );
  },
  authLogout: (title: string, subtitle?: string) => {
    sonner.custom(
      (t) => (
        <div
          style={{
            ...credStyle,
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            boxShadow:
              "0 20px 40px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
            border: "none",
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            <Info size={24} color="#fff" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>
      ),
      { duration: 4000 },
    );
  },
  loading: (message: string) => {
    return hotToast.loading(message);
  },
  dismiss: (id?: string) => {
    if (id) {
      hotToast.dismiss(id);
      sonner.dismiss(id);
    } else {
      hotToast.dismiss();
      sonner.dismiss();
    }
  },
  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string },
  ) => {
    return hotToast.promise(promise, msgs);
  },
};
export default notify;
