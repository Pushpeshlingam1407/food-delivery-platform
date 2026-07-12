import React, { useEffect, useState } from "react";
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Tag,
  Clock,
  Globe,
  FileImage,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  owner_email?: string;
  banner_image_url: string;
  logo_url: string;
  commission_rate: number;
  average_delivery_time: number;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  is_verified: boolean;
  status: "open" | "closed" | "busy";
}

const PRESET_IMAGES = [
  {
    name: "Fast Food Store",
    url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop",
  },
  {
    name: "Pizza Kitchen",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop",
  },
  {
    name: "Desserts & Bakery",
    url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop",
  },
  {
    name: "Healthy Salads",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop",
  },
  {
    name: "Coffee Shop",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop",
  },
];

export const RestaurantsManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [commissionRate, setCommissionRate] = useState("10.00");
  const [deliveryTime, setDeliveryTime] = useState("30");
  const [openingTime, setOpeningTime] = useState("08:00:00");
  const [closingTime, setClosingTime] = useState("22:00:00");
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [status, setStatus] = useState<"open" | "closed" | "busy">("closed");

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/admin/restaurants");
      if (res.data.status === "success") {
        setRestaurants(res.data.data);
      }
    } catch (err) {
      notify.error("Couldn't load stores data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerId) {
      notify.warning("Please provide a name and owner ID.");
      return;
    }

    try {
      const res = await api.post("/admin/restaurants", {
        name,
        description,
        owner_id: ownerId,
        banner_image_url: bannerUrl,
        logo_url: logoUrl,
        commission_rate: parseFloat(commissionRate),
        average_delivery_time: parseInt(deliveryTime, 10),
        opening_time: openingTime,
        closing_time: closingTime,
      });

      if (res.data.status === "success") {
        notify.success("Store created successfully.");
        resetForm();
        fetchRestaurants();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "Couldn't create this store.",
      );
    }
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const res = await api.put(`/admin/restaurants/${editingId}`, {
        name,
        description,
        banner_image_url: bannerUrl,
        logo_url: logoUrl,
        commission_rate: parseFloat(commissionRate),
        average_delivery_time: parseInt(deliveryTime, 10),
        opening_time: openingTime,
        closing_time: closingTime,
        is_active: isActive,
        is_verified: isVerified,
        status,
      });

      if (res.data.status === "success") {
        notify.success("Store details updated.");
        resetForm();
        fetchRestaurants();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "Couldn't update this store.",
      );
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate/delete this store?"))
      return;
    try {
      const res = await api.delete(`/admin/restaurants/${id}`);
      if (res.data.status === "success") {
        notify.info("Store deactivated.");
        fetchRestaurants();
      }
    } catch (err) {
      notify.error("Couldn't deactivate this store.");
    }
  };

  const startEdit = (store: Restaurant) => {
    setEditingId(store.id);
    setName(store.name);
    setDescription(store.description || "");
    setOwnerId(store.owner_id);
    setBannerUrl(store.banner_image_url || "");
    setLogoUrl(store.logo_url || "");
    setCommissionRate(store.commission_rate.toString());
    setDeliveryTime(store.average_delivery_time.toString());
    setOpeningTime(store.opening_time);
    setClosingTime(store.closing_time);
    setIsActive(store.is_active);
    setIsVerified(store.is_verified);
    setStatus(store.status);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setOwnerId("");
    setBannerUrl("");
    setLogoUrl("");
    setCommissionRate("10.00");
    setDeliveryTime("30");
    setOpeningTime("08:00:00");
    setClosingTime("22:00:00");
    setIsActive(true);
    setIsVerified(true);
    setStatus("closed");
    setShowAddForm(false);
  };

  const toggleVerify = async (store: Restaurant) => {
    try {
      const res = await api.put(`/admin/restaurants/${store.id}/verify`, {
        is_verified: !store.is_verified,
      });
      if (res.data.status === "success") {
        notify.success("Verification status changed.");
        fetchRestaurants();
      }
    } catch (err) {
      notify.error("Couldn't change verification status.");
    }
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading stores data...</p>
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
            Stores Management
          </h1>
          <p className="text-muted">
            Create, edit, verify, and suspend merchants on the platform.
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
          <Plus size={18} /> {showAddForm ? "Cancel" : "Add Store"}
        </button>
      </div>

      {showAddForm && (
        <div
          className="panel-card section-spacing"
          style={{ maxWidth: "700px" }}
        >
          <div className="panel-heading">
            <Store size={18} color="var(--accent-violet)" />
            {editingId
              ? "Edit Merchant Details"
              : "Register New Merchant Store"}
          </div>

          <form
            onSubmit={
              editingId ? handleUpdateRestaurant : handleCreateRestaurant
            }
            className="form-grid"
          >
            <div className="form-field">
              <label>Store Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Pizza Palace"
                className="input-premium"
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief description..."
                className="input-premium"
                rows={3}
              />
            </div>

            {!editingId && (
              <div className="form-field">
                <label>Merchant Owner User ID *</label>
                <input
                  type="text"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  required
                  placeholder="Paste owner's user ID"
                  className="input-premium"
                />
              </div>
            )}

            <div
              className="form-grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}
            >
              <div className="form-field">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label>Logo Image URL</label>
                  {logoUrl.startsWith("http") ? (
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
                  ) : logoUrl ? (
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
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="input-premium"
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
                            setLogoUrl(res.data.url);
                            notify.success("Logo uploaded!");
                          }
                        } catch (err) {
                          notify.error("Couldn't upload logo.");
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ marginTop: "6px", fontSize: "0.8rem" }}
                />
              </div>

              <div className="form-field">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label>Banner Image URL</label>
                  {bannerUrl.startsWith("http") ? (
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
                  ) : bannerUrl ? (
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
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  className="input-premium"
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
                            setBannerUrl(res.data.url);
                            notify.success("Banner uploaded!");
                          }
                        } catch (err) {
                          notify.error("Couldn't upload banner.");
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ marginTop: "6px", fontSize: "0.8rem" }}
                />
              </div>
            </div>

            <div className="form-field">
              <label>Preset Image Selection Library</label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "8px",
                }}
              >
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setBannerUrl(preset.url);
                      setLogoUrl(preset.url);
                      notify.success(`Selected ${preset.name}`);
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

            <div
              className="form-grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}
            >
              <div className="form-field">
                <label>Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div className="form-field">
                <label>Avg. Delivery Time (Mins)</label>
                <input
                  type="number"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="input-premium"
                />
              </div>
            </div>

            <div
              className="form-grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}
            >
              <div className="form-field">
                <label>Opening Time</label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="08:00:00"
                  className="input-premium"
                />
              </div>

              <div className="form-field">
                <label>Closing Time</label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="22:00:00"
                  className="input-premium"
                />
              </div>
            </div>

            {editingId && (
              <div
                className="form-grid"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Is Active
                </label>

                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  Is Verified
                </label>

                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="input-premium"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn-premium button-stretch"
              style={{ marginTop: "12px" }}
            >
              {editingId ? "Update Store" : "Register Store"}
            </button>
          </form>
        </div>
      )}

      <div className="panel-grid">
        {restaurants.map((store) => (
          <div key={store.id} className="panel-card panel-card-stacked">
            <div>
              {store.banner_image_url && (
                <div
                  style={{
                    width: "100%",
                    height: "120px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={store.banner_image_url}
                    alt={store.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <div className="panel-row">
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{store.name}</h3>
                <span
                  className={`status-pill ${store.is_verified ? "success" : "warning"}`}
                >
                  {store.is_verified ? "Verified" : "Pending Verification"}
                </span>
              </div>
              <p
                className="card-subtitle"
                style={{ fontSize: "0.85rem", marginTop: "6px" }}
              >
                {store.description || "No description provided."}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                <div>
                  Owner ID: <strong>{store.owner_id}</strong>
                </div>
                {store.owner_email && (
                  <div>
                    Owner Email: <strong>{store.owner_email}</strong>
                  </div>
                )}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Clock size={12} /> Hours: {store.opening_time} -{" "}
                  {store.closing_time}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Tag size={12} /> Commission: {store.commission_rate}% |
                  Status:{" "}
                  <strong style={{ textTransform: "uppercase" }}>
                    {store.status}
                  </strong>
                </div>
              </div>
            </div>

            <div
              className="panel-row"
              style={{
                marginTop: "20px",
                borderTop: "1px solid var(--glass-border)",
                paddingTop: "12px",
              }}
            >
              <button
                onClick={() => toggleVerify(store)}
                className={`btn-premium btn-sm`}
                style={{
                  background: store.is_verified
                    ? "var(--text-slate)"
                    : "var(--primary-gradient)",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  boxShadow: "none",
                }}
              >
                {store.is_verified ? "Unverify Store" : "Verify Store"}
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => startEdit(store)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-slate)",
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteRestaurant(store.id)}
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
          </div>
        ))}

        {restaurants.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No merchant stores registered.</p>
          </div>
        )}
      </div>
    </div>
  );
};
