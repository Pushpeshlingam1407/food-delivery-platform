import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { DeliverySidebar } from "../components/DeliverySidebar";
import { MobileBottomNav } from "../../../shared/components/MobileBottomNav";
import { ResponsiveFooter } from "../../../shared/components/ResponsiveFooter";
import type { MobileBottomNavItem } from "../../../shared/components/MobileBottomNav";
import type { FooterSection } from "../../../shared/components/ResponsiveFooter";
import {
  Truck,
  Wallet,
  ClipboardList,
  LayoutDashboard,
  User,
  FileText,
  Map,
} from "lucide-react";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { DeliveryRequestsPage } from "../pages/DeliveryRequestsPage";
import { ActiveOrdersPage } from "../pages/ActiveOrdersPage";
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
        { label: "Shift Overview", to: "/" },
        { label: "Delivery Requests", to: "/requests" },
        { label: "Active Orders", to: "/active-orders" },
        { label: "Delivery History", to: "/ledger" },
        { label: "Earnings & Payments", to: "/earnings" },
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
    { icon: <Truck size={22} />, label: "Deliveries", route: "/requests" },
    { icon: <Map size={22} />, label: "Map / Route", route: "/active-orders" },
    {
      icon: <ClipboardList size={22} />,
      label: "Earnings",
      route: "/earnings",
    },
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
          <Route path="/requests" element={<DeliveryRequestsPage />} />
          <Route path="/active-orders" element={<ActiveOrdersPage />} />
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
