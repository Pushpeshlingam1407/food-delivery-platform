import React from "react";
import { Toaster as SonnerToaster, toast as sonner } from "sonner";
import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, TriangleAlert, Info } from "lucide-react";

const commonStyle = {
  borderRadius: "100px",
  padding: "12px 24px",
  fontSize: "0.95rem",
  fontWeight: 600,
  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  margin: "12px",
};

/**
 * Global Toast Provider wrapping both Sonner (for instant UI feedback)
 * and React Hot Toast (for complex async promises).
 * Placed top-center to mimic CRED/Blinkit capsule aesthetics.
 */
export const ToastProvider = () => {
  return (
    <>
      <SonnerToaster
        position="top-center"
        toastOptions={{
          style: {
            ...commonStyle,
            background: "rgba(20, 20, 20, 0.95)",
            color: "#fff",
          },
          success: {
            style: {
              ...commonStyle,
              background: "rgba(22, 163, 74, 0.95)", // Rich Green
              color: "#fff",
            },
            icon: <CheckCircle2 size={20} color="#fff" />,
          },
          error: {
            style: {
              ...commonStyle,
              background: "rgba(220, 38, 38, 0.95)", // Rich Red
              color: "#fff",
            },
            icon: <AlertCircle size={20} color="#fff" />,
          },
          warning: {
            style: {
              ...commonStyle,
              background: "rgba(245, 158, 11, 0.95)", // Warm Amber
              color: "#fff",
            },
            icon: <TriangleAlert size={20} color="#fff" />,
          },
          info: {
            style: {
              ...commonStyle,
              background: "rgba(59, 130, 246, 0.95)", // Deep Blue
              color: "#fff",
            },
            icon: <Info size={20} color="#fff" />,
          },
        }}
      />
      <HotToaster
        position="top-center"
        toastOptions={{
          style: {
            ...commonStyle,
            background: "rgba(20, 20, 20, 0.95)",
            color: "#fff",
          },
          success: {
            style: {
              ...commonStyle,
              background: "rgba(22, 163, 74, 0.95)",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "rgba(22, 163, 74, 0.95)",
            },
          },
          error: {
            style: {
              ...commonStyle,
              background: "rgba(220, 38, 38, 0.95)",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "rgba(220, 38, 38, 0.95)",
            },
          },
        }}
      />
    </>
  );
};

/**
 * Sentiment-aware, centralized notification API.
 */
export const notify = {
  success: (message: string, description?: string) => {
    sonner.success(message, { description, duration: 3000 });
  },
  error: (message: string, description?: string) => {
    sonner.error(message, { description, duration: 5000 });
  },
  warning: (message: string, description?: string) => {
    sonner.warning(message, { description, duration: 4000 });
  },
  info: (message: string, description?: string) => {
    sonner.info(message, { description, duration: 3000 });
  },
  authSuccess: (title: string, subtitle?: string) => {
    sonner.custom(
      (t) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px 24px",
            borderRadius: "100px",
            background:
              "linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(40,40,40,0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(30px)",
            color: "#fff",
            width: "max-content",
            maxWidth: "90vw",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
            animation: "toast-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #22c55e, transparent)",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <CheckCircle2 size={22} color="#4ade80" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: "#fff",
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
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
