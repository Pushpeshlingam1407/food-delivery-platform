import React from "react";
import { Toaster as SonnerToaster, toast as sonner } from "sonner";
import { Toaster as HotToaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, TriangleAlert, Info } from "lucide-react";
import "./toast.css";

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
          className: "toast-base-cred toast-cred",
        }}
      />
      <HotToaster
        position="top-center"
        toastOptions={{
          className: "toast-base-cred toast-cred",
          success: {
            className: "toast-base-cred toast-cred-success",
            iconTheme: {
              primary: "#4ade80",
              secondary: "rgba(15,15,15,1)",
            },
          },
          error: {
            className: "toast-base-cred toast-cred-error",
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
  success: (message: string, options?: { description?: string }) => {
    sonner.success(message, {
      ...options,
      className: "toast-base-cred toast-cred-success",
      duration: 4000,
    });
  },
  error: (message: string, options?: { description?: string }) => {
    sonner.error(message, {
      ...options,
      className: "toast-base-cred toast-cred-error",
      duration: 6000,
    });
  },
  warning: (message: string, options?: { description?: string }) => {
    sonner.warning(message, {
      ...options,
      className: "toast-base-cred toast-cred-warning",
      duration: 5000,
    });
  },
  info: (message: string, options?: { description?: string }) => {
    sonner.info(message, {
      ...options,
      className: "toast-base-cred toast-cred-info",
      duration: 4000,
    });
  },
  authSuccess: (title: string, subtitle?: string) => {
    sonner.custom(
      (t) => (
        <div className="toast-base-cred toast-cred toast-custom-success-bg toast-custom-wrapper">
          <div className="toast-custom-icon-wrapper">
            <CheckCircle2 size={24} color="#fff" />
          </div>
          <div className="toast-custom-text-wrapper">
            <span className="toast-custom-title">{title}</span>
            {subtitle && <span className="toast-custom-subtitle">{subtitle}</span>}
          </div>
        </div>
      ),
      { duration: 4000 },
    );
  },
  authLogout: (title: string, subtitle?: string) => {
    sonner.custom(
      (t) => (
        <div className="toast-base-cred toast-cred toast-custom-logout-bg toast-custom-wrapper">
          <div className="toast-custom-icon-wrapper">
            <Info size={24} color="#fff" />
          </div>
          <div className="toast-custom-text-wrapper">
            <span className="toast-custom-title">{title}</span>
            {subtitle && <span className="toast-custom-subtitle">{subtitle}</span>}
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
