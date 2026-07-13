import React, { useEffect, useState } from "react";
import {
  Users,
  Edit2,
  Trash2,
  ShieldAlert,
  Award,
  Plus,
  DollarSign,
  X,
  User,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { PreviewDrawer } from "../../../shared/components/PreviewDrawer";
import "../admin.css";

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

  // Inspector & Edit Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Edit form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "suspended">(
    "active",
  );
  const [isVerified, setIsVerified] = useState(true);
  const [walletBalance, setWalletBalance] = useState("0");
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/admin/customers");
      if (res.data.status === "success") {
        setCustomers(res.data.data);
      }
    } catch (err) {
      notify.error(
        "We couldn't load the customer list. Please refresh the page.",
      );
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

    setSaveLoading(true);
    try {
      const res = await api.put(`/admin/customers/${editingId}`, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        status,
        is_verified: isVerified,
        wallet_balance: parseFloat(walletBalance || "0"),
      });

      if (res.data.status === "success") {
        notify.success("Changes saved successfully.");
        setSelectedCustomer(null);
        resetForm();
        fetchCustomers();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message ||
          "We couldn't save your changes. Please try again.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to block/deactivate this customer?"))
      return;
    try {
      const res = await api.delete(`/admin/customers/${id}`);
      if (res.data.status === "success") {
        notify.success("Customer account suspended.");
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(null);
        }
        fetchCustomers();
      }
    } catch (err) {
      notify.error("We couldn't suspend this account right now.");
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
  };

  const handleInspectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    startEdit(c);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading customer records...</p>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <div className="section-spacing">
        <h1
          className="section-heading section-heading-lg"
          style={{ margin: 0 }}
        >
          Customers Management
        </h1>
        <p className="text-muted">
          Click any customer card to audit history, adjust wallet balances, and
          manage account statuses.
        </p>
      </div>

      <div className="panel-grid">
        {customers.map((c) => (
          <div
            key={c.id}
            className="panel-card panel-card-stacked"
            onClick={() => handleInspectCustomer(c)}
            style={{ cursor: "pointer" }}
          >
            <div>
              <div className="panel-row">
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                  {c.first_name} {c.last_name}
                </h3>
                <span
                  className={`premium-badge ${c.status === "active" ? "success" : "danger"}`}
                >
                  {c.status}
                </span>
              </div>

              <p
                className="card-subtitle"
                style={{
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  color: "var(--text-muted)",
                }}
              >
                {c.email} | {c.phone}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginTop: "16px",
                  border: "1px solid var(--cred-border, rgba(0,0,0,0.06))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                  }}
                >
                  <DollarSign size={16} color="var(--accent-violet)" /> Balance:
                </div>
                <strong style={{ fontSize: "1.1rem" }}>
                  ${parseFloat(c.wallet_balance.toString()).toFixed(2)}
                </strong>
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
                className="btn-premium btn-sm"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  boxShadow: "none",
                }}
              >
                Inspect Account
              </button>

              <button
                onClick={(e) => handleDeleteCustomer(c.id, e)}
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

        {customers.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No registered customer accounts found.</p>
          </div>
        )}
      </div>

      <PreviewDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Inspect Customer"
        subtitle={selectedCustomer ? `ID: #${selectedCustomer.id}` : undefined}
      >
        {selectedCustomer && (
          <>
            {/* Account summary header */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.1)",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                }}
              >
                {selectedCustomer.first_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </h4>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                >
                  Registered on{" "}
                  {new Date(selectedCustomer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Edit forms */}
            <form
              onSubmit={handleUpdateCustomer}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="premium-form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="premium-form-input"
                  />
                </div>
                <div className="premium-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="premium-form-input"
                  />
                </div>
              </div>

              <div className="premium-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Adjust Wallet Balance ($)</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="number"
                    step="0.01"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                    className="premium-form-input"
                    style={{ flexGrow: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(walletBalance || "0");
                      setWalletBalance((current + 10).toString());
                    }}
                    className="premium-badge neutral"
                    style={{
                      cursor: "pointer",
                      border: "1px solid var(--cred-border)",
                      padding: "8px 12px",
                    }}
                  >
                    +$10
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(walletBalance || "0");
                      setWalletBalance((current + 50).toString());
                    }}
                    className="premium-badge neutral"
                    style={{
                      cursor: "pointer",
                      border: "1px solid var(--cred-border)",
                      padding: "8px 12px",
                    }}
                  >
                    +$50
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <div className="premium-form-group">
                  <label>Account Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="premium-form-input"
                    style={{ padding: "8px 10px" }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginTop: "18px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--cred-text-secondary)",
                    }}
                  >
                    Verified Account
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saveLoading}
                className="neo-btn neo-btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.95rem",
                  marginTop: "12px",
                }}
              >
                {saveLoading
                  ? "Saving Changes..."
                  : "Save Customer Modifications"}
              </button>
            </form>
          </>
        )}
      </PreviewDrawer>
    </div>
  );
};
