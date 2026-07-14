import React from "react";
import { BitesNavbar } from "../../../shared/components/BitesNavbar";
import { useAppContext } from "../../../shared/context/AppContext";

export const Navbar: React.FC = () => {
  const {
    cartCount,
    userEmail,
    handleLogout,
    setCartOpen,
    searchQuery,
    setSearchQuery,
    deliveryAddress,
  } = useAppContext();

  return (
    <BitesNavbar
      variant="customer"
      cartCount={cartCount}
      userEmail={userEmail}
      onLogout={handleLogout}
      onCartClick={() => setCartOpen(true)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      deliveryAddress={deliveryAddress}
    />
  );
};
