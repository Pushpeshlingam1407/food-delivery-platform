import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { MenuManager } from "../pages/MenuManager";
import { Earnings } from "../pages/Earnings";

import { useAppContext } from "../../../shared/context/AppContext";
import { VerificationGate } from "../../../shared/components/VerificationGate";
import "../../../shared/components/VerificationGate.css";

export const AppRoutes: React.FC = () => {
  const { userEmail, handleLogout } = useAppContext();
  const restaurantName = localStorage.getItem("userName");

  return (
    <BrowserRouter>
      {userEmail && (
        <Navbar restaurantName={restaurantName} onLogout={handleLogout} />
      )}
      <Routes>
        <Route
          path="/"
          element={userEmail ? <VerificationGate role="restaurant_owner"><Dashboard /></VerificationGate> : <Navigate to="/login" />}
        />
        <Route
          path="/menu"
          element={userEmail ? <VerificationGate role="restaurant_owner"><MenuManager /></VerificationGate> : <Navigate to="/login" />}
        />
        <Route
          path="/earnings"
          element={userEmail ? <VerificationGate role="restaurant_owner"><Earnings /></VerificationGate> : <Navigate to="/login" />}
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
