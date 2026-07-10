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
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: hoverLift ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hoverLift) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 8px 30px rgba(21, 21, 21, 0.05)";
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
