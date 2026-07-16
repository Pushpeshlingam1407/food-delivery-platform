import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
        { label: "Active Deliveries", to: "/" },
        {
          label: "Wallet",
          onClick: () => {
            document.getElementById("driver-wallet-section")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          },
        },
        {
          label: "Job Details",
          onClick: () => {
            document.getElementById("driver-job-section")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          },
        },
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
      label: "Job Card",
      onClick: () => {
        document.getElementById("driver-job-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
    },
    {
      icon: <FileText size={22} />,
      label: "Ledger",
      onClick: () => {
        document.getElementById("driver-ledger-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
    },
    {
      icon: <Wallet size={22} />,
      label: "Wallet",
      onClick: () => {
        document.getElementById("driver-wallet-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
    },
    { icon: <LogOut size={22} />, label: "Exit", onClick: handleLogout },
  ];

  return (
    <BrowserRouter>
      {userEmail ? (
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
              onWalletJump={() => {
                document
                  .getElementById("driver-wallet-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
              onJobsJump={() => {
                document.getElementById("driver-job-section")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />
          </div>

          <div className="delivery-main-shell">
            <Navbar driverName={driverName} onLogout={handleLogout} />
            <Routes>
              <Route
                path="/"
                element={userEmail ? <Dashboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={!userEmail ? <Login /> : <Navigate to="/" />}
              />
              <Route
                path="/register"
                element={!userEmail ? <Register /> : <Navigate to="/" />}
              />
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
          <Route
            path="/login"
            element={!userEmail ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!userEmail ? <Register /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};
