import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Globe, FileImage } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { MenuCard } from "../../../shared/components/MenuCard";

import { PremiumPageHeader } from "../components/ui/PremiumPageHeader";
import "../restaurant-premium.css";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  category_id: string;
  available_quantity: number | null;
  unlimited: boolean;
  image_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

export const MenuManager: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // New Category States
  const [newCatName, setNewCatName] = useState("");

  // Menu Item States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [newItemStock, setNewItemStock] = useState("50");
  const [newItemUnlimited, setNewItemUnlimited] = useState(true);

  const fetchMenuAndCategories = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const myRestaurant = meRes.data.data?.restaurant;

      if (myRestaurant) {
        setRestaurantId(myRestaurant.id);

        const catRes = await api.get(
          `/restaurants/${myRestaurant.id}/categories`,
        );
        if (catRes.data.status === "success") {
          setCategories(catRes.data.data || []);
        }

        const menuRes = await api.get(`/restaurants/${myRestaurant.id}/items`);
        if (menuRes.data.status === "success") {
          setMenuItems(menuRes.data.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch menu list failed:", err);
    }
  };

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !restaurantId) return;

    try {
      const response = await api.post("/restaurants/categories", {
        restaurant_id: restaurantId,
        name: newCatName,
      });

      if (response.data.status === "success") {
        const newCat = response.data.data;
        setCategories((prev) => [...prev, newCat]);
        setNewCatName("");
        notify.success("New category created.");
      }
    } catch (err) {
      notify.error("We couldn't create this category.");
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategoryId || !restaurantId) {
      notify.warning("Please fill out all fields.");
      return;
    }

    try {
      if (editingId) {
        // Edit Mode
        const response = await api.put(`/restaurants/items/${editingId}`, {
          name: newItemName,
          description: newItemDesc,
          price: parseFloat(newItemPrice),
          category_id: newItemCategoryId,
          is_veg: newItemIsVeg,
          image_url: newItemImageUrl,
        });

        // Update inventory
        await api.put(`/restaurants/items/${editingId}/inventory`, {
          available_quantity: parseInt(newItemStock, 10) || 0,
          unlimited: newItemUnlimited,
        });

        if (response.data.status === "success") {
          notify.success("Dish updated.");
          resetForm();
          fetchMenuAndCategories();
        }
      } else {
        // Add Mode
        const response = await api.post("/restaurants/items", {
          restaurant_id: restaurantId,
          category_id: newItemCategoryId,
          name: newItemName,
          description: newItemDesc,
          price: parseFloat(newItemPrice),
          is_veg: newItemIsVeg,
          image_url: newItemImageUrl,
          available_quantity: parseInt(newItemStock, 10) || 0,
          unlimited: newItemUnlimited,
        });

        if (response.data.status === "success") {
          notify.success("New dish added.");
          resetForm();
          fetchMenuAndCategories();
        }
      }
    } catch (err) {
      notify.error("We couldn't save this dish.");
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setNewItemName(item.name);
    setNewItemDesc(item.description || "");
    setNewItemPrice(item.price.toString());
    setNewItemCategoryId(item.category_id);
    setNewItemIsVeg(item.is_veg);
    setNewItemImageUrl(item.image_url || "");
    setNewItemStock((item.available_quantity ?? 0).toString());
    setNewItemUnlimited(item.unlimited);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice("");
    setNewItemCategoryId("");
    setNewItemIsVeg(true);
    setNewItemImageUrl("");
    setNewItemStock("50");
    setNewItemUnlimited(true);
  };

  const toggleItemAvailability = async (
    itemId: string,
    currentVal: boolean,
  ) => {
    try {
      const response = await api.put(`/restaurants/items/${itemId}`, {
        is_available: !currentVal,
      });
      if (response.data.status === "success") {
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, is_available: !currentVal } : item,
          ),
        );
        notify.info("Availability updated.");
      }
    } catch (err) {
      notify.error("We couldn't update the availability.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      const response = await api.delete(`/restaurants/items/${itemId}`);
      if (response.data.status === "success") {
        setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
        notify.info("Dish removed.");
      }
    } catch (err) {
      notify.error("We couldn't remove this dish.");
    }
  };

  return (
    <div className="restaurant-premium-layout" style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <PremiumPageHeader
          title="Menu Catalog Manager"
          subtitle="Organize restaurant offering categories, add custom items, upload photos, and update availability."
        />

        <div className="menu-manager-grid premium-animate-in">
          {/* Dishes list */}
          <div>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                marginBottom: "24px",
                color: "var(--cred-text-primary)",
              }}
            >
              Dishes Catalog
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {menuItems.map((item) => {
                const cardItem = {
                  ...item,
                  description: item.description || undefined,
                  image_url: item.image_url || undefined,
                  available_quantity: item.available_quantity ?? undefined,
                  unlimited: item.unlimited,
                };

                return (
                  <MenuCard
                    key={item.id}
                    item={cardItem}
                    renderFooterActions={() => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          marginTop: "12px",
                          borderTop: "1px solid var(--cred-border)",
                          paddingTop: "12px",
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!item.is_available}
                            onChange={() =>
                              toggleItemAvailability(
                                item.id,
                                !!item.is_available,
                              )
                            }
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "var(--cred-success)",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "var(--cred-text-secondary)",
                            }}
                          >
                            Available
                          </span>
                        </label>

                        <button
                          onClick={() => startEdit(item)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--cred-text-secondary)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--cred-accent)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  />
                );
              })}

              {menuItems.length === 0 && (
                <div
                  style={{
                    padding: "60px 40px",
                    textAlign: "center",
                    color: "var(--cred-text-secondary)",
                    background: "var(--cred-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--cred-border)",
                  }}
                >
                  No dishes found in menu catalog. Use the right form panels to
                  start building.
                </div>
              )}
            </div>
          </div>

          {/* Creation panels */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            {/* Category CRUD Form */}
            <div
              className="cred-stat-card"
              style={{ minHeight: "auto", padding: "28px" }}
            >
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--cred-text-primary)",
                  marginBottom: "16px",
                }}
              >
                Add New Category
              </h3>
              <form
                onSubmit={handleAddCategory}
                style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}
              >
                <div className="premium-form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Starters"
                    required
                    className="premium-form-input"
                  />
                </div>
                <button
                  type="submit"
                  className="neo-btn neo-btn-primary"
                  style={{ padding: "12px 20px", height: "46px" }}
                >
                  <Plus size={20} />
                </button>
              </form>
            </div>

            {/* Dish CRUD Form */}
            <div
              className="cred-stat-card"
              style={{ minHeight: "auto", padding: "28px" }}
            >
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "var(--cred-text-primary)",
                  marginBottom: "20px",
                }}
              >
                {editingId ? "Edit Dish Properties" : "Add New Dish"}
              </h3>

              <form
                onSubmit={handleSaveMenuItem}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div className="premium-form-group">
                  <label>Select Category *</label>
                  <select
                    value={newItemCategoryId}
                    onChange={(e) => setNewItemCategoryId(e.target.value)}
                    required
                    className="premium-form-input"
                  >
                    <option value="" disabled hidden>
                      Choose a category
                    </option>
                    {categories.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        style={{ color: "black" }}
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="premium-form-group">
                  <label>Dish Name *</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Margherita Pizza"
                    required
                    className="premium-form-input"
                  />
                </div>

                <div className="premium-form-group">
                  <label>Description</label>
                  <textarea
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Describe the dish flavors, ingredients..."
                    className="premium-form-input"
                    style={{ height: "80px", resize: "none" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="premium-form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="199"
                      step="0.01"
                      min="0.01"
                      required
                      className="premium-form-input"
                    />
                  </div>

                  <div className="premium-form-group">
                    <label>Food Type</label>
                    <select
                      value={newItemIsVeg ? "true" : "false"}
                      onChange={(e) =>
                        setNewItemIsVeg(e.target.value === "true")
                      }
                      className="premium-form-input"
                    >
                      <option value="true">Vegetarian</option>
                      <option value="false">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="premium-form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={newItemImageUrl}
                    onChange={(e) => setNewItemImageUrl(e.target.value)}
                    placeholder="https://example.com/dish.jpg"
                    className="premium-form-input"
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "16px", alignItems: "center" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newItemUnlimited}
                      onChange={(e) => setNewItemUnlimited(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "var(--cred-success)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--cred-text-secondary)",
                      }}
                    >
                      Unlimited stock
                    </span>
                  </label>

                  {!newItemUnlimited && (
                    <div className="premium-form-group" style={{ flexGrow: 1 }}>
                      <input
                        type="number"
                        value={newItemStock}
                        onChange={(e) => setNewItemStock(e.target.value)}
                        placeholder="50"
                        className="premium-form-input"
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "12px", marginTop: "10px" }}
                >
                  <button
                    type="submit"
                    className="neo-btn neo-btn-primary"
                    style={{ flex: 2 }}
                  >
                    {editingId ? "Save Changes" : "Add to Catalog"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="neo-btn neo-btn-outline"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
