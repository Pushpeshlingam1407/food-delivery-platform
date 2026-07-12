import React from "react";
import { BitesNavbar } from "../../../shared/components/BitesNavbar";

interface NavbarProps {
  cartCount?: number;
  userEmail?: string | null;
  onLogout?: () => void;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  walletBalance?: number | null;
  onDepositClick?: () => void;
  deliveryAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletBalance: _walletBalance,
  onDepositClick: _onDepositClick,
  ...props
}) => <BitesNavbar variant="customer" {...props} />;
