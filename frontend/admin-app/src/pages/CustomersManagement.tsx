import React, { useEffect, useState } from "react";
import { Users, Edit2, Trash2, ShieldAlert, Award, Plus, DollarSign } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  is_verified: boolean;
  wallet_balance: number;
  created_at: string;
}

export const CustomersManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "suspended">("active");
  const [isVerified, setIsVerified] = useState(true);
  const [walletBalance, setWalletBalance] = useState("0");

  const [showEditForm, setShowEditForm] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/customers");
      if (res.data.status === "success") {
        setCustomers(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load customer profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const res = await api.put(`/admin/customers/${editingId}`, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        status,
        is_verified: isVerified,
        wallet_balance: parseFloat(walletBalance || "0")
      });

      if (res.data.status === "success") {
        toast.success("Customer profile updated!");
        resetForm();
        fetchCustomers();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to block/deactivate this customer?")) return;
    try {
      const res = await api.delete(`/admin/customers/${id}`);
      if (res.data.status === "success") {
        toast.success("Customer suspended.");
        fetchCustomers();
      }
    } catch (err) {
      toast.error("Failed to suspend customer.");
    }
  };

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setFirstName(c.first_name);
    setLastName(c.last_name);
    setEmail(c.email);
    setPhone(c.phone);
    setStatus(c.status);
    setIsVerified(c.is_verified);
    setWalletBalance(c.wallet_balance.toString());
    setShowEditForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setStatus("active");
    setIsVerified(true);
    setWalletBalance("0");
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading customer records...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="section-spacing">
        <h1 className="section-heading section-heading-lg" style={{ margin: 0 }}>
          Customers Management
        </h1>
        <p className="text-muted">Audit platform users, manage wallet balances, and handle account status suspensions.</p>
      </div>

      {showEditForm && (
        <div className="panel-card section-spacing" style={{ maxWidth: "600px" }}>
          <div className="panel-heading">
            <Edit2 size={18} color="var(--accent-orange)" /> Edit Customer & Wallet
          </div>

          <form onSubmit={handleUpdateCustomer} className="form-grid">
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-field">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>

              <div className="form-field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="input-premium"
                />
              </div>
            </div>

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-premium"
              />
            </div>

            <div className="form-field">
              <label>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="input-premium"
              />
            </div>

            <div className="form-field">
              <label>Adjust Wallet Balance ($)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  step="0.01"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  className="input-premium"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(walletBalance || "0");
                    setWalletBalance((current + 10).toString());
                  }}
                  className="btn-premium btn-sm"
                  style={{ whiteSpace: "nowrap", padding: "10px", boxShadow: "none" }}
                >
                  + $10
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(walletBalance || "0");
                    setWalletBalance((current + 50).toString());
                  }}
                  className="btn-premium btn-sm"
                  style={{ whiteSpace: "nowrap", padding: "10px", boxShadow: "none" }}
                >
                  + $50
                </button>
              </div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
              <div className="form-field">
                <label>Account Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="input-premium"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
                Verified User
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button type="submit" className="btn-premium" style={{ flex: 1 }}>
                Save Profile Changes
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-premium"
                style={{ background: "var(--text-slate)", flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-grid">
        {customers.map((c) => (
          <div key={c.id} className="panel-card panel-card-stacked">
            <div>
              <div className="panel-row">
                <h3 style={{ margin: 0 }}>
                  {c.first_name} {c.last_name}
                </h3>
                <span className={`status-pill ${c.status === "active" ? "success" : "danger"}`}>
                  {c.status}
                </span>
              </div>

              <p className="card-subtitle" style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                {c.email} | {c.phone}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.5)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginTop: "16px",
                  border: "1px solid var(--glass-border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 700 }}>
                  <DollarSign size={16} color="var(--accent-violet)" /> Wallet Balance:
                </div>
                <strong style={{ fontSize: "1.1rem", color: "var(--text-slate)" }}>
                  ${parseFloat(c.wallet_balance.toString()).toFixed(2)}
                </strong>
              </div>

              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "12px" }}>
                Registered: {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="panel-row" style={{ marginTop: "20px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                ID: <strong>{c.id.substring(0, 8)}...</strong>
              </span>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => startEdit(c)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-slate)" }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(c.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#F44336" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {customers.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No registered customer accounts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
