import React from "react";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  hoverLift = false,
  style,
  ...props
}) => {
  return (
    <div
      className="card-premium"
      style={{
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: hoverLift ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverLift) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow =
            "0 12px 40px 0 rgba(25, 25, 25, 0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (hoverLift) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "var(--glass-shadow)";
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};
