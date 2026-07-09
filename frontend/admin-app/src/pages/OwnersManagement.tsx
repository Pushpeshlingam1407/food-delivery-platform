import React, { useEffect, useState } from "react";
import {
  Users,
  Edit2,
  Trash2,
  ShieldAlert,
  Award,
  Plus,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";
import { PremiumButton } from "../../../shared/components/PremiumButton";
import { PremiumInput } from "../../../shared/components/PremiumInput";

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  is_verified: boolean;
  restaurant_id: string | null;
  restaurant_name: string | null;
  created_at: string;
}

export const OwnersManagement: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "suspended">(
    "active",
  );
  const [isVerified, setIsVerified] = useState(true);
  const [password, setPassword] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchOwners = async () => {
    try {
      const res = await api.get("/admin/owners");
      if (res.data.status === "success") {
        setOwners(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load restaurant owners data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password) {
      toast.error("All fields are required to register an owner.");
      return;
    }

    try {
      const res = await api.post("/admin/owners", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });

      if (res.data.status === "success") {
        toast.success("Merchant owner account created successfully!");
        resetForm();
        fetchOwners();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create owner account.",
      );
    }
  };

  const handleUpdateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const res = await api.put(`/admin/owners/${editingId}`, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        status,
        is_verified: isVerified,
      });

      if (res.data.status === "success") {
        toast.success("Merchant owner profile updated!");
        resetForm();
        fetchOwners();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleDeleteOwner = async (id: string) => {
    if (
      !confirm("Are you sure you want to block/remove this restaurant owner?")
    )
      return;
    try {
      const res = await api.delete(`/admin/owners/${id}`);
      if (res.data.status === "success") {
        toast.success("Owner account deactivated.");
        fetchOwners();
      }
    } catch (err) {
      toast.error("Failed to deactivate owner.");
    }
  };

  const startEdit = (owner: Owner) => {
    setEditingId(owner.id);
    setFirstName(owner.first_name);
    setLastName(owner.last_name);
    setEmail(owner.email);
    setPhone(owner.phone);
    setStatus(owner.status);
    setIsVerified(owner.is_verified);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setStatus("active");
    setIsVerified(true);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading merchant accounts...</p>
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
            Restaurant Owners Console
          </h1>
          <p className="text-muted">
            Manage store owners/partners, audit statuses, and inspect owned
            outlets.
          </p>
        </div>
        <PremiumButton
          onClick={() => {
            if (showAddForm) resetForm();
            else {
              resetForm();
              setShowAddForm(true);
            }
          }}
          variant="secondary"
          style={{ width: "auto", display: "inline-flex", gap: "8px" }}
        >
          <Plus size={18} /> {showAddForm ? "Cancel" : "Add Owner"}
        </PremiumButton>
      </div>

      {showAddForm && (
        <div
          className="panel-card section-spacing"
          style={{ maxWidth: "600px" }}
        >
          <div className="panel-heading">Register New Restaurant Owner</div>
          <form onSubmit={handleCreateOwner} className="form-grid">
            <PremiumInput
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Rajesh"
            />
            <PremiumInput
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Kumar"
            />
            <PremiumInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="rajesh.owner1@example.com"
            />
            <PremiumInput
              label="Phone Number"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+918765432101"
            />
            <PremiumInput
              label="Login Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <div style={{ gridColumn: "span 2", marginTop: "12px" }}>
              <PremiumButton type="submit">
                Register Owner Account
              </PremiumButton>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div
          className="panel-card section-spacing"
          style={{ maxWidth: "600px" }}
        >
          <div className="panel-heading">Edit Owner Account Details</div>
          <form onSubmit={handleUpdateOwner} className="form-grid">
            <PremiumInput
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <PremiumInput
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <PremiumInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PremiumInput
              label="Phone Number"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <div className="form-field">
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text-slate)",
                  textTransform: "uppercase",
                }}
              >
                Account Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="input-premium"
                style={{ marginTop: "6px" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div
              className="form-field"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "24px",
              }}
            >
              <input
                type="checkbox"
                id="is-verified-check"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
              />
              <label
                htmlFor="is-verified-check"
                style={{ cursor: "pointer", fontWeight: 600 }}
              >
                Verified Partner Account
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                gridColumn: "span 2",
                marginTop: "12px",
              }}
            >
              <PremiumButton type="submit" style={{ flex: 1 }}>
                Save Profile Changes
              </PremiumButton>
              <PremiumButton
                type="button"
                onClick={resetForm}
                variant="secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </PremiumButton>
            </div>
          </form>
        </div>
      )}

      <div className="panel-grid">
        {owners.map((owner) => (
          <div key={owner.id} className="panel-card panel-card-stacked">
            <div>
              <div className="panel-row">
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                  {owner.first_name} {owner.last_name}
                </h3>
                <span
                  className={`status-pill ${owner.status === "active" ? "success" : "danger"}`}
                >
                  {owner.status}
                </span>
              </div>
              <p
                className="text-muted"
                style={{ fontSize: "0.85rem", margin: "4px 0 12px 0" }}
              >
                ID: {owner.id.substring(0, 8)}...
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "0.85rem",
                  color: "var(--text-slate)",
                }}
              >
                <div>
                  Email: <strong>{owner.email}</strong>
                </div>
                <div>
                  Phone: <strong>{owner.phone}</strong>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    borderTop: "1px dashed var(--glass-border)",
                    paddingTop: "8px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: owner.restaurant_name
                        ? "var(--accent-orange)"
                        : "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    <Store size={14} />
                    {owner.restaurant_name
                      ? `Owns: ${owner.restaurant_name}`
                      : "No outlet assigned"}
                  </span>
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
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Added: {new Date(owner.created_at).toLocaleDateString()}
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => startEdit(owner)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-slate)",
                  }}
                  title="Edit profile"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteOwner(owner.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#F44336",
                  }}
                  title="Remove account"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {owners.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No merchant accounts registered.</p>
          </div>
        )}
      </div>
    </div>
  );
};
