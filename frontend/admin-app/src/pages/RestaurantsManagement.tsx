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
import { PreviewDrawer } from "../../../shared/components/PreviewDrawer";
import "../admin.css";

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

  // Inspector & Edit Drawer State
  const [selectedStore, setSelectedStore] = useState<Restaurant | null>(null);

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
  const [saveLoading, setSaveLoading] = useState(false);

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

    setSaveLoading(true);
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
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSaveLoading(true);
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
        setSelectedStore(null);
        resetForm();
        fetchRestaurants();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "Couldn't update this store.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to deactivate/delete this store?"))
      return;
    try {
      const res = await api.delete(`/admin/restaurants/${id}`);
      if (res.data.status === "success") {
        notify.info("Store deactivated.");
        if (selectedStore?.id === id) {
          setSelectedStore(null);
        }
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

  const handleInspectStore = (store: Restaurant) => {
    setSelectedStore(store);
    startEdit(store);
  };

  const toggleVerify = async (store: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const endpoint = store.is_verified
        ? `/admin/restaurants/${store.id}/unverify`
        : `/admin/restaurants/${store.id}/verify`;
      const res = await api.put(endpoint);
      if (res.data.status === "success") {
        notify.success(
          store.is_verified
            ? "Store unverified."
            : "Store verified successfully.",
        );
        fetchRestaurants();
        if (selectedStore?.id === store.id) {
          setSelectedStore({ ...store, is_verified: !store.is_verified });
        }
      }
    } catch (err) {
      notify.error("Couldn't toggle verification status.");
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
    <div className="app-shell app-shell-relative">
      <div className="section-spacing flex-wrap-gap-16">
        <div>
          <h1 className="section-heading section-heading-lg margin-zero">
            Merchant Outlets
          </h1>
          <p className="text-muted">
            Click any partner store to view item details, configure commission
            plans, and audit details.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="neo-btn neo-btn-primary form-input-register"
        >
          <Plus size={18} /> Register Store
        </button>
      </div>

      {/* Creation form modal block */}
      {showAddForm && (
        <div
          className="preview-drawer-backdrop"
          onClick={() => setShowAddForm(false)}
        />
      )}

      {showAddForm && (
        <div className="preview-drawer open">
          <div className="preview-drawer-header">
            <div>
              <h3 className="margin-zero">Register New Merchant</h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-header-close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="preview-drawer-body">
            <form
              onSubmit={handleCreateRestaurant}
              className="flex-column-gap-16"
            >
              <div className="premium-form-group">
                <label>Restaurant Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Indiranagar Pizza"
                  required
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Owner User Account ID *</label>
                <input
                  type="text"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  placeholder="Provide valid owner UUID"
                  required
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Delicious freshly baked pizzas..."
                  className="premium-form-input textarea-height-70"
                />
              </div>

              <div className="premium-form-group">
                <label>Preset Banner Preset</label>
                <div className="preset-banner-container">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBannerUrl(img.url)}
                      className="premium-badge neutral preset-banner-btn"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="premium-form-group">
                <label>Banner Image URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Paste banner image URL"
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Logo Asset URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Paste logo image URL"
                  className="premium-form-input"
                />
              </div>

              <div className="commission-time-grid">
                <div className="premium-form-group">
                  <label>Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="premium-form-input"
                  />
                </div>
                <div className="premium-form-group">
                  <label>Avg. Delivery Time (Mins)</label>
                  <input
                    type="number"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="premium-form-input"
                  />
                </div>
              </div>

              <div className="hours-grid">
                <div className="premium-form-group">
                  <label>Opening Time</label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    placeholder="08:00:00"
                    className="premium-form-input"
                  />
                </div>
                <div className="premium-form-group">
                  <label>Closing Time</label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    placeholder="22:00:00"
                    className="premium-form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="neo-btn neo-btn-primary save-configurations-btn"
              >
                {saveLoading ? "Saving..." : "Register Store"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="panel-grid">
        {restaurants.map((store) => (
          <div
            key={store.id}
            className="panel-card panel-card-stacked clickable-card-wrapper"
            onClick={() => handleInspectStore(store)}
          >
            <div>
              {store.banner_image_url && (
                <div className="card-banner-wrapper">
                  <img
                    src={store.banner_image_url}
                    alt={store.name}
                    className="card-banner-img"
                  />
                </div>
              )}
              <div className="panel-row">
                <h3 className="card-title-h3">{store.name}</h3>
                <span
                  className={`premium-badge ${store.is_verified ? "success" : "danger"}`}
                >
                  {store.is_verified ? "Verified" : "Pending"}
                </span>
              </div>
              <p className="card-desc-p">
                {store.description || "No description provided."}
              </p>

              <div className="card-vertical-info">
                <div>
                  Commission: <strong>{store.commission_rate}%</strong>
                </div>
                <div className="flex-center-gap-4-mt8">
                  <Clock size={12} /> {store.opening_time} -{" "}
                  {store.closing_time}
                </div>
              </div>
            </div>

            <div className="panel-row panel-card-footer-row">
              <button className="btn-premium btn-sm btn-sm-flat">
                Inspect Merchant
              </button>

              <button
                onClick={(e) => handleDeleteRestaurant(store.id, e)}
                className="trash-btn"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {restaurants.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No merchant stores registered.</p>
          </div>
        )}
      </div>

      <PreviewDrawer
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        title="Inspect Merchant"
        subtitle={selectedStore ? `ID: #${selectedStore.id}` : undefined}
      >
        {selectedStore && (
          <>
            {/* verification switch */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "16px",
              }}
            >
              <span
                className={`premium-badge ${
                  selectedStore.is_verified ? "success" : "danger"
                }`}
              >
                {selectedStore.is_verified
                  ? "VERIFIED"
                  : "PENDING VERIFICATION"}
              </span>
              <button
                type="button"
                onClick={(e) => toggleVerify(selectedStore, e)}
                className="premium-badge neutral"
                style={{
                  cursor: "pointer",
                  border: "1px solid var(--cred-border)",
                  padding: "6px 12px",
                }}
              >
                Toggle Verification
              </button>
            </div>

            {/* verification switch */}
            <div className="avatar-badge-info-col">
              <span
                className={`premium-badge ${
                  selectedStore.is_verified ? "success" : "danger"
                }`}
              >
                {selectedStore.is_verified
                  ? "VERIFIED"
                  : "PENDING VERIFICATION"}
              </span>
              <button
                type="button"
                onClick={(e) => toggleVerify(selectedStore, e)}
                className="premium-badge neutral toggle-verify-badge-btn"
              >
                Toggle Verification
              </button>
            </div>

            {/* Banner visual */}
            {selectedStore.banner_image_url && (
              <div className="drawer-banner-preview-box">
                <img
                  src={selectedStore.banner_image_url}
                  alt={selectedStore.name}
                  className="drawer-banner-preview-img"
                />
              </div>
            )}

            {/* Form editing details */}
            <form
              onSubmit={handleUpdateRestaurant}
              className="flex-column-gap-16"
            >
              <div className="premium-form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="premium-form-input textarea-height-60"
                />
              </div>

              <div className="premium-form-group">
                <label>Banner URL</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="premium-form-input"
                />
              </div>

              <div className="grid-2col-gap-12">
                <div className="premium-form-group">
                  <label>Commission (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="premium-form-input"
                  />
                </div>

                <div className="premium-form-group">
                  <label>Time (Mins)</label>
                  <input
                    type="number"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="premium-form-input"
                  />
                </div>
              </div>

              <div className="grid-2col-gap-12">
                <div className="premium-form-group">
                  <label>Opens</label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="premium-form-input"
                  />
                </div>

                <div className="premium-form-group">
                  <label>Closes</label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="premium-form-input"
                  />
                </div>
              </div>

              <div className="grid-2col-gap-12 items-center-helper">
                <label className="active-toggle-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="checkbox-dimensions"
                  />
                  <span className="verified-badge-label-text">Active</span>
                </label>

                <div className="premium-form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="premium-form-input select-input-padding"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="neo-btn neo-btn-primary save-configurations-btn"
              >
                {saveLoading
                  ? "Saving Changes..."
                  : "Save Merchant Configurations"}
              </button>
            </form>
          </>
        )}
      </PreviewDrawer>
    </div>
  );
};
