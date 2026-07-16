import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { DeliverySidebar } from "../components/DeliverySidebar";
import { MobileBottomNav } from "../../../shared/components/MobileBottomNav";
import { ResponsiveFooter } from "../../../shared/components/ResponsiveFooter";
import type { MobileBottomNavItem } from "../../../shared/components/MobileBottomNav";
import type { FooterSection } from "../../../shared/components/ResponsiveFooter";
import { Truck, Wallet, ClipboardList, LogOut, FileText } from "lucide-react";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { Earnings } from "../pages/Earnings";
import { Ledger } from "../pages/Ledger";
import { WalletPage } from "../pages/WalletPage";

import { useAppContext } from "../../../shared/context/AppContext";

export const AppRoutes: React.FC = () => {
  const {
    userEmail,
    handleLogout,
    driverOnline: isOnline,
    deliverySidebarCollapsed: sidebarCollapsed,
    setDeliverySidebarCollapsed: setSidebarCollapsed,
  } = useAppContext();

  const navigate = useNavigate();
  const driverName = localStorage.getItem("userName") || "Driver";

  const footerSections: FooterSection[] = [
    {
      title: "Driver Tools",
      links: [
        { label: "Shift Jobs", to: "/" },
        { label: "Finance Ledger", to: "/ledger" },
        { label: "Earnings Stats", to: "/earnings" },
      ],
    },
    {
      title: "Switch Portals",
      links: [
        { label: "Customer Storefront", href: "http://localhost:5173" },
        { label: "Restaurant Dashboard", href: "http://localhost:5174" },
        { label: "Admin Panel", href: "http://localhost:5175" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Shift Safety", to: "/" },
        { label: "Payment Help", to: "/" },
        { label: "Logout", onClick: handleLogout },
      ],
    },
  ];

  const bottomNavItems: MobileBottomNavItem[] = [
    { icon: <Truck size={22} />, label: "Jobs", route: "/" },
    {
      icon: <ClipboardList size={22} />,
      label: "Earnings",
      route: "/earnings",
    },
    { icon: <FileText size={22} />, label: "Ledger", route: "/ledger" },
    { icon: <Wallet size={22} />, label: "Wallet", route: "/wallet" },
    { icon: <LogOut size={22} />, label: "Exit", onClick: handleLogout },
  ];

  return userEmail ? (
    <div className="delivery-layout">
      <div
        className={`delivery-sidebar-shell ${sidebarCollapsed ? "is-collapsed" : ""}`}
      >
        <DeliverySidebar
          driverName={driverName}
          isOnline={isOnline}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() =>
            setSidebarCollapsed((collapsed) => !collapsed)
          }
          onLogout={handleLogout}
        />
      </div>

      <div className="delivery-main-shell">
        <Navbar driverName={driverName} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ResponsiveFooter
          sections={footerSections}
          bottomText={`© ${new Date().getFullYear()} Bites Logistics Private Limited. All rights reserved.`}
        />
        <MobileBottomNav items={bottomNavItems} />
      </div>
    </div>
  ) : (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};
