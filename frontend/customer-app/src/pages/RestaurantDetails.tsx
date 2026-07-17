import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { MenuCard } from "../../../shared/components/MenuCard";
import { useAppContext } from "../../../shared/context/AppContext";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  category_id: string;
  is_available?: boolean | number;
  available_quantity?: number;
  unlimited?: boolean | number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  average_delivery_time: number;
  status: string;
  banner_image_url?: string;
  logo_url?: string;
}

export const RestaurantDetails: React.FC = () => {
  const {
    addToCart,
    removeFromCart,
    cartItemsCountMap: cartItems,
  } = useAppContext();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFavorite, setIsFavorite] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const [res, catRes, menuRes, favsRes, ratingsRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/categories`),
          api.get(`/restaurants/${id}/items`),
          api.get("/favorites").catch(() => ({ data: { status: "error" } })),
          api
            .get(`/ratings/restaurant/${id}`)
            .catch(() => ({ data: { status: "error" } })),
        ]);

        if (res.data.status === "success") {
          setRestaurant(res.data.data);
        }

        if (catRes.data.status === "success") {
          setCategories(catRes.data.data || []);
        }

        if (menuRes.data.status === "success") {
          setMenuItems(menuRes.data.data);
        }

        if (favsRes.data.status === "success") {
          const isFav = favsRes.data.data.some(
            (f: any) => f.restaurant_id === id,
          );
          setIsFavorite(isFav);
        }

        if (ratingsRes.data.status === "success" && ratingsRes.data.data) {
          setReviews(ratingsRes.data.data.reviews || []);
          setAvgRating(ratingsRes.data.data.average_rating || 0);
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
        notify.info("Removed from favorites.");
      } else {
        await api.post("/favorites/add", { restaurant_id: id });
        setIsFavorite(true);
        notify.success("Saved to your favorites!");
      }
    } catch (err) {
      notify.warning("Please sign in to save your favorite spots.");
    }
  };

  if (!restaurant) {
    return (
      <div className="page-container" style={{ textAlign: "center" }}>
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
    <div className="page-container restaurant-details-page">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="back-button"
      >
        <ArrowLeft size={16} /> Back to restaurants
      </button>

      {/* Header card (Apple-style frosted glass) */}
      <div className="header-panel-premium restaurant-header-card">
        <div>
          <h1>{restaurant.name}</h1>
          <p className="restaurant-description">{restaurant.description}</p>
          <div className="restaurant-stats">
            <span>⏱️ {restaurant.average_delivery_time} mins</span>
            <span>
              ⭐ {avgRating > 0 ? `${avgRating} / 5` : "No ratings yet"}
            </span>
            <span
              className={
                restaurant.status === "open"
                  ? "restaurant-status--open"
                  : "restaurant-status--closed"
              }
            >
              ● {restaurant.status === "open" ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFavorite}
          className="favorite-button"
        >
          <Heart
            size={20}
            fill={isFavorite ? "var(--accent-orange)" : "none"}
            color={isFavorite ? "var(--accent-orange)" : "var(--text-slate)"}
          />
        </button>
      </div>

      <div className="restaurant-content-grid">
        <aside className="restaurant-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            <button
              type="button"
              className={`category-button ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Items
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`category-button ${selectedCategory === c.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="veg-filter">
            <input
              type="checkbox"
              id="veg-switch"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
            />
            <label htmlFor="veg-switch">Veg Only 🌱</label>
          </div>
        </aside>

        <section className="restaurant-menu-column">
          <h2>Menu</h2>
          <div className="menu-list">
            {filteredMenuItems.map((item) => {
              const qty = cartItems[item.id] || 0;
              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  qty={qty}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                />
              );
            })}

            {filteredMenuItems.length === 0 && (
              <div className="empty-state-card">
                No dishes found matching selection.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="restaurant-review-block">
        <h3>Customer Reviews ({reviews.length})</h3>

        <div className="review-list">
          {reviews.map((r, index) => (
            <div key={index} className="review-item">
              <div className="review-meta">
                <strong>
                  {r.first_name} {r.last_name ? r.last_name[0] + "." : ""}
                </strong>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="review-tags">
                {r.restaurant_rating && (
                  <span className="review-tag review-tag--orange">
                    Food: ★ {r.restaurant_rating}
                  </span>
                )}
                {r.delivery_rating && (
                  <span className="review-tag review-tag--violet">
                    Delivery: ★ {r.delivery_rating}
                  </span>
                )}
              </div>
              {r.restaurant_review && (
                <p className="review-text">"{r.restaurant_review}"</p>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="empty-state-text">
              No reviews for this restaurant yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
