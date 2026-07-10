import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { DesktopSidebar } from "../../../shared/components/DesktopSidebar";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { OtpLogin } from "../pages/OtpLogin";
import { RestaurantDetails } from "../pages/RestaurantDetails";
import { CartDrawer } from "../components/CartDrawer";
import { Checkout } from "../pages/Checkout";
import { OrderTracking } from "../pages/OrderTracking";
import { CmsPage } from "../pages/CmsPage";
import { Orders } from "../pages/Orders";
import { AddressManager } from "../pages/AddressManager";
import { Profile } from "../pages/Profile";
import { ShimmerList } from "../components/Shimmer";
import api from "../../../shared/services/api";
import {
  DollarSign,
  Truck,
  ArrowRight,
  Compass,
  MapPin,
  Wallet,
  LogOut,
  LogIn,
  User,
  ShoppingBag,
  Menu,
  Clock,
  RotateCcw,
  Home as HomeIcon,
  ClipboardList,
} from "lucide-react";
import { toast } from "../utils/toast";

// Admin Imports
import { Dashboard as AdminDashboard } from "../../../admin-app/src/pages/Dashboard";
import { RestaurantsManagement } from "../../../admin-app/src/pages/RestaurantsManagement";
import { CustomersManagement } from "../../../admin-app/src/pages/CustomersManagement";
import { OwnersManagement } from "../../../admin-app/src/pages/OwnersManagement";
import { DriversManagement } from "../../../admin-app/src/pages/DriversManagement";
import { OrdersManagement } from "../../../admin-app/src/pages/OrdersManagement";
import { ImagesManagement } from "../../../admin-app/src/pages/ImagesManagement";
import { Refunds } from "../../../admin-app/src/pages/Refunds";
import { Settings } from "../../../admin-app/src/pages/Settings";
import { CMS } from "../../../admin-app/src/pages/CMS";
import { Navbar as AdminNavbar } from "../../../admin-app/src/components/Navbar";

// Restaurant Imports
import { Dashboard as RestaurantDashboard } from "../../../restaurant-app/src/pages/Dashboard";
import { MenuManager } from "../../../restaurant-app/src/pages/MenuManager";
import { Earnings } from "../../../restaurant-app/src/pages/Earnings";
import { Navbar as RestaurantNavbar } from "../../../restaurant-app/src/components/Navbar";

// Delivery Imports
import { Dashboard as DeliveryDashboard } from "../../../delivery-app/src/pages/Dashboard";
import { Navbar as DeliveryNavbar } from "../../../delivery-app/src/components/Navbar";

interface HomeProps {
  searchQuery: string;
  addToCart?: (item: any) => void;
}

const CUISINE_CATEGORIES = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "biryani", label: "Biryani", emoji: "🍛" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "burger", label: "Burgers", emoji: "🍔" },
  { id: "chinese", label: "Chinese", emoji: "🥢" },
  { id: "south indian", label: "South Indian", emoji: "🥘" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
  { id: "healthy", label: "Healthy", emoji: "🥗" },
  { id: "rolls", label: "Rolls & Wraps", emoji: "🌯" },
  { id: "thali", label: "Thali", emoji: "🍱" },
];

const REST_EMOJIS: Record<string, string> = {
  biryani: "🍛",
  pizza: "🍕",
  burger: "🍔",
  chinese: "🥢",
  "south indian": "🥘",
  desserts: "🍰",
  healthy: "🥗",
  rolls: "🌯",
  thali: "🍱",
  default: "🍽️",
};

const getRestEmoji = (desc: string = "") => {
  const d = desc.toLowerCase();
  for (const key of Object.keys(REST_EMOJIS)) {
    if (d.includes(key)) return REST_EMOJIS[key];
  }
  return REST_EMOJIS.default;
};

// Landing Page Dashboard (Customers)
const Home: React.FC<HomeProps> = ({ searchQuery, addToCart }) => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [reordering, setReordering] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(
        `/restaurants?search=${encodeURIComponent(searchQuery)}`,
      );
      if (response.data.status === "success") {
        setRestaurants(response.data.data);
      }

      if (localStorage.getItem("accessToken")) {
        const ordersRes = await api.get("/orders");
        if (ordersRes.data.status === "success") {
          const allOrders = ordersRes.data.data || [];
          const active = allOrders.filter((o: any) =>
            [
              "placed",
              "preparing",
              "ready_for_pickup",
              "out_for_delivery",
            ].includes(o.status),
          );
          setActiveOrders(active);
          const delivered = allOrders.filter(
            (o: any) => o.status === "delivered",
          );
          setPastOrders(delivered.slice(0, 4));
        }
      }
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchQuery]);

  const handleOrderAgain = async (orderId: string) => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    setReordering(orderId);
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.status === "success") {
        const items = res.data.data?.items || [];
        for (const item of items) {
          if (addToCart) {
            await addToCart({
              id: item.menu_id,
              name: item.name,
              price: item.price,
            });
          }
        }
        toast.success("Items added to your cart! 🛒");
      }
    } catch {
      toast.error("Could not reorder. Please try again.");
    } finally {
      setReordering(null);
    }
  };

  const filteredRestaurants =
    activeCategory === "all"
      ? restaurants
      : restaurants.filter(
          (r) =>
            (r.description || "").toLowerCase().includes(activeCategory) ||
            (r.name || "").toLowerCase().includes(activeCategory),
        );

  return (
    <div className="app-shell">
      {/* Active order live banner */}
      {localStorage.getItem("accessToken") && activeOrders.length > 0 && (
        <div className="feature-section">
          {activeOrders.map((o) => (
            <div
              key={o.id}
              className="active-order-banner-card"
              onClick={() => navigate(`/track/${o.id}`)}
            >
              <div className="delivery-active-dot" />
              <div className="active-order-banner-info">
                <div className="active-order-banner-name">{o.restaurant_name}</div>
                <div className="active-order-banner-status">
                  {o.status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </div>
              </div>
              <div className="active-order-banner-track">
                Track <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Again strip */}
      {localStorage.getItem("accessToken") && pastOrders.length > 0 && (
        <div className="feature-section order-again-section">
          <div className="order-again-header">
            <div className="order-again-title">Order Again</div>
            <Link to="/orders" className="order-again-see-all">
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="order-again-scroll">
            {pastOrders.map((o) => (
              <div key={o.id} className="order-again-card">
                <div className="order-again-rest">{o.restaurant_name}</div>
                <div className="order-again-meta">
                  Order #{o.order_number}
                  <br />$
                  {parseFloat(o.total_payable?.toString() || "0").toFixed(2)}
                </div>
                <button
                  className="order-again-btn"
                  disabled={reordering === o.id}
                  onClick={() => handleOrderAgain(o.id)}
                >
                  <RotateCcw size={13} />
                  {reordering === o.id ? "Adding..." : "Order Again"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter pills */}
      <div className="feature-section category-pills-section">
        <div className="category-pills-scroll">
          {CUISINE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill${activeCategory === cat.id ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section heading */}
      <div className="section-row-header">
        <div className="section-row-title">
          {activeCategory === "all"
            ? "All Restaurants"
            : `${CUISINE_CATEGORIES.find((c) => c.id === activeCategory)?.label} Near You`}
        </div>
        <div className="section-meta-count">
          {filteredRestaurants.length} places
        </div>
      </div>

      {loading ? (
        <ShimmerList />
      ) : (
        <div className="blinkit-restaurant-grid">
          {filteredRestaurants.map((r, i) => (
            <Link
              to={`/restaurant/${r.id}`}
              key={r.id}
              className="blinkit-restaurant-card"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="blinkit-card-image-wrapper">
                {getRestEmoji(r.description)}
                {r.status !== "open" && (
                  <div className="blinkit-card-closed-overlay">Closed</div>
                )}
              </div>
              <div className="blinkit-card-body">
                <div className="blinkit-card-name">{r.name}</div>
                <div className="blinkit-card-cuisine">
                  {r.description
                    ? r.description.slice(0, 48) +
                      (r.description.length > 48 ? "…" : "")
                    : "Multi-cuisine restaurant"}
                </div>
                <div className="blinkit-card-footer">
                  <div className="blinkit-card-time-pill">
                    <Clock size={11} />
                    {r.average_delivery_time || 30}–
                    {(r.average_delivery_time || 30) + 10} min
                  </div>
                  <div
                    className={`blinkit-card-status ${r.status === "open" ? "open" : "closed"}`}
                  >
                    {r.status === "open" ? "Open" : "Closed"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredRestaurants.length === 0 && (
            <div className="blinkit-empty-state">
              <div className="blinkit-empty-icon">🍽️</div>
              <div className="blinkit-empty-title">No restaurants found</div>
              <div className="blinkit-empty-sub">
                Try a different category or search term
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const GlobalBackBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/" || location.pathname === "") {
    return null;
  }

  return (
    <div className="global-back-bar">
      <button onClick={() => navigate(-1)} className="back-button-global">
        ← Back
      </button>
    </div>
  );
};

interface MobileBottomNavProps {
  cartCount: number;
  userEmail: string | null;
  onCartClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  userEmail,
  onCartClick,
}) => {
  const location = useLocation();
  const path = location.pathname;

  const items = [
    { icon: <HomeIcon size={22} />, label: "Home", route: "/" },
    { icon: <ClipboardList size={22} />, label: "Orders", route: "/orders" },
    {
      icon: <ShoppingBag size={22} />,
      label: "Cart",
      action: onCartClick,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      icon: <User size={22} />,
      label: "Profile",
      route: userEmail ? "/profile" : "/login",
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item, i) => {
        const isActive = item.route ? path === item.route : false;
        return item.action ? (
          <button
            key={i}
            className={`mobile-bottom-nav-item${isActive ? " active" : ""}`}
            onClick={item.action}
          >
            {item.badge != null && (
              <span className="mobile-bottom-nav-badge">{item.badge}</span>
            )}
            {item.icon}
            <span>{item.label}</span>
          </button>
        ) : (
          <Link
            key={i}
            to={item.route!}
            className={`mobile-bottom-nav-item${isActive ? " active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export const AppRoutes: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("userEmail"),
  );
  const [userRole, setUserRole] = useState<string | null>(() =>
    localStorage.getItem("userRole"),
  );
  const [cart, setCart] = useState<{
    [itemId: string]: { name: string; price: number; qty: number };
  }>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] =
    useState<string>("Select Address");

  const fetchDeliveryAddress = async () => {
    if (localStorage.getItem("accessToken")) {
      try {
        const res = await api.get("/addresses");
        if (res.data.status === "success") {
          const list = res.data.data || [];
          const defaultAddr =
            list.find((addr: any) => addr.is_default) || list[0];
          if (defaultAddr) {
            setDeliveryAddress(`${defaultAddr.city}, ${defaultAddr.state}`);
          }
        }
      } catch (err) {
        console.error("Fetch delivery address error:", err);
      }
    }
  };

  const fetchWallet = async () => {
    if (localStorage.getItem("accessToken")) {
      try {
        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        }
      } catch (err) {
        console.error("Fetch wallet error:", err);
      }
    }
  };

  const handleDeposit = async () => {
    const amountStr = prompt("Enter deposit amount ($):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    try {
      const res = await api.post("/wallets/deposit", {
        amount,
        description: "Wallet Top-up",
      });
      if (res.data.status === "success") {
        toast.success("Wallet funds added successfully!");
        fetchWallet();
      }
    } catch (err) {
      toast.error("Failed to deposit funds.");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchCartFromBackend();
      fetchWallet();
      fetchDeliveryAddress();
    }
  }, []);

  const fetchCartFromBackend = async () => {
    try {
      const res = await api.get("/cart");
      if (res.data.status === "success") {
        const backendItems = res.data.data.items || [];
        const newCart: any = {};
        backendItems.forEach((item: any) => {
          newCart[item.menu_id] = {
            name: item.name,
            price: parseFloat(item.price),
            qty: item.quantity,
          };
        });
        setCart(newCart);
      }
    } catch (err) {
      console.error("Fetch backend cart failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("realEmail");
    setUserEmail(null);
    setUserRole(null);
    window.location.reload();
  };

  const addToCart = async (item: any) => {
    const existing = cart[item.id];
    const newQty = existing ? existing.qty + 1 : 1;

    setCart((prev) => ({
      ...prev,
      [item.id]: {
        name: item.name,
        price: parseFloat(item.price.toString()),
        qty: newQty,
      },
    }));

    try {
      if (localStorage.getItem("accessToken")) {
        await api.post("/cart/items", { menuId: item.id, quantity: 1 });
      }
    } catch (err) {
      console.error("Sync add to cart failed:", err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const existing = cart[itemId];
    if (!existing) return;

    setCart((prev) => {
      const updated = { ...prev };
      if (existing.qty <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId] = { ...existing, qty: existing.qty - 1 };
      }
      return updated;
    });

    try {
      if (localStorage.getItem("accessToken")) {
        if (existing.qty <= 1) {
          await api.delete(`/cart/items/${itemId}`);
        } else {
          await api.put(`/cart/items/${itemId}`, {
            quantity: existing.qty - 1,
          });
        }
      }
    } catch (err) {
      console.error("Sync remove from cart failed:", err);
    }
  };

  const updateQty = async (itemId: string, newQty: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[itemId];
      } else if (updated[itemId]) {
        updated[itemId] = { ...updated[itemId], qty: newQty };
      }
      return updated;
    });

    try {
      if (localStorage.getItem("accessToken")) {
        if (newQty <= 0) {
          await api.delete(`/cart/items/${itemId}`);
        } else {
          await api.put(`/cart/items/${itemId}`, { quantity: newQty });
        }
      }
    } catch (err) {
      console.error("Sync update qty failed:", err);
    }
  };

  const clearCart = async () => {
    setCart({});
    try {
      if (localStorage.getItem("accessToken")) {
        await api.delete("/cart");
      }
    } catch (err) {
      console.error("Sync clear cart failed:", err);
    }
  };

  const cartList = Object.entries(cart).map(([id, val]) => ({
    id,
    ...val,
  }));

  const cartCount = cartList.reduce((acc, item) => acc + item.qty, 0);

  const cartItemsCountMap = Object.keys(cart).reduce(
    (acc, id) => {
      acc[id] = cart[id].qty;
      return acc;
    },
    {} as { [key: string]: number },
  );

  // Render role-specific navigation and routing
  if (userEmail && userRole === "admin") {
    return (
      <BrowserRouter>
        <div className="main-layout-wrapper">
          <DesktopSidebar
            userEmail={userEmail}
            userRole={userRole}
            onLogout={handleLogout}
            onDepositClick={handleDeposit}
            walletBalance={walletBalance}
          />
          <div className="main-content-area">
            <div className="role-utility-header">
              <span>Console Mode: {userRole?.toUpperCase()} View</span>
              <button onClick={handleLogout} className="role-utility-btn">
                ← Back to Role Selector / Sign Out
              </button>
            </div>
            <AdminNavbar
              adminName={localStorage.getItem("userName")}
              onLogout={handleLogout}
            />
            <GlobalBackBar />
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/restaurants" element={<RestaurantsManagement />} />
              <Route path="/customers" element={<CustomersManagement />} />
              <Route path="/owners" element={<OwnersManagement />} />
              <Route path="/drivers" element={<DriversManagement />} />
              <Route path="/orders" element={<OrdersManagement />} />
              <Route path="/images" element={<ImagesManagement />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/cms" element={<CMS />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  if (userEmail && userRole === "restaurant_owner") {
    return (
      <BrowserRouter>
        <div className="main-layout-wrapper">
          <DesktopSidebar
            userEmail={userEmail}
            userRole={userRole}
            onLogout={handleLogout}
            onDepositClick={handleDeposit}
            walletBalance={walletBalance}
          />
          <div className="main-content-area">
            <div className="role-utility-header">
              <span>Console Mode: MERCHANT View</span>
              <button onClick={handleLogout} className="role-utility-btn">
                ← Back to Role Selector / Sign Out
              </button>
            </div>
            <RestaurantNavbar
              restaurantName={localStorage.getItem("userName")}
              onLogout={handleLogout}
            />
            <GlobalBackBar />
            <Routes>
              <Route path="/" element={<RestaurantDashboard />} />
              <Route path="/menu" element={<MenuManager />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  if (userEmail && userRole === "delivery_partner") {
    return (
      <BrowserRouter>
        <div className="main-layout-wrapper">
          <DesktopSidebar
            userEmail={userEmail}
            userRole={userRole}
            onLogout={handleLogout}
            onDepositClick={handleDeposit}
            walletBalance={walletBalance}
          />
          <div className="main-content-area">
            <div className="role-utility-header">
              <span>Console Mode: DRIVER View</span>
              <button onClick={handleLogout} className="role-utility-btn">
                ← Back to Role Selector / Sign Out
              </button>
            </div>
            <DeliveryNavbar
              driverName={localStorage.getItem("userName")}
              onLogout={handleLogout}
            />
            <GlobalBackBar />
            <Routes>
              <Route path="/" element={<DeliveryDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  // Fallback / Customer Routes
  return (
    <BrowserRouter>
      <div className="main-layout-wrapper">
        <DesktopSidebar
          userEmail={userEmail}
          userRole={userRole}
          onLogout={handleLogout}
          onDepositClick={handleDeposit}
          walletBalance={walletBalance}
        />
        <div className="main-content-area">
          <Navbar
            cartCount={cartCount}
            userEmail={userEmail}
            onLogout={handleLogout}
            onCartClick={() => setCartOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            walletBalance={walletBalance}
            onDepositClick={handleDeposit}
            deliveryAddress={deliveryAddress}
          />
          <GlobalBackBar />
          <Routes>
            <Route
              path="/"
              element={<Home searchQuery={searchQuery} addToCart={addToCart} />}
            />
            <Route
              path="/restaurant/:id"
              element={
                <RestaurantDetails
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  cartItems={cartItemsCountMap}
                />
              }
            />
            <Route
              path="/login"
              element={!userEmail ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!userEmail ? <Register /> : <Navigate to="/" />}
            />
            <Route
              path="/otp-login"
              element={!userEmail ? <OtpLogin /> : <Navigate to="/" />}
            />
            <Route
              path="/checkout"
              element={userEmail ? <Checkout /> : <Navigate to="/login" />}
            />
            <Route
              path="/track/:orderId"
              element={userEmail ? <OrderTracking /> : <Navigate to="/login" />}
            />
            <Route path="/page/:slug" element={<CmsPage />} />
            <Route
              path="/orders"
              element={userEmail ? <Orders /> : <Navigate to="/login" />}
            />
            <Route
              path="/addresses"
              element={
                userEmail ? <AddressManager /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={
                userEmail ? (
                  <Profile
                    userEmail={userEmail}
                    userName={localStorage.getItem("userName")}
                    walletBalance={walletBalance}
                    onLogout={handleLogout}
                    onDepositClick={handleDeposit}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <footer className="footer-container">
            <div className="footer-grid">
              <div className="footer-column">
                <h4>Popular Categories</h4>
                <ul>
                  <li>
                    <Link to="/">Vegetables & Fruits</Link>
                  </li>
                  <li>
                    <Link to="/">Cold Drinks & Juices</Link>
                  </li>
                  <li>
                    <Link to="/">Bakery & Biscuits</Link>
                  </li>
                  <li>
                    <Link to="/">Chicken, Meat & Fish</Link>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li>
                    <Link to="/page/about-us">About Us</Link>
                  </li>
                  <li>
                    <Link to="/page/terms-of-service">Terms & Conditions</Link>
                  </li>
                  <li>
                    <Link to="/page/privacy-policy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/page/faqs">FAQs</Link>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>For Partners</h4>
                <ul>
                  <li>
                    <a
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.setItem("userRole", "restaurant_owner");
                        window.location.href = "/login";
                      }}
                    >
                      Merchant Console
                    </a>
                  </li>
                  <li>
                    <a
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.setItem("userRole", "delivery_partner");
                        window.location.href = "/login";
                      }}
                    >
                      Rider Partner Portal
                    </a>
                  </li>
                  <li>
                    <a
                      href="/login"
                      onClick={(e) => {
                        e.preventDefault();
                        localStorage.setItem("userRole", "admin");
                        window.location.href = "/login";
                      }}
                    >
                      Admin Operations Console
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <div>
                © {new Date().getFullYear()} Bites Internet Private Limited. All
                rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </div>
      {/* Mobile bottom navigation — Blinkit-style */}
      <MobileBottomNav
        cartCount={cartCount}
        userEmail={userEmail}
        onCartClick={() => setCartOpen(true)}
      />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartList}
        updateQty={updateQty}
        clearCart={clearCart}
        addToCart={addToCart}
      />
    </BrowserRouter>
  );
};
