import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { MenuManager } from "../pages/MenuManager";

export const AppRoutes: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail"));
    setRestaurantName(localStorage.getItem("userName"));
  }, []);

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
      {userEmail && (
        <Navbar restaurantName={restaurantName} onLogout={handleLogout} />
      )}
      <Routes>
        <Route
          path="/"
          element={userEmail ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/menu"
          element={userEmail ? <MenuManager /> : <Navigate to="/login" />}
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
