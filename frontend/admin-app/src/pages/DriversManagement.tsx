import React, { useEffect, useState } from "react";
import {
  Users,
  Edit2,
  Trash2,
  ShieldAlert,
  Award,
  Plus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  is_verified: boolean;
  vehicle_number: string;
  vehicle_type: "bicycle" | "bike" | "scooter" | "car";
  license_number: string;
  is_online: boolean;
  driver_status: "idle" | "assigned" | "delivering";
}

export const DriversManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<
    "bicycle" | "bike" | "scooter" | "car"
  >("bike");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [driverStatus, setDriverStatus] = useState<
    "idle" | "assigned" | "delivering"
  >("idle");

  const [showEditForm, setShowEditForm] = useState(false);

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/admin/drivers");
      if (res.data.status === "success") {
        setDrivers(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load driver partners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const res = await api.put(`/admin/drivers/${editingId}`, {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        status,
        is_verified: isVerified,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        license_number: licenseNumber,
        is_online: isOnline,
        driver_status: driverStatus,
      });

      if (res.data.status === "success") {
        toast.success("Driver details updated successfully!");
        resetForm();
        fetchDrivers();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update driver details.",
      );
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to block/remove this driver partner?"))
      return;
    try {
      const res = await api.delete(`/admin/drivers/${id}`);
      if (res.data.status === "success") {
        toast.success("Driver profile deactivated.");
        fetchDrivers();
      }
    } catch (err) {
      toast.error("Failed to suspend driver.");
    }
  };

  const startEdit = (d: Driver) => {
    setEditingId(d.id);
    setFirstName(d.first_name);
    setLastName(d.last_name);
    setEmail(d.email);
    setPhone(d.phone);
    setStatus(d.status);
    setIsVerified(d.is_verified);
    setVehicleNumber(d.vehicle_number || "");
    setVehicleType(d.vehicle_type || "bike");
    setLicenseNumber(d.license_number || "");
    setIsOnline(d.is_online || false);
    setDriverStatus(d.driver_status || "idle");
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
    setVehicleNumber("");
    setVehicleType("bike");
    setLicenseNumber("");
    setIsOnline(false);
    setDriverStatus("idle");
    setShowEditForm(false);
  };

  const toggleVerify = async (d: Driver) => {
    try {
      const res = await api.put(`/admin/drivers/${d.id}`, {
        is_verified: !d.is_verified,
      });
      if (res.data.status === "success") {
        toast.success("Driver verification updated.");
        fetchDrivers();
      }
    } catch (err) {
      toast.error("Failed to toggle driver verification.");
    }
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading delivery records...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="section-spacing">
        <h1
          className="section-heading section-heading-lg"
          style={{ margin: 0 }}
        >
          Drivers Management
        </h1>
        <p className="text-muted">
          Audit delivery partners, vehicle licenses, and verify active dispatch
          riders.
        </p>
      </div>

      {showEditForm && (
        <div
          className="panel-card section-spacing"
          style={{ maxWidth: "600px" }}
        >
          <div className="panel-heading">
            <Edit2 size={18} color="var(--accent-orange)" /> Edit Driver Partner
            details
          </div>

          <form onSubmit={handleUpdateDriver} className="form-grid">
            <div
              className="form-grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}
            >
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

            <div
              className="form-grid"
              style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}
            >
              <div className="form-field">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. DL-3C-AB-1234"
                  className="input-premium"
                />
              </div>

              <div className="form-field">
                <label>Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e: any) => setVehicleType(e.target.value)}
                  className="input-premium"
                >
                  <option value="bicycle">Bicycle</option>
                  <option value="bike">Bike (Motorcycle)</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Delivery Car</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Driver License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="License ID string"
                className="input-premium"
              />
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                alignItems: "center",
              }}
            >
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

              <div className="form-field">
                <label>Duty Status</label>
                <select
                  value={driverStatus}
                  onChange={(e: any) => setDriverStatus(e.target.value)}
                  className="input-premium"
                >
                  <option value="idle">Idle</option>
                  <option value="assigned">Assigned Job</option>
                  <option value="delivering">Delivering Order</option>
                </select>
              </div>
            </div>

            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginTop: "12px",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                />
                Driver Verified
              </label>

              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                />
                Rider Online
              </label>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button type="submit" className="btn-premium" style={{ flex: 1 }}>
                Save Driver Details
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
        {drivers.map((d) => (
          <div key={d.id} className="panel-card panel-card-stacked">
            <div>
              <div className="panel-row">
                <h3 style={{ margin: 0 }}>
                  {d.first_name} {d.last_name}
                </h3>
                <span
                  className={`status-pill ${d.is_verified ? "success" : "warning"}`}
                >
                  {d.is_verified ? "Verified" : "Pending Verification"}
                </span>
              </div>

              <p
                className="card-subtitle"
                style={{ fontSize: "0.85rem", marginTop: "4px" }}
              >
                {d.email} | {d.phone}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "16px",
                }}
              >
                <div>
                  Vehicle:{" "}
                  <strong style={{ textTransform: "uppercase" }}>
                    {d.vehicle_type}
                  </strong>{" "}
                  ({d.vehicle_number || "No Vehicle Number"})
                </div>
                <div>
                  License Number:{" "}
                  <strong>{d.license_number || "No License"}</strong>
                </div>
                <div>
                  Duty Status:{" "}
                  <strong style={{ textTransform: "uppercase" }}>
                    {d.driver_status}
                  </strong>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Status:{" "}
                  <span
                    className={`status-pill ${d.is_online ? "success" : "neutral"}`}
                    style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                  >
                    {d.is_online ? "ONLINE" : "OFFLINE"}
                  </span>
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
                onClick={() => toggleVerify(d)}
                className="btn-premium btn-sm"
                style={{
                  background: d.is_verified
                    ? "var(--text-slate)"
                    : "var(--primary-gradient)",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  boxShadow: "none",
                }}
              >
                {d.is_verified ? "De-authorize" : "Verify Rider"}
              </button>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => startEdit(d)}
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
                  onClick={() => handleDeleteDriver(d.id)}
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

        {drivers.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No driver partners registered.</p>
          </div>
        )}
      </div>
    </div>
  );
};
