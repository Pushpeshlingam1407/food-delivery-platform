import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Plus, Minus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  category_id: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  average_delivery_time: number;
  status: string;
}

interface RestaurantDetailsProps {
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  cartItems: { [itemId: string]: number };
}

export const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({
  addToCart,
  removeFromCart,
  cartItems,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFavorite, setIsFavorite] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const res = await api.get(`/restaurants/${id}`);
        if (res.data.status === "success") {
          setRestaurant(res.data.data);
          setCategories(res.data.data.categories || []);
        }

        const menuRes = await api.get(`/menus/restaurant/${id}`);
        if (menuRes.data.status === "success") {
          setMenuItems(menuRes.data.data);
        }

        const favsRes = await api.get("/favorites");
        if (favsRes.data.status === "success") {
          const isFav = favsRes.data.data.some(
            (f: any) => f.restaurant_id === id,
          );
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error("Fetch restaurant details error:", err);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.post("/favorites/remove", { restaurant_id: id });
        setIsFavorite(false);
        toast.success("Removed from favorites.");
      } else {
        await api.post("/favorites/add", { restaurant_id: id });
        setIsFavorite(true);
        toast.success("Added to favorites!");
      }
    } catch (err) {
      toast.error("Log in to save favorites.");
    }
  };

  if (!restaurant) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          fontFamily: "var(--font-cohere)",
        }}
      >
        Loading restaurant details...
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category_id === selectedCategory;
    const matchesVeg = !vegOnly || item.is_veg;
    return matchesCategory && matchesVeg;
  });

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          color: "var(--text-slate)",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "24px",
          fontFamily: "var(--font-cohere)",
        }}
      >
        <ArrowLeft size={16} /> Back to restaurants
      </button>

      {/* Header card (Apple-style frosted glass) */}
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "40px",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
            {restaurant.name}
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: "16px",
              fontSize: "1.1rem",
            }}
          >
            {restaurant.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: "24px",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            <span>⏱️ {restaurant.average_delivery_time} mins</span>
            <span
              style={{
                color: restaurant.status === "open" ? "#4CAF50" : "#F44336",
              }}
            >
              ● {restaurant.status === "open" ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>

        <button
          onClick={toggleFavorite}
          style={{
            background: "rgba(25, 25, 25, 0.04)",
            border: "1px solid var(--glass-border)",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <Heart
            size={20}
            fill={isFavorite ? "var(--accent-orange)" : "none"}
            color={isFavorite ? "var(--accent-orange)" : "var(--text-slate)"}
          />
        </button>
      </div>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* Sidebar categories */}
        <div style={{ width: "240px", shrink: 0 }}>
          <h3
            style={{
              fontFamily: "var(--font-cohere)",
              fontSize: "1.2rem",
              marginBottom: "16px",
            }}
          >
            Categories
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => setSelectedCategory("all")}
              style={{
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: "var(--radius-standard)",
                border: "none",
                background:
                  selectedCategory === "all"
                    ? "rgba(25, 25, 25, 0.08)"
                    : "transparent",
                fontWeight: selectedCategory === "all" ? 700 : 500,
                cursor: "pointer",
                fontFamily: "var(--font-apple)",
              }}
            >
              All Items
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-standard)",
                  border: "none",
                  background:
                    selectedCategory === c.id
                      ? "rgba(25, 25, 25, 0.08)"
                      : "transparent",
                  fontWeight: selectedCategory === c.id ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-apple)",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Veg Switch */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <input
              type="checkbox"
              id="veg-switch"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="veg-switch"
              style={{
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              Veg Only 🌱
            </label>
          </div>
        </div>

        {/* Menu list */}
        <div style={{ flexGrow: 1 }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>Menu</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {filteredMenuItems.map((item) => {
              const qty = cartItems[item.id] || 0;
              return (
                <div
                  key={item.id}
                  style={{
                    background: "#FFF",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-standard)",
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "var(--glass-shadow)",
                  }}
                >
                  <div style={{ flexGrow: 1, paddingRight: "20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          border: `1px solid ${item.is_veg ? "#4CAF50" : "#F44336"}`,
                          padding: "2px 6px",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: item.is_veg ? "#4CAF50" : "#F44336",
                        }}
                      >
                        {item.is_veg ? "VEG 🌱" : "NON-VEG 🍖"}
                      </span>
                      <h4
                        style={{
                          fontFamily: "var(--font-cohere)",
                          fontSize: "1.15rem",
                        }}
                      >
                        {item.name}
                      </h4>
                    </div>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "12px",
                      }}
                    >
                      {item.description}
                    </p>
                    <strong
                      style={{ fontSize: "1.1rem", color: "var(--text-slate)" }}
                    >
                      ${parseFloat(item.price.toString()).toFixed(2)}
                    </strong>
                  </div>

                  <div style={{ shrink: 0 }}>
                    {qty > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "100px",
                          padding: "6px 16px",
                          background: "rgba(25, 25, 25, 0.02)",
                        }}
                      >
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          background: "var(--text-slate)",
                          color: "var(--text-sand)",
                          border: "none",
                          borderRadius: "100px",
                          padding: "8px 24px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMenuItems.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                No dishes found matching selection.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
