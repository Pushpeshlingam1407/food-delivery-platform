import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  MapPin,
  ChevronRight,
  LogOut,
  Wallet,
  HelpCircle,
  FileText,
} from "lucide-react";

interface ProfileProps {
  userEmail: string | null;
  userName: string | null;
  walletBalance: number | null;
  onLogout: () => void;
  onDepositClick: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  userEmail,
  userName,
  walletBalance,
  onLogout,
  onDepositClick,
}) => {
  const navigate = useNavigate();

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (userEmail?.[0]?.toUpperCase() ?? "U");

  const menuItems = [
    {
      icon: <ShoppingBag size={18} />,
      label: "My Orders",
      sub: "Track and reorder past meals",
      action: () => navigate("/orders"),
    },
    {
      icon: <MapPin size={18} />,
      label: "Saved Addresses",
      sub: "Manage your delivery locations",
      action: () => navigate("/addresses"),
    },
    {
      icon: <Wallet size={18} />,
      label: "Wallet",
      sub:
        walletBalance !== null
          ? `Balance: $${walletBalance.toFixed(2)} — tap to top up`
          : "Add money to your wallet",
      action: onDepositClick,
    },
    {
      icon: <FileText size={18} />,
      label: "Terms & Conditions",
      sub: "Legal information",
      action: () => navigate("/page/terms-of-service"),
    },
    {
      icon: <FileText size={18} />,
      label: "Privacy Policy",
      sub: "How we use your data",
      action: () => navigate("/page/privacy-policy"),
    },
    {
      icon: <HelpCircle size={18} />,
      label: "FAQs",
      sub: "Common questions answered",
      action: () => navigate("/page/faqs"),
    },
  ];

  return (
    <div className="profile-page">
      {/* Avatar header card */}
      <div className="profile-header">
        <div className="profile-avatar-ring">{initials}</div>
        <div>
          <div className="profile-name">{userName || "Guest User"}</div>
          <div className="profile-email">{userEmail || "Not signed in"}</div>
        </div>
      </div>

      {/* Wallet quick tile */}
      {walletBalance !== null && (
        <div
          className="stat-tile stat-tile--green profile-wallet-tile"
          onClick={onDepositClick}
        >
          <div className="stat-tile-icon">
            <Wallet size={32} />
          </div>
          <div className="stat-tile-label">Wallet Balance</div>
          <div className="stat-tile-value">${walletBalance.toFixed(2)}</div>
          <div className="stat-tile-sub">Tap to add money →</div>
        </div>
      )}

      {/* Nav list */}
      <div className="profile-menu-list">
        {menuItems.map((item, i) => (
          <button key={i} className="profile-menu-item" onClick={item.action}>
            <div className="profile-menu-icon">{item.icon}</div>
            <div className="profile-menu-item-content">
              <div className="profile-menu-item-label">{item.label}</div>
              <div className="profile-menu-item-sub">{item.sub}</div>
            </div>
            <ChevronRight size={16} className="profile-menu-arrow" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button className="profile-logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
};
