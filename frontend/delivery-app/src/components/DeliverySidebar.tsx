import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bike,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useDelivery } from "../hooks/useDelivery";
import { deliveryNavigation } from "./deliveryNavigation";

export const DeliverySidebar: React.FC = () => {
  const { driverName, isOnline, sidebarCollapsed, toggleSidebar, logout } =
    useDelivery();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <aside
      className={`delivery-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="delivery-sidebar__top">
        <Link to="/" className="delivery-sidebar__brand">
          {sidebarCollapsed ? "b" : "bites"}
        </Link>
        <span
          className={`delivery-sidebar__status ${isOnline ? "is-live" : "is-offline"}`}
        >
          {isOnline ? "On shift" : "Offline"}
        </span>
        <button
          type="button"
          className="delivery-sidebar__toggle"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="delivery-sidebar__card">
        <div className="delivery-sidebar__avatar">
          {driverName.charAt(0).toUpperCase()}
        </div>
        {!sidebarCollapsed && (
          <div>
            <div className="delivery-sidebar__name">{driverName}</div>
            <div className="delivery-sidebar__meta">Delivery partner console</div>
          </div>
        )}
      </div>

      <div className="delivery-sidebar__section-title">
        {!sidebarCollapsed ? "Availability" : "LIVE"}
      </div>
      <div className="delivery-sidebar__nav">
        <span className="delivery-sidebar__link delivery-sidebar__availability">
          {isOnline ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {!sidebarCollapsed && <span>{isOnline ? "Online" : "Offline"}</span>}
        </span>
      </div>

      {deliveryNavigation.map((section) => (
        <React.Fragment key={section.label}>
          <div className="delivery-sidebar__section-title">
            {sidebarCollapsed ? section.shortLabel : section.label}
          </div>
          <nav className="delivery-sidebar__nav" aria-label={`${section.label} navigation`}>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  className={`delivery-sidebar__link ${isActive(item.path) ? "active" : ""}`}
                  to={item.path}
                >
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </React.Fragment>
      ))}

      <div className="delivery-sidebar__footer">
        <button className="delivery-sidebar__logout" type="button" onClick={logout}>
          <LogOut size={18} />
          {!sidebarCollapsed && <span>Sign out</span>}
        </button>
        <div className="delivery-sidebar__note">
          <Bike size={14} />
          {!sidebarCollapsed && <span>Live rider view</span>}
        </div>
      </div>
    </aside>
  );
};
