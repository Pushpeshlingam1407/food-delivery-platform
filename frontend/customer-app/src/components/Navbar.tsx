import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, ChevronDown, User } from "lucide-react";
import { SearchBar } from "../../../shared/components/SearchBar";

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
  cartCount = 0,
  userEmail = null,
  onLogout,
  onCartClick,
  searchQuery = "",
  onSearchChange,
  deliveryAddress = "Bengaluru, IND",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleProfileClick = () => {
    if (window.innerWidth <= 1024) {
      navigate(userEmail ? "/profile" : "/login");
      return;
    }

    setProfileDropdownOpen((open) => !open);
  };

  return (
    <>
      <nav className="navbar-container premium-navbar">
        {/* Left Side: Address Context */}
        <div className="navbar-left">
          <Link
            to="/addresses"
            className="address-pill-btn"
          >
            <div className="address-icon-wrapper">
              <MapPin size={14} color="var(--accent-orange)" />
            </div>
            <div className="address-text-wrapper">
              <span className="address-label">Deliver to</span>
              <span className="address-value">
                {deliveryAddress.length > 20
                  ? deliveryAddress.substring(0, 20) + "..."
                  : deliveryAddress}
              </span>
            </div>
            <ChevronDown
              size={16}
              color="var(--text-muted)"
              className="address-chevron"
            />
          </Link>
        </div>

        {/* Center: Search */}
        <div className="navbar-center">
          {isHomePage && (
            <SearchBar
              placeholder="Search restaurants or dishes"
              value={searchQuery}
              onSearchChange={onSearchChange}
              className="navbar-search-box"
            />
          )}
        </div>

        {/* Right Side: Cart & Profile */}
        <div className="navbar-right">
          {!userEmail ? (
            <Link
              to="/login"
              className="navbar-signin-pill"
            >
              Sign In
            </Link>
          ) : (
            <div className="navbar-profile-menu-wrapper">
              <button
                type="button"
                onClick={handleProfileClick}
                className={`navbar-profile-btn ${
                  profileDropdownOpen ? "navbar-profile-btn--active" : ""
                }`}
                aria-label="Open profile menu"
              >
                <User size={20} />
              </button>

              {profileDropdownOpen && window.innerWidth > 1024 && (
                <div className="navbar-profile-menu">
                  <div className="navbar-profile-menu-header">
                    <span className="navbar-profile-menu-eyebrow">
                      Logged in as
                    </span>
                    <div className="navbar-profile-menu-email">
                      {userEmail}
                    </div>
                  </div>
                  <Link
                    onClick={() => setProfileDropdownOpen(false)}
                    to="/orders"
                    className="navbar-profile-menu-link"
                  >
                    My Orders
                  </Link>
                  <Link
                    onClick={() => setProfileDropdownOpen(false)}
                    to="/addresses"
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
            className={`cart-btn-capsule ${
              cartCount > 0 ? "cart-btn-capsule--active" : ""
            }`}
          >
            <ShoppingBag size={18} />
            <span className="cart-text">
              {cartCount > 0 ? `${cartCount} Items` : "Cart"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
