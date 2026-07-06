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
import { ShimmerList } from "../components/Shimmer";
import api from "../../../shared/services/api";

interface HomeProps {
  searchQuery: string;
}

// Landing Page Dashboard
const Home: React.FC<HomeProps> = ({ searchQuery }) => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/restaurants?search=${encodeURIComponent(searchQuery)}`,
        );
        if (response.data.status === "success") {
          setRestaurants(response.data.data);
        }
      } catch (err) {
        console.error("Fetch restaurants error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [searchQuery]);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
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
