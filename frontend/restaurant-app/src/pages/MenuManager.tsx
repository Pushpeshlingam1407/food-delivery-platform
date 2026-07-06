import React, { useEffect, useState } from "react";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
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

  // New MenuItem States
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategoryId, setNewItemCategoryId] = useState("");
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);

  useEffect(() => {
    const fetchMenuAndCategories = async () => {
      try {
        const meRes = await api.get("/auth/me");
        const myRestaurant = meRes.data.data?.restaurant;

        if (myRestaurant) {
          setRestaurantId(myRestaurant.id);

          const catRes = await api.get(`/restaurants/${myRestaurant.id}`);
          if (catRes.data.status === "success") {
            setCategories(catRes.data.data.categories || []);
          }

          const menuRes = await api.get(`/menus/restaurant/${myRestaurant.id}`);
          if (menuRes.data.status === "success") {
            setMenuItems(menuRes.data.data);
          }
        }
      } catch (err) {
        console.error("Fetch menu list failed:", err);
      }
    };

    fetchMenuAndCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !restaurantId) return;

    try {
      const response = await api.post("/menus/categories", {
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

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategoryId || !restaurantId) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await api.post("/menus", {
        restaurant_id: restaurantId,
        category_id: newItemCategoryId,
        name: newItemName,
        description: newItemDesc,
        price: parseFloat(newItemPrice),
        is_veg: newItemIsVeg,
      });

      if (response.data.status === "success") {
        const newItem = response.data.data;
        setMenuItems((prev) => [...prev, newItem]);

        // Reset states
        setNewItemName("");
        setNewItemDesc("");
        setNewItemPrice("");
        setNewItemCategoryId("");
        toast.success("Menu item added successfully!");
      }
    } catch (err) {
      toast.error("Failed to create menu item.");
    }
  };

  const toggleItemAvailability = async (
    itemId: string,
    currentVal: boolean,
  ) => {
    try {
      const response = await api.put(`/menus/${itemId}`, {
        is_available: !currentVal,
      });
      if (response.data.status === "success") {
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, is_available: !currentVal } : item,
          ),
        );
        toast.success("Disponibility status updated.");
      }
    } catch (err) {
      toast.error("Failed to toggle availability.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await api.delete(`/menus/${itemId}`);
      if (response.data.status === "success") {
        setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Dish removed from catalog.");
      }
    } catch (err) {
      toast.error("Failed to delete menu item.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px" }}>
        Menu Catalog Manager
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "40px",
        }}
      >
        {/* Dishes list */}
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>
            Dishes List
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {menuItems.map((item) => {
              const cat = categories.find((c) => c.id === item.category_id);
              return (
                <div
                  key={item.id}
                  style={{
                    background: "#FFF",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-standard)",
                    padding: "24px",
                    boxShadow: "var(--glass-shadow)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
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

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "24px",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Category CRUD Form */}
          <div
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
              }}
            >
              Add Category
            </h3>
            <form
              onSubmit={handleAddCategory}
              style={{ display: "flex", gap: "8px" }}
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
              }}
            >
              Add New Dish
            </h3>
            <form
              onSubmit={handleAddMenuItem}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
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

              <button
                type="submit"
                className="btn-premium"
                style={{ width: "100%", padding: "12px" }}
              >
                Create Dish
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
