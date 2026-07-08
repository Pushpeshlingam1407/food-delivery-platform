import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Tag,
  Image,
  Store,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface MenuImage {
  id: string;
  menu_id: string;
  image_url: string;
  is_primary: boolean;
  menu_item_name: string;
  restaurant_name: string;
}

interface Restaurant {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

const PRESET_FOOD_IMAGES = [
  {
    name: "Burger Combo",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop",
  },
  {
    name: "Margerita Pizza",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop",
  },
  {
    name: "Garden Salad",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop",
  },
  {
    name: "Chocolate Fudge Cake",
    url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop",
  },
  {
    name: "Hot Cappuccino",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop",
  },
  {
    name: "French Fries",
    url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop",
  },
];

export const ImagesManagement: React.FC = () => {
  const [images, setImages] = useState<MenuImage[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchInitialData = async () => {
    try {
      const imgRes = await api.get("/admin/menu-images");
      const restRes = await api.get("/admin/restaurants");

      if (imgRes.data.status === "success") {
        setImages(imgRes.data.data);
      }
      if (restRes.data.status === "success") {
        setRestaurants(restRes.data.data);
      }
    } catch (err) {
      toast.error("Failed to load images or stores library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch menu items when selected restaurant changes
  useEffect(() => {
    if (!selectedRestaurantId) {
      setMenuItems([]);
      setSelectedMenuItemId("");
      return;
    }

    const fetchMenuItems = async () => {
      try {
        const res = await api.get(`/restaurants/${selectedRestaurantId}/items`);
        if (res.data.status === "success") {
          setMenuItems(res.data.data || []);
        }
      } catch (err) {
        toast.error("Failed to fetch menu items for this store.");
      }
    };

    fetchMenuItems();
  }, [selectedRestaurantId]);

  const handleAssociateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuItemId || !imageUrl) {
      toast.error("Menu item and Image URL are required");
      return;
    }

    try {
      const res = await api.post("/admin/menu-images", {
        menu_id: selectedMenuItemId,
        image_url: imageUrl,
        is_primary: isPrimary,
      });

      if (res.data.status === "success") {
        toast.success("Image successfully associated with menu item!");
        resetForm();
        fetchInitialData();
      }
    } catch (err) {
      toast.error("Failed to associate image.");
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to disassociate/delete this image?"))
      return;
    try {
      const res = await api.delete(`/admin/menu-images/${id}`);
      if (res.data.status === "success") {
        toast.success("Image deleted.");
        fetchInitialData();
      }
    } catch (err) {
      toast.error("Failed to delete menu image mapping.");
    }
  };

  const resetForm = () => {
    setSelectedRestaurantId("");
    setSelectedMenuItemId("");
    setImageUrl("");
    setIsPrimary(true);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading images database...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="panel-row" style={{ marginBottom: "24px" }}>
        <div>
          <h1
            className="section-heading section-heading-lg"
            style={{ margin: 0 }}
          >
            Menu Image Library
          </h1>
          <p className="text-muted">
            Associate food photography presets or custom graphic links to menu
            products.
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          className="btn-premium"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={18} /> {showAddForm ? "Cancel" : "Add Image"}
        </button>
      </div>

      {showAddForm && (
        <div
          className="panel-card section-spacing"
          style={{ maxWidth: "600px" }}
        >
          <div className="panel-heading">
            <Image size={18} color="var(--accent-violet)" /> Link Item Image
          </div>

          <form onSubmit={handleAssociateImage} className="form-grid">
            <div className="form-field">
              <label>Select Restaurant Store</label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                required
                className="input-premium"
              >
                <option value="">-- Choose Store --</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Select Menu Product</label>
              <select
                value={selectedMenuItemId}
                onChange={(e) => setSelectedMenuItemId(e.target.value)}
                required
                disabled={!selectedRestaurantId}
                className="input-premium"
              >
                <option value="">-- Choose Menu Item --</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (${item.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Image URL Link</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                placeholder="https://example.com/item.jpg"
                className="input-premium"
              />
            </div>

            <div className="form-field">
              <label>Preset Food Photography Library</label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "8px",
                }}
              >
                {PRESET_FOOD_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      toast.success(`Selected preset image: ${preset.name}`);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid var(--glass-border)",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              Set as primary image for this item
            </label>

            <button
              type="submit"
              className="btn-premium button-stretch"
              style={{ marginTop: "12px" }}
            >
              Save Image Association
            </button>
          </form>
        </div>
      )}

      <div className="panel-grid">
        {images.map((img) => (
          <div
            key={img.id}
            className="panel-card panel-card-stacked"
            style={{ height: "auto" }}
          >
            <div>
              <div
                style={{
                  width: "100%",
                  height: "130px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={img.image_url}
                  alt={img.menu_item_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="panel-row">
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                  {img.menu_item_name}
                </h3>
                {img.is_primary && (
                  <span
                    className="status-pill success"
                    style={{ padding: "2px 8px", fontSize: "0.65rem" }}
                  >
                    Primary
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "6px",
                }}
              >
                <div>
                  Store: <strong>{img.restaurant_name}</strong>
                </div>
              </div>
            </div>

            <div
              className="panel-row"
              style={{
                marginTop: "16px",
                borderTop: "1px solid var(--glass-border)",
                paddingTop: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <LinkIcon size={12} /> URL Associated
              </span>
              <button
                onClick={() => handleDeleteImage(img.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#F44336",
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">
              No associated product menu images cataloged.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
