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
  className = "",
  style,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn-premium btn-premium--${variant} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <span
            className={`spinner-loader spinner-loader--${variant === "secondary" ? "dark" : "light"}`}
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};
