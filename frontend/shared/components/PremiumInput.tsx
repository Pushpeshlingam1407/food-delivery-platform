import React from "react";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  success,
  className = "",
  style,
  ...props
}) => {
  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input-premium ${error ? "input-premium--error" : success ? "input-premium--success" : ""} ${className}`}
        style={style}
        {...props}
      />
      {error && (
        <span className="input-error">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};
