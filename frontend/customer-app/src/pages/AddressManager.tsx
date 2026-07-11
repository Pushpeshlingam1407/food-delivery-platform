import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, Edit2, Check } from "lucide-react";
import api from "../../../shared/services/api";

interface Address {
  id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
  is_default: boolean;
}

export const AddressManager: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      if (response.data.status === "success") {
        setAddresses(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress || !city || !state || !postalCode) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (editingId) {
        // Update Address
        const response = await api.put(`/addresses/${editingId}`, {
          streetAddress,
          city,
          state,
          postalCode,
          landmark,
          isDefault,
        });
        if (response.data.status === "success") {
          toast.success("Address updated successfully!");
          resetForm();
          fetchAddresses();
        }
      } else {
        // Create Address
        const response = await api.post("/addresses", {
          streetAddress,
          city,
          state,
          postalCode,
          landmark,
          isDefault,
        });
        if (response.data.status === "success") {
          toast.success("Address added successfully!");
          resetForm();
          fetchAddresses();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address.");
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setStreetAddress(addr.street_address);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setLandmark(addr.landmark || "");
    setIsDefault(addr.is_default);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const response = await api.delete(`/addresses/${id}`);
      if (response.data.status === "success") {
        toast.success("Address deleted successfully!");
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setStreetAddress("");
    setCity("");
    setState("");
    setPostalCode("");
    setLandmark("");
    setIsDefault(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          Loading your address book...
        </p>
      </div>
    );
  }

  return (
    <div className="address-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            marginBottom: "8px",
            fontFamily: "var(--font-anthropic)",
          }}
        >
          Address Manager
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage your saved delivery addresses.
        </p>
      </div>

      <div className="address-grid">
        {/* Saved Addresses list */}
        <div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
            Saved Addresses
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {addresses.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-standard)",
                  padding: "20px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <MapPin size={18} color="var(--accent-orange)" />
                  <strong style={{ fontSize: "0.95rem" }}>
                    {a.street_address}
                    {a.is_default && (
                      <span
                        style={{
                          marginLeft: "8px",
                          background: "rgba(76, 175, 80, 0.1)",
                          color: "#4CAF50",
                          padding: "2px 8px",
                          borderRadius: "100px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        Default
                      </span>
                    )}
                  </strong>
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    marginLeft: "26px",
                    marginBottom: "16px",
                  }}
                >
                  {a.city}, {a.state} - {a.postal_code}
                  {a.landmark && (
                    <div style={{ fontStyle: "italic", marginTop: "2px" }}>
                      Landmark: {a.landmark}
                    </div>
                  )}
                </div>
                <div
                  style={{ display: "flex", gap: "12px", marginLeft: "26px" }}
                >
                  <button
                    onClick={() => handleEdit(a)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-slate)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#F44336",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}

            {addresses.length === 0 && (
              <p
                style={{
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No saved addresses. Add a new one on the right!
              </p>
            )}
          </div>
        </div>

        {/* Address Form */}
        <div className="card-premium">
          <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
            {editingId ? "Edit Address" : "Add New Address"}
          </h3>
          <form
            onSubmit={handleSave}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                STREET ADDRESS *
              </label>
              <input
                type="text"
                className="input-premium"
                placeholder="123 Main St, Apt 4B"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  CITY *
                </label>
                <input
                  type="text"
                  className="input-premium"
                  placeholder="Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  STATE *
                </label>
                <input
                  type="text"
                  className="input-premium"
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  POSTAL CODE *
                </label>
                <input
                  type="text"
                  className="input-premium"
                  placeholder="560001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  LANDMARK (OPTIONAL)
                </label>
                <input
                  type="text"
                  className="input-premium"
                  placeholder="Opposite Metro Station"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <label
                htmlFor="isDefault"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Set as default delivery address
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button
                type="submit"
                className="btn-premium"
                style={{ flex: 1, padding: "10px" }}
              >
                {editingId ? "Update Address" : "Add Address"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: "rgba(25, 25, 25, 0.04)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-standard)",
                    padding: "10px 20px",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
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
  );
};
