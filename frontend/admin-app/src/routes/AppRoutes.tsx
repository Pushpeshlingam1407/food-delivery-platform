import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Refunds } from "../pages/Refunds";
import { Settings } from "../pages/Settings";
import { CMS } from "../pages/CMS";

export const AppRoutes: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("userEmail"),
  );
  const [adminName, setAdminName] = useState<string | null>(() =>
    localStorage.getItem("userName"),
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setUserEmail(null);
    window.location.reload();
  };

  return (
    <BrowserRouter>
      {userEmail && <Navbar adminName={adminName} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={userEmail ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/refunds"
          element={userEmail ? <Refunds /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={userEmail ? <Settings /> : <Navigate to="/login" />}
        />
        <Route
          path="/cms"
          element={userEmail ? <CMS /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!userEmail ? <Login /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
