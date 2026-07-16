import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { DeliverySidebar } from "../components/DeliverySidebar";
import { MobileBottomNav } from "../../../shared/components/MobileBottomNav";
import { ResponsiveFooter } from "../../../shared/components/ResponsiveFooter";
import type { MobileBottomNavItem } from "../../../shared/components/MobileBottomNav";
import type { FooterSection } from "../../../shared/components/ResponsiveFooter";
import { Truck, Wallet, ClipboardList, LayoutDashboard, User, FileText } from "lucide-react";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { DeliveriesPage } from "../pages/DeliveriesPage";
import { Earnings } from "../pages/Earnings";
import { Ledger } from "../pages/Ledger";
import { WalletPage } from "../pages/WalletPage";
import { ProfilePage } from "../pages/ProfilePage";

import { useAppContext } from "../../../shared/context/AppContext";

export const AppRoutes: React.FC = () => {
  const {
    userEmail,
    handleLogout,
    driverOnline: isOnline,
    deliverySidebarCollapsed: sidebarCollapsed,
    setDeliverySidebarCollapsed: setSidebarCollapsed,
  } = useAppContext();

  const driverName = localStorage.getItem("userName") || "Driver";

  const footerSections: FooterSection[] = [
    {
      title: "Driver Tools",
      links: [
        { label: "Shift Jobs", to: "/" },
        { label: "Deliveries Board", to: "/deliveries" },
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
    { icon: <LayoutDashboard size={22} />, label: "Home", route: "/" },
    { icon: <Truck size={22} />, label: "Deliveries", route: "/deliveries" },
    { icon: <ClipboardList size={22} />, label: "Earnings", route: "/earnings" },
    { icon: <Wallet size={22} />, label: "Wallet", route: "/wallet" },
    { icon: <User size={22} />, label: "Profile", route: "/profile" },
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
          <Route path="/deliveries" element={<DeliveriesPage />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
