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
      className={`card-premium ${hoverLift ? "card-premium--hover-lift" : ""}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};
