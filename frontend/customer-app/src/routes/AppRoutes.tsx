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

interface HomeProps {
  searchQuery: string;
}

// Landing Page Dashboard
const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      // Fetch restaurants
      const response = await api.get(
        `/restaurants?search=${encodeURIComponent(searchQuery)}`,
      );
      if (response.data.status === "success") {
        setRestaurants(response.data.data);
      }

      // If user is authenticated, fetch orders and wallet balance
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

        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
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
        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        }
      }
    } catch (err) {
      toast.error("Failed to deposit funds.");
    }
  };

  return (
    <div className="app-shell">
      {/* Dashboard Section */}
      {localStorage.getItem("accessToken") && (
        <div className="dashboard-grid" style={{ marginBottom: "48px" }}>
          {/* Active Orders Box */}
          {activeOrders.length > 0 && (
            <div
              className="surface-card compact"
              style={{
                borderColor: "var(--accent-orange)",
                borderWidth: 2,
                borderStyle: "solid",
                background: "rgba(255, 90, 31, 0.08)",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--accent-orange)",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Truck size={20} /> Active Deliveries ({activeOrders.length})
                </h3>
                <div className="card-stack">
                  {activeOrders.map((o) => (
                    <div
                      key={o.id}
                      className="surface-card compact order-list-item"
                    >
                      <div>
                        <strong style={{ fontSize: "0.95rem" }}>
                          {o.restaurant_name}
                        </strong>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          Status: {o.status.replace(/_/g, " ").toUpperCase()}
                        </div>
                      </div>
                      <Link
                        to={`/track/${o.id}`}
                        className="btn-premium btn-sm"
                      >
                        Track <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Wallet Card */}
          {walletBalance !== null && (
            <div className="wallet-card">
              <div>
                <div className="wallet-card-label">WALLET BALANCE</div>
                <div className="wallet-card-value">
                  <DollarSign size={24} color="var(--accent-orange)" />
                  {walletBalance.toFixed(2)}
                </div>
              </div>
              <button
                onClick={handleDeposit}
                className="btn-premium wallet-card-button"
              >
                + Deposit Money
              </button>
            </div>
          )}
        </div>
      )}

      {/* Discover Feed */}
      <h1 className="section-heading section-heading-lg">
        Discover Restaurants
      </h1>

      {loading ? (
        <ShimmerList />
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <Link
              to={`/restaurant/${r.id}`}
              key={r.id}
              className="restaurant-card"
            >
              <h3 className="restaurant-card-title">{r.name}</h3>
              <p className="restaurant-card-description">
                {r.description || "No description available"}
              </p>
              <div className="restaurant-card-meta">
                <span className="restaurant-card-time">
                  {r.average_delivery_time} mins
                </span>
                <span
                  className={`restaurant-card-status restaurant-card-status--${
                    r.status === "open" ? "open" : "closed"
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
  const [cart, setCart] = useState<{
    [itemId: string]: { name: string; price: number; qty: number };
  }>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchCartFromBackend();
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
    setUserEmail(null);
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
          // Find item ID or delete directly
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

  return (
    <BrowserRouter>
      <Navbar
        cartCount={cartCount}
        userEmail={userEmail}
        onLogout={handleLogout}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
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
      />
    </BrowserRouter>
  );
};
