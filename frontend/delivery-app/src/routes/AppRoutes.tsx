import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";

export const AppRoutes: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("userEmail"),
  );
  const [driverName, setDriverName] = useState<string | null>(() =>
    localStorage.getItem("userName"),
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setUserEmail(null);
    window.location.reload();
  };

  return (
    <BrowserRouter>
      {userEmail && <Navbar driverName={driverName} onLogout={handleLogout} />}
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
    </BrowserRouter>
  );
};
