import React from "react";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "danger" | "secondary";
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  loading = false,
  loadingText = "Processing...",
  variant = "primary",
  style,
  disabled,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (variant === "danger") return "#F44336";
    if (variant === "secondary") return "rgba(25, 25, 25, 0.04)";
    return "var(--primary-gradient)";
  };

  const getTextColor = () => {
    if (variant === "secondary") return "var(--text-slate)";
    return "var(--text-sand)";
  };

  const getBorder = () => {
    if (variant === "secondary") return "1px solid var(--glass-border)";
    return "none";
  };

  return (
    <button
      className="btn-premium"
      disabled={disabled || loading}
      style={{
        background: getBackgroundColor(),
        color: getTextColor(),
        border: getBorder(),
        boxShadow:
          variant === "secondary"
            ? "none"
            : "0 4px 15px rgba(255, 90, 31, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: disabled || loading ? 0.7 : 1,
        pointerEvents: disabled || loading ? "none" : "auto",
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-loader"
            style={{
              width: "16px",
              height: "16px",
              border: `2px solid ${variant === "secondary" ? "var(--text-slate)" : "#FFF"}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "shimmerSpin 0.8s linear infinite",
            }}
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};
