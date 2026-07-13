import React, { useEffect, useState } from "react";
import {
  Truck,
  Edit2,
  Trash2,
  ShieldAlert,
  Clock,
  ShoppingBag,
  X,
  MapPin,
  User,
  Store,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import "../admin.css";

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
  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
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

  // Detailed view state (Myntra-style side drawer)
  const [selectedDetailedOrder, setSelectedDetailedOrder] = useState<
    any | null
  >(null);

  // Dispatch fields inside drawer
  const [status, setStatus] = useState<Order["status"]>("placed");
  const [deliveryPartnerId, setDeliveryPartnerId] = useState("");
  const [totalPayable, setTotalPayable] = useState("0.00");
  const [dispatchLoading, setDispatchLoading] = useState(false);

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
      notify.error("Couldn't load the active orders list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePreviewOrder = async (order: Order) => {
    try {
      const res = await api.get(`/orders/${order.id}`);
      if (res.data.status === "success") {
        const detailedData = res.data.data;
        setSelectedDetailedOrder(detailedData);
        // Sync dispatch controls with this order
        setStatus(detailedData.status);
        setDeliveryPartnerId(detailedData.delivery_partner_id || "");
        setTotalPayable(detailedData.total_payable.toString());
      }
    } catch (err) {
      notify.error("Could not fetch itemized details for this order.");
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailedOrder) return;

    setDispatchLoading(true);
    try {
      const res = await api.put(`/admin/orders/${selectedDetailedOrder.id}`, {
        status,
        delivery_partner_id: deliveryPartnerId,
        total_payable: parseFloat(totalPayable || "0"),
      });

      if (res.data.status === "success") {
        notify.success("Dispatch status and rider updated.");
        setSelectedDetailedOrder(null);
        fetchData();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "We couldn't update this order.",
      );
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card preview click
    if (
      !confirm(
        "Are you sure you want to permanently delete this order from the system?",
      )
    )
      return;
    try {
      const res = await api.delete(`/admin/orders/${id}`);
      if (res.data.status === "success") {
        notify.info("Order deleted.");
        if (selectedDetailedOrder?.id === id) {
          setSelectedDetailedOrder(null);
        }
        fetchData();
      }
    } catch (err) {
      notify.error("We couldn't delete this order.");
    }
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading system orders...</p>
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
          Orders Console
        </h1>
        <p className="text-muted">
          Click any card to inspect itemized recipes, track deliveries, and
          dispatch riders.
        </p>
      </div>

      <div className="panel-grid">
        {orders.map((o) => (
          <div
            key={o.id}
            className="panel-card panel-card-stacked"
            onClick={() => handlePreviewOrder(o)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <div>
              <div className="panel-row">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <ShoppingBag size={18} color="var(--accent-violet)" />
                  <strong style={{ fontSize: "1.1rem" }}>
                    Order #{o.id.substring(0, 8)}
                  </strong>
                </div>
                <span
                  className={`status-pill ${
                    o.status === "delivered"
                      ? "success"
                      : o.status === "cancelled"
                        ? "danger"
                        : "warning"
                  }`}
                >
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>

              <div
                style={{
                  margin: "14px 0",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                }}
              >
                <div>
                  Merchant Store:{" "}
                  <strong style={{ color: "var(--text-slate)" }}>
                    {o.restaurant_name}
                  </strong>
                </div>
                <div>
                  Customer: <strong>{o.customer_name}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "8px",
                  }}
                >
                  <Clock size={12} /> Placed:{" "}
                  {new Date(o.placed_at).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--cred-border, rgba(0,0,0,0.06))",
                  fontSize: "0.9rem",
                }}
              >
                <div style={{ fontWeight: 600 }}>Total Payable:</div>
                <strong style={{ fontSize: "1.1rem" }}>
                  ${parseFloat(o.total_payable.toString()).toFixed(2)}
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
                Inspect & Dispatch
              </button>

              <button
                onClick={(e) => handleDeleteOrder(o.id, e)}
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

        {orders.length === 0 && (
          <div className="full-span-card">
            <p className="text-muted">No orders found in the database logs.</p>
          </div>
        )}
      </div>

      {/* Backdrop for preview drawer */}
      {selectedDetailedOrder && (
        <div
          className="preview-drawer-backdrop"
          onClick={() => setSelectedDetailedOrder(null)}
        />
      )}

      {/* Slide-out inspect drawer */}
      <div className={`preview-drawer ${selectedDetailedOrder ? "open" : ""}`}>
        {selectedDetailedOrder && (
          <>
            <div className="preview-drawer-header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                  Order Details
                </h3>
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                >
                  ID: #{selectedDetailedOrder.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="preview-drawer-body">
              {/* Timeline/Status */}
              <div
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "16px",
                }}
              >
                <span
                  className="premium-badge success"
                  style={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                >
                  {selectedDetailedOrder.status.replace(/_/g, " ")}
                </span>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Placed on{" "}
                  {new Date(selectedDetailedOrder.placed_at).toLocaleString()}
                </div>
              </div>

              {/* Merchant Details */}
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <Store size={18} color="var(--accent-orange)" />
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    Restaurant
                  </div>
                  <strong style={{ fontSize: "0.95rem" }}>
                    {selectedDetailedOrder.restaurant_name}
                  </strong>
                </div>
              </div>

              {/* Client details */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <User size={18} color="var(--accent-violet)" />
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    Customer Info
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    {selectedDetailedOrder.customer_first_name}{" "}
                    {selectedDetailedOrder.customer_last_name}
                  </div>
                  <div
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    Phone: {selectedDetailedOrder.customer_phone || "N/A"}
                  </div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <MapPin size={18} color="var(--cred-accent)" />
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    Delivery Destination
                  </div>
                  <div
                    style={{ fontSize: "0.9rem", color: "var(--text-slate)" }}
                  >
                    {selectedDetailedOrder.street_address}
                    {selectedDetailedOrder.landmark &&
                      `, Near ${selectedDetailedOrder.landmark}`}
                    {`, ${selectedDetailedOrder.city}, ${selectedDetailedOrder.state} - ${selectedDetailedOrder.postal_code}`}
                  </div>
                </div>
              </div>

              {/* Itemized Recipe */}
              <div>
                <h4
                  style={{
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "12px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Items Ordered
                </h4>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {selectedDetailedOrder.items &&
                    selectedDetailedOrder.items.map(
                      (item: any, idx: number) => (
                        <div key={idx} className="preview-item-row">
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>
                              {item.item_name}
                            </strong>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--text-muted)",
                                marginLeft: "8px",
                              }}
                            >
                              x{item.quantity}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                            $
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      ),
                    )}
                </div>
              </div>

              {/* Financial Bill */}
              <div>
                <h4
                  style={{
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: "12px",
                    letterSpacing: "0.5px",
                  }}
                >
                  Billing Details
                </h4>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <div className="preview-receipt-line">
                    <span>Items Subtotal</span>
                    <span>
                      ${parseFloat(selectedDetailedOrder.item_total).toFixed(2)}
                    </span>
                  </div>
                  <div className="preview-receipt-line">
                    <span>Delivery Charges</span>
                    <span>
                      $
                      {parseFloat(
                        selectedDetailedOrder.delivery_charges,
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="preview-receipt-line">
                    <span>Taxes</span>
                    <span>
                      ${parseFloat(selectedDetailedOrder.tax_amount).toFixed(2)}
                    </span>
                  </div>
                  {parseFloat(selectedDetailedOrder.discount_amount) > 0 && (
                    <div
                      className="preview-receipt-line"
                      style={{ color: "var(--cred-success)" }}
                    >
                      <span>Discount Saved</span>
                      <span>
                        -$
                        {parseFloat(
                          selectedDetailedOrder.discount_amount,
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="preview-receipt-line total">
                    <span>Total Payable</span>
                    <span>
                      $
                      {parseFloat(selectedDetailedOrder.total_payable).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action dispatch panel inside drawer */}
            <div className="preview-drawer-footer">
              <form
                onSubmit={handleUpdateOrder}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div className="premium-form-group">
                    <label>Order Status</label>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="premium-form-input"
                      style={{ fontSize: "0.85rem", padding: "10px" }}
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

                  <div className="premium-form-group">
                    <label>Assign Rider</label>
                    <select
                      value={deliveryPartnerId}
                      onChange={(e) => setDeliveryPartnerId(e.target.value)}
                      className="premium-form-input"
                      style={{ fontSize: "0.85rem", padding: "10px" }}
                    >
                      <option value="">Unassigned</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.first_name} {d.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="premium-form-group">
                  <label>Override Total Payable ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalPayable}
                    onChange={(e) => setTotalPayable(e.target.value)}
                    className="premium-form-input"
                    style={{ fontSize: "0.85rem", padding: "10px" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={dispatchLoading}
                  className="neo-btn neo-btn-primary"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "0.95rem",
                  }}
                >
                  {dispatchLoading
                    ? "Updating Dispatch..."
                    : "Apply Dispatch Actions"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
