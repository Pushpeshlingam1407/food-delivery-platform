import React, { useEffect, useState } from "react";
import { Truck, Edit2, Trash2, ShieldAlert, Clock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  restaurant_id: string;
  restaurant_name: string;
  delivery_partner_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  status: "placed" | "accepted" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
  item_total: number;
  delivery_charges: number;
  tax_amount: number;
  discount_amount: number;
  total_payable: number;
  placed_at: string;
}

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  is_online: boolean;
}

export const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<Order["status"]>("placed");
  const [deliveryPartnerId, setDeliveryPartnerId] = useState("");
  const [totalPayable, setTotalPayable] = useState("0.00");

  const [showEditForm, setShowEditForm] = useState(false);

  const fetchData = async () => {
    try {
      const ordersRes = await api.get("/admin/orders");
      const driversRes = await api.get("/admin/drivers");
      
      if (ordersRes.data.status === "success") {
        setOrders(ordersRes.data.data);
      }
      if (driversRes.data.status === "success") {
        setDrivers(driversRes.data.data.filter((d: Driver) => d.is_online));
      }
    } catch (err) {
      toast.error("Failed to load orders or driver list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const res = await api.put(`/admin/orders/${editingId}`, {
        status,
        delivery_partner_id: deliveryPartnerId,
        total_payable: parseFloat(totalPayable || "0")
      });

      if (res.data.status === "success") {
        toast.success("Order parameters updated successfully!");
        resetForm();
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order.");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this order from the system?")) return;
    try {
      const res = await api.delete(`/admin/orders/${id}`);
      if (res.data.status === "success") {
        toast.success("Order deleted.");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete order.");
    }
  };

  const startEdit = (order: Order) => {
    setEditingId(order.id);
    setStatus(order.status);
    setDeliveryPartnerId(order.delivery_partner_id || "");
    setTotalPayable(order.total_payable.toString());
    setShowEditForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setStatus("placed");
    setDeliveryPartnerId("");
    setTotalPayable("0.00");
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading system orders...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="section-spacing">
        <h1 className="section-heading section-heading-lg" style={{ margin: 0 }}>
          Orders Console
        </h1>
        <p className="text-muted">Manually dispatch delivery riders, update order state transitions, and audit system transactions.</p>
      </div>

      {showEditForm && (
        <div className="panel-card section-spacing" style={{ maxWidth: "600px" }}>
          <div className="panel-heading">
            <Edit2 size={18} color="var(--accent-orange)" /> Dispatch & Edit Order
          </div>

          <form onSubmit={handleUpdateOrder} className="form-grid">
            <div className="form-field">
              <label>Order Status Flow</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="input-premium"
              >
                <option value="placed">Placed</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready For Pickup</option>
                <option value="out_for_delivery">Out For Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-field">
              <label>Manual Delivery Rider Assignment</label>
              <select
                value={deliveryPartnerId}
                onChange={(e) => setDeliveryPartnerId(e.target.value)}
                className="input-premium"
              >
                <option value="">-- Select Rider / Unassign --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name} (ONLINE)
                  </option>
                ))}
              </select>
              <small style={{ color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Only active, online riders are displayed here.
              </small>
            </div>

            <div className="form-field">
              <label>Total Order Value ($)</label>
              <input
                type="number"
                step="0.01"
                value={totalPayable}
                onChange={(e) => setTotalPayable(e.target.value)}
                className="input-premium"
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button type="submit" className="btn-premium" style={{ flex: 1 }}>
                Save Dispatch Modifications
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
        {orders.map((o) => (
          <div key={o.id} className="panel-card panel-card-stacked">
            <div>
              <div className="panel-row">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShoppingBag size={18} color="var(--accent-violet)" />
                  <strong style={{ fontSize: "1.1rem" }}>Order #{o.id.substring(0, 8)}</strong>
                </div>
                <span className={`status-pill ${
                  o.status === "delivered" ? "success" : o.status === "cancelled" ? "danger" : "warning"
                }`}>
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>

              <div style={{ margin: "14px 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <div>Merchant Store: <strong style={{ color: "var(--text-slate)" }}>{o.restaurant_name}</strong></div>
                <div>Customer: <strong>{o.customer_name}</strong> ({o.customer_email})</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                  <Clock size={12} /> Placed: {new Date(o.placed_at).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.4)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--glass-border)",
                  fontSize: "0.9rem"
                }}
              >
                <div style={{ fontWeight: 600 }}>Total Payable:</div>
                <strong style={{ fontSize: "1.1rem" }}>${parseFloat(o.total_payable.toString()).toFixed(2)}</strong>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  padding: "10px",
                  background: o.delivery_partner_id ? "rgba(76,175,80,0.08)" : "rgba(244,67,54,0.08)",
                  borderRadius: "8px",
                  border: "1px solid var(--glass-border)",
                  fontSize: "0.8rem"
                }}
              >
                {o.delivery_partner_id ? (
                  <div>
                    Rider: <strong>{o.driver_name}</strong> ({o.driver_phone})
                  </div>
                ) : (
                  <div style={{ color: "#F44336", fontWeight: 700 }}>
                    ⚠️ No Delivery Rider Assigned
                  </div>
                )}
              </div>
            </div>

            <div className="panel-row" style={{ marginTop: "20px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>
              <button
                onClick={() => startEdit(o)}
                className="btn-premium btn-sm"
                style={{ padding: "6px 12px", fontSize: "0.75rem", boxShadow: "none" }}
              >
                Dispatch Order
              </button>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleDeleteOrder(o.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#F44336" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No orders found in the database logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};
