import React from "react";
import "./CredStatCard.css";

interface CredStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  theme?: "success" | "warning" | "danger" | "info" | "default";
}

export const CredStatCard: React.FC<CredStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  theme = "default",
}) => {
  return (
    <div className={`cred-stat-card theme-${theme}`}>
      <div>
        <div className="cred-stat-title">
          {icon && (
            <span className="cred-stat-card-icon-container">{icon}</span>
          )}
          {title}
        </div>
        <div className="cred-stat-value">{value}</div>
      </div>
      {subtitle && <div className="cred-stat-subtitle">{subtitle}</div>}

      {/* Background Watermark Icon */}
      {icon && (
        <div className="bg-icon cred-stat-card-bg-icon">
          {React.cloneElement(icon as React.ReactElement<any>, {
            size: 150,
            strokeWidth: 1.5,
          })}
        </div>
      )}
    </div>
  );
};
