import React from "react";

interface PremiumPageHeaderProps {
  title: string;
  subtitle: string;
  rightAction?: React.ReactNode;
}

export const PremiumPageHeader: React.FC<PremiumPageHeaderProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
        marginBottom: "40px",
        paddingBottom: "24px",
        borderBottom: "1px solid var(--cred-border)",
      }}
      className="premium-animate-in"
    >
      <div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "var(--cred-text-primary)",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--cred-text-secondary)", fontSize: "1.05rem" }}>
          {subtitle}
        </p>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
};
