import React from "react";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        width: "100%",
      }}
    >
      {label && (
        <label
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--text-slate)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <input
        className="input-premium"
        style={{
          borderColor: error ? "#F44336" : "var(--glass-border)",
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          style={{ fontSize: "0.75rem", color: "#F44336", marginTop: "2px" }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
