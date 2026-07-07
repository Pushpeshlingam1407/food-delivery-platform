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
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Dashboard Section */}
      {localStorage.getItem("accessToken") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              activeOrders.length > 0
                ? "repeat(auto-fit, minmax(280px, 1fr))"
                : "1fr",
            gap: "32px",
            marginBottom: "48px",
          }}
        >
          {/* Active Orders Box */}
          {activeOrders.length > 0 && (
            <div
              style={{
                background: "rgba(255, 90, 31, 0.04)",
                border: "2px solid var(--accent-orange)",
                borderRadius: "var(--radius-squircle)",
                padding: "24px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {activeOrders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: "#FFF",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                      }}
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
                        className="btn-premium"
                        style={{
                          padding: "6px 16px",
                          fontSize: "0.8rem",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
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
            <div
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-squircle)",
                padding: "24px 32px",
                boxShadow: "var(--glass-shadow)",
                backdropFilter: "var(--glass-blur)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  WALLET BALANCE
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <DollarSign size={24} color="var(--accent-orange)" />
                  {walletBalance.toFixed(2)}
                </div>
              </div>
              <button
                onClick={handleDeposit}
                className="btn-premium"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.85rem",
                  marginTop: "16px",
                }}
              >
                + Deposit Money
              </button>
            </div>
          )}
        </div>
      )}

      {/* Discover Feed */}
      <h1
        style={{
          fontFamily: "var(--font-anthropic)",
          fontSize: "2.5rem",
          marginBottom: "24px",
        }}
      >
        Discover Restaurants
      </h1>

      {loading ? (
        <ShimmerList />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {restaurants.map((r) => (
            <Link
              to={`/restaurant/${r.id}`}
              key={r.id}
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-squircle)",
                padding: "24px",
                boxShadow: "var(--glass-shadow)",
                backdropFilter: "var(--glass-blur)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "between",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <h3
                style={{
                  fontFamily: "var(--font-cohere)",
                  fontSize: "1.2rem",
                  marginBottom: "8px",
                }}
              >
                {r.name}
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  marginBottom: "20px",
                  flexGrow: 1,
                }}
              >
                {r.description || "No description available"}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {r.average_delivery_time} mins
                </span>
                <span
                  style={{
                    background:
                      r.status === "open"
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(244, 67, 54, 0.1)",
                    color: r.status === "open" ? "#4CAF50" : "#F44336",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
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
