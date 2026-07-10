import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
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
import { ShimmerList } from "../components/Shimmer";
import api from "../../../shared/services/api";
import { DollarSign, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
}

// Landing Page Dashboard (Customers)
const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

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

  return (
    <div className="app-shell">
      {localStorage.getItem("accessToken") && activeOrders.length > 0 && (
        <div className="dashboard-grid section-spacing">
          <div className="panel-card accent-panel panel-card-stacked">
            <div className="card-banner">
              <Truck size={20} /> Active Deliveries ({activeOrders.length})
            </div>
            <div className="card-stack">
              {activeOrders.map((o) => (
                <div
                  key={o.id}
                  className="panel-card compact panel-card-stacked"
                >
                  <div className="panel-row">
                    <div>
                      <div className="card-heading">{o.restaurant_name}</div>
                      <div className="card-subtitle">
                        Status: {o.status.replace(/_/g, " ").toUpperCase()}
                      </div>
                    </div>
                    <Link
                      to={`/track/${o.id}`}
                      className="btn-premium btn-sm button-flex"
                    >
                      Track <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="header-panel-premium section-spacing">
        <div>
          <h1 className="section-heading section-heading-lg">
            Discover Restaurants
          </h1>
          <p className="panel-note">
            Browse nearby restaurants and manage your active orders and wallet
            from one unified dashboard.
          </p>
        </div>
      </div>

      {loading ? (
        <ShimmerList />
      ) : (
        <div className="panel-grid">
          {restaurants.map((r) => (
            <Link
              to={`/restaurant/${r.id}`}
              key={r.id}
              className="panel-card panel-card-stacked"
            >
              <div className="card-heading">{r.name}</div>
              <p className="card-subtitle">
                {r.description || "No description available"}
              </p>
              <div className="panel-row mt-16">
                <span className="text-small">
                  {r.average_delivery_time} mins
                </span>
                <span
                  className={`status-pill ${
                    r.status === "open" ? "success" : "danger"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
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
        <AdminNavbar adminName={localStorage.getItem("userName")} onLogout={handleLogout} />
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
      </BrowserRouter>
    );
  }

  if (userEmail && userRole === "restaurant_owner") {
    return (
      <BrowserRouter>
        <RestaurantNavbar restaurantName={localStorage.getItem("userName")} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<RestaurantDashboard />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (userEmail && userRole === "delivery_partner") {
    return (
      <BrowserRouter>
        <DeliveryNavbar driverName={localStorage.getItem("userName")} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<DeliveryDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Fallback / Customer Routes
  return (
    <BrowserRouter>
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
      <Routes>
        <Route path="/" element={<Home searchQuery={searchQuery} />} />
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
          element={userEmail ? <AddressManager /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
