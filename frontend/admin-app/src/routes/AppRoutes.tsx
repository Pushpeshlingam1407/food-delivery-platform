import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import { Login } from "../pages/Login";
import { Dashboard } from "../pages/Dashboard";
import { Refunds } from "../pages/Refunds";
import { Settings } from "../pages/Settings";
import { CMS } from "../pages/CMS";
import { RestaurantsManagement } from "../pages/RestaurantsManagement";
import { CustomersManagement } from "../pages/CustomersManagement";
import { DriversManagement } from "../pages/DriversManagement";
import { OrdersManagement } from "../pages/OrdersManagement";
import { ImagesManagement } from "../pages/ImagesManagement";
import { OwnersManagement } from "../pages/OwnersManagement";

export const AppRoutes: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("userEmail"),
  );
  const adminName = localStorage.getItem("userName");

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
      <div className={userEmail ? "admin-layout" : ""}>
        {userEmail && (
          <AdminSidebar adminName={adminName} onLogout={handleLogout} />
        )}
        <main className={userEmail ? "admin-main-content" : ""}>
          <Routes>
            <Route
              path="/"
              element={userEmail ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/restaurants"
              element={
                userEmail ? <RestaurantsManagement /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/customers"
              element={
                userEmail ? <CustomersManagement /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/owners"
              element={userEmail ? <OwnersManagement /> : <Navigate to="/login" />}
            />
            <Route
              path="/drivers"
              element={userEmail ? <DriversManagement /> : <Navigate to="/login" />}
            />
            <Route
              path="/orders"
              element={userEmail ? <OrdersManagement /> : <Navigate to="/login" />}
            />
            <Route
              path="/images"
              element={userEmail ? <ImagesManagement /> : <Navigate to="/login" />}
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
        </main>
      </div>
    </BrowserRouter>
  );
};
