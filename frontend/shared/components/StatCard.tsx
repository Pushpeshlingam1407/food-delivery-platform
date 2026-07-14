import React from "react";
import "./StatCard.css";

export interface StatCardProps {
  theme: "admin" | "restaurant";
  title: string;
  value: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ReactNode;

  // Admin specific props
  adminIconBackground?: string;
  adminIconColor?: string;
  adminValueStyle?: React.CSSProperties;

  // Restaurant specific props
  restContainerVariant?: "warm" | "cool" | "green" | "default";
  restIconVariant?: "orange" | "violet" | "green" | "muted" | "default";
  restValueVariant?: "green" | "default";
  restSubtitleVariant?: "danger" | "default";
}

export const StatCard: React.FC<StatCardProps> = ({
  theme,
  title,
  value,
  subtitle,
  icon,
  adminIconBackground,
  adminIconColor,
  adminValueStyle,
  restContainerVariant,
  restIconVariant,
  restValueVariant,
  restSubtitleVariant,
}) => {
  if (theme === "admin") {
    return (
      <div className="metric-card-premium">
        <div className="metric-card-header">
          <span className="metric-card-title">{title}</span>
          <div className="metric-card-icon-wrapper metric-card-icon-wrapper-default">
            {icon}
          </div>
        </div>
        <div className="metric-card-value">{value}</div>
        <div className="metric-card-desc">{subtitle}</div>
      </div>
    );
  }

  // Restaurant Theme
  const containerClass =
    restContainerVariant && restContainerVariant !== "default"
      ? `stat-card stat-card--${restContainerVariant}`
      : "stat-card";

  const iconClass =
    restIconVariant && restIconVariant !== "default"
      ? `stat-card__icon stat-card__icon--${restIconVariant}`
      : "stat-card__icon";

  const valueClass =
    restValueVariant && restValueVariant !== "default"
      ? `stat-card__value stat-card__value--${restValueVariant}`
      : "stat-card__value";

  const subtitleClass =
    restSubtitleVariant && restSubtitleVariant !== "default"
      ? `stat-card__subtitle stat-card__subtitle--${restSubtitleVariant}`
      : "stat-card__subtitle";

  return (
    <div className={containerClass}>
      <div className="stat-card__header">
        <span className="stat-card__label">{title}</span>
        <div className={iconClass}>{icon}</div>
      </div>
      <div className={valueClass}>{value}</div>
      <div className={subtitleClass}>{subtitle}</div>
    </div>
  );
};
