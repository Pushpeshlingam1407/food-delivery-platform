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
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input-premium ${error ? "input-premium--error" : ""}`}
        style={style}
        {...props}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};
