import React from "react";

interface PlatformNavbarProps {
  left: React.ReactNode;
  center?: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

/** Shared shell for every Bites product navbar. Product apps provide only their content. */
export const PlatformNavbar: React.FC<PlatformNavbarProps> = ({
  left,
  center,
  right,
  className = "",
}) => (
  <nav className={`navbar-container premium-navbar ${className}`.trim()}>
    <div className="navbar-left">{left}</div>
    <div className="navbar-center">{center}</div>
    <div className="navbar-right">{right}</div>
  </nav>
);
