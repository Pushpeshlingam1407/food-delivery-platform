import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { SearchBar } from "./SearchBar";
import { PlatformNavbar } from "./PlatformNavbar";

type CustomerProps = {
  variant: "customer";
  cartCount?: number;
  userEmail?: string | null;
  onLogout?: () => void;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  deliveryAddress?: string;
};
type DriverProps = {
  variant: "driver";
  driverName?: string | null;
  onLogout?: () => void;
  onOpenMenu: () => void;
};

export const BitesNavbar: React.FC<CustomerProps | DriverProps> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  React.useEffect(() => setProfileOpen(false), [location.pathname]);

  if (props.variant === "driver") {
    const name = props.driverName || "Driver";
    return (
      <PlatformNavbar
        className="delivery-navbar"
        left={
          <>
            <button
              type="button"
              className="delivery-navbar__menu navbar-mobile-only"
              aria-label="Open navigation"
              onClick={props.onOpenMenu}
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="delivery-navbar__brand">
              bites
            </Link>
          </>
        }
        center={
          <div className="delivery-navbar__context">
            <Truck size={16} />
            <span>Driver workspace</span>
          </div>
        }
        right={
          props.onLogout ? (
            <button
              type="button"
              className="delivery-navbar__profile"
              onClick={props.onLogout}
            >
              <span>{name.charAt(0).toUpperCase()}</span>
              <span className="navbar-desktop-only">Sign out</span>
              <LogOut size={16} className="navbar-mobile-only" />
            </button>
          ) : (
            <span />
          )
        }
      />
    );
  }

  const {
    cartCount = 0,
    userEmail = null,
    onLogout,
    onCartClick,
    searchQuery = "",
    onSearchChange,
    deliveryAddress = "Bengaluru, IND",
  } = props;
  const toggleProfile = () => {
    if (window.innerWidth <= 1024) {
      navigate(userEmail ? "/profile" : "/login");
      return;
    }
    setProfileOpen((open) => !open);
  };
  return (
    <PlatformNavbar
      left={
        <Link to="/addresses" className="address-pill-btn">
          <div className="address-icon-wrapper">
            <MapPin size={14} color="var(--accent-orange)" />
          </div>
          <div className="address-text-wrapper">
            <span className="address-label">Deliver to</span>
            <span className="address-value">
              {deliveryAddress.length > 20
                ? `${deliveryAddress.slice(0, 20)}...`
                : deliveryAddress}
            </span>
          </div>
          <ChevronDown
            size={16}
            color="var(--text-muted)"
            className="address-chevron"
          />
        </Link>
      }
      center={
        location.pathname === "/" ? (
          <SearchBar
            placeholder="Search restaurants or dishes"
            value={searchQuery}
            onSearchChange={onSearchChange}
            className="navbar-search-box"
          />
        ) : null
      }
      right={
        <>
          {!userEmail ? (
            <Link to="/login" className="navbar-signin-pill">
              Sign In
            </Link>
          ) : (
            <div className="navbar-profile-menu-wrapper">
              <button
                type="button"
                onClick={toggleProfile}
                className={`navbar-profile-btn ${profileOpen ? "navbar-profile-btn--active" : ""}`}
                aria-label="Open profile menu"
              >
                <User size={20} />
              </button>
              {profileOpen && window.innerWidth > 1024 && (
                <div className="navbar-profile-menu">
                  <div className="navbar-profile-menu-header">
                    <span className="navbar-profile-menu-eyebrow">
                      Logged in as
                    </span>
                    <div className="navbar-profile-menu-email">{userEmail}</div>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setProfileOpen(false)}
                    className="navbar-profile-menu-link"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setProfileOpen(false)}
                    className="navbar-profile-menu-link"
                  >
                    Addresses
                  </Link>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="navbar-profile-menu-signout"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <button
            onClick={onCartClick}
            className={`cart-btn-capsule ${cartCount > 0 ? "cart-btn-capsule--active" : ""}`}
          >
            <ShoppingBag size={18} />
            <span className="cart-text">
              {cartCount > 0 ? `${cartCount} Items` : "Cart"}
            </span>
          </button>
        </>
      }
    />
  );
};
