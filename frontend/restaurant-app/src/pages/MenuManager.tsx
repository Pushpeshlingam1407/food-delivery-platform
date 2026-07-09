import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Globe, FileImage } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

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
        toast.success("Category added successfully!");
      }
    } catch (err) {
      toast.error("Failed to create category.");
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategoryId || !restaurantId) {
      toast.error("All fields are required.");
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
          toast.success("Dish updated successfully!");
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
          toast.success("Menu item added successfully!");
          resetForm();
          fetchMenuAndCategories();
        }
      }
    } catch (err) {
      toast.error("Failed to save menu item.");
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
        toast.success("Availability status updated.");
      }
    } catch (err) {
      toast.error("Failed to toggle availability.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      const response = await api.delete(`/restaurants/items/${itemId}`);
      if (response.data.status === "success") {
        setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Dish removed from catalog.");
      }
    } catch (err) {
      toast.error("Failed to delete menu item.");
    }
  };

  return (
    <div
      className="app-shell menu-manager-page"
      style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px" }}>
        Menu Catalog Manager
      </h1>

      <div className="responsive-split menu-manager-layout">
        {/* Dishes list */}
        <div className="menu-manager-list">
          <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>
            Dishes List
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {menuItems.map((item) => {
              const cat = categories.find((c) => c.id === item.category_id);
              return (
                <div key={item.id} className="menu-manager-item">
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid var(--glass-border)",
                        }}
                      />
                    )}
                    <div className="menu-manager-item-meta">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
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
                            margin: 0,
                          }}
                        >
                          {item.name}
                        </h4>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          ({cat?.name || "Unassigned"})
                        </span>
                      </div>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {item.description || "No description provided."}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "1.1rem",
                            color: "var(--text-slate)",
                          }}
                        >
                          ${parseFloat(item.price.toString()).toFixed(2)}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            background: "rgba(0,0,0,0.05)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Stock:{" "}
                          {item.unlimited
                            ? "Unlimited"
                            : item.available_quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="menu-manager-item-actions">
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
                        checked={item.is_available}
                        onChange={() =>
                          toggleItemAvailability(item.id, item.is_available)
                        }
                        style={{ width: "16px", height: "16px" }}
                      />
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        Available
                      </span>
                    </label>

                    <button
                      onClick={() => startEdit(item)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-slate)",
                      }}
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#F44336",
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}

            {menuItems.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                No dishes found in menu catalog. Add dishes on the right to
                start.
              </div>
            )}
          </div>
        </div>

        {/* Creation panels */}
        <div
          className="menu-manager-sidebar"
          style={{ display: "flex", flexDirection: "column", gap: "32px" }}
        >
          {/* Category CRUD Form */}
          <div
            className="menu-manager-form-panel"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-squircle)",
              padding: "24px",
              boxShadow: "var(--glass-shadow)",
              backdropFilter: "var(--glass-blur)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-cohere)",
                fontSize: "1.1rem",
                marginBottom: "16px",
                margin: 0,
              }}
            >
              Add Category
            </h3>
            <form
              onSubmit={handleAddCategory}
              className="menu-manager-inline-form"
              style={{ display: "flex", gap: "8px", marginTop: "12px" }}
            >
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Starters"
                required
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  flexGrow: 1,
                  fontFamily: "var(--font-apple)",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="submit"
                className="btn-premium"
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                <Plus size={16} />
              </button>
            </form>
          </div>

          {/* Dish CRUD Form */}
          <div
            className="menu-manager-form-panel"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-squircle)",
              padding: "24px",
              boxShadow: "var(--glass-shadow)",
              backdropFilter: "var(--glass-blur)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-cohere)",
                fontSize: "1.1rem",
                marginBottom: "16px",
                margin: 0,
              }}
            >
              {editingId ? "Edit Dish Properties" : "Add New Dish"}
            </h3>
            <form
              onSubmit={handleSaveMenuItem}
              className="menu-manager-inline-form"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginTop: "12px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Dish Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Butter Chicken"
                  required
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Rich and creamy tomato base..."
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                    minHeight: "60px",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="12.99"
                  required
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Image URL Link
                  </label>
                  {newItemImageUrl.startsWith("http") ? (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent-orange)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Globe size={12} /> Remote URL
                    </span>
                  ) : newItemImageUrl ? (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent-violet)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FileImage size={12} /> Local File
                    </span>
                  ) : null}
                </div>
                <input
                  type="text"
                  value={newItemImageUrl}
                  onChange={(e) => setNewItemImageUrl(e.target.value)}
                  placeholder="https://example.com/dish.jpg"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                  }}
                />
                <input
                  type="file"
                  accept="image/*, image/webp, image/png, image/jpeg, image/jpg, image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        try {
                          const base64Data = reader.result as string;
                          const res = await api.post("/upload", {
                            image: base64Data,
                          });
                          if (res.data.status === "success") {
                            setNewItemImageUrl(res.data.url);
                            toast.success("Image uploaded successfully!");
                          }
                        } catch (err) {
                          toast.error("Failed to upload image.");
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ marginTop: "4px", fontSize: "0.8rem" }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Category
                </label>
                <select
                  value={newItemCategoryId}
                  onChange={(e) => setNewItemCategoryId(e.target.value)}
                  required
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                    background: "#FFF",
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Inventory Stock Level
                </label>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    disabled={newItemUnlimited}
                    placeholder="50"
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--glass-border)",
                      width: "80px",
                    }}
                  />
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newItemUnlimited}
                      onChange={(e) => setNewItemUnlimited(e.target.checked)}
                    />
                    Unlimited
                  </label>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <input
                  type="checkbox"
                  id="new-item-veg"
                  checked={newItemIsVeg}
                  onChange={(e) => setNewItemIsVeg(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label
                  htmlFor="new-item-veg"
                  style={{ fontWeight: 600, fontSize: "0.85rem" }}
                >
                  Is Vegetarian 🌱
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn-premium"
                  style={{ flex: 1, padding: "12px" }}
                >
                  {editingId ? "Update Dish" : "Create Dish"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-premium"
                    style={{
                      background: "var(--text-slate)",
                      flex: 1,
                      padding: "12px",
                    }}
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
  );
};
