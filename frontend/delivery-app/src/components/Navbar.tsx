import React from "react";
import { BitesNavbar } from "../../../shared/components/BitesNavbar";
import { useDelivery } from "../hooks/useDelivery";

export const Navbar: React.FC = () => {
  const { driverName, logout } = useDelivery();

  return (
    <>
      <BitesNavbar
        variant="driver"
        driverName={driverName}
        onLogout={logout}
        onOpenMenu={() =>
          window.dispatchEvent(new CustomEvent("open-app-sidebar"))
        }
      />
    </>
  );
};
