import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Headphones,
  MapPin,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Search,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";
import { FeedbackModal } from "../components/FeedbackModal";

interface OrderItem {
  id: string;
  menu_id: string;
  item_name?: string;
  name?: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
}

interface Order {
  id: string;
  order_number: string;
  restaurant_name: string;
  status:
    | "placed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  total_payable: number | string;
  item_total?: number | string;
  delivery_charges?: number | string;
  tax_amount?: number | string;
  discount_amount?: number | string;
  placed_at: string;
  delivered_at?: string | null;
  street_address?: string;
  city?: string;
  items?: OrderItem[];
}

interface OrdersProps {
  addToCart?: (item: { id: string; name: string; price: number }) => void;
}

type OrderFilter = "all" | "active" | "past";

const ACTIVE_STATUSES = [
  "placed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
];

const statusCopy: Record<string, { label: string; detail: string }> = {
  placed: {
    label: "Order placed",
    detail: "The store is confirming your order.",
  },
  preparing: {
    label: "Being prepared",
    detail: "Your items are getting packed now.",
  },
  ready_for_pickup: {
    label: "Ready for pickup",
    detail: "A delivery partner will pick it up soon.",
  },
  out_for_delivery: {
    label: "On the way",
    detail: "Track the rider live from here.",
  },
  delivered: {
    label: "Delivered",
    detail: "Hope everything reached you perfectly.",
  },
  cancelled: {
    label: "Cancelled",
    detail: "This order was cancelled.",
  },
};

const formatMoney = (value: number | string | undefined) =>
  `$${parseFloat((value || 0).toString()).toFixed(2)}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const isActive = (status: string) => ACTIVE_STATUSES.includes(status);

const getItemName = (item: OrderItem) =>
  item.item_name || item.name || "Menu item";

export const Orders: React.FC<OrdersProps> = ({ addToCart }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get("/orders");
      if (response.data.status === "success") {
        const orderList: Order[] = response.data.data || [];
        const enrichedOrders = await Promise.all(
          orderList.map(async (order) => {
            try {
              const detailResponse = await api.get(`/orders/${order.id}`);
              return detailResponse.data.status === "success"
                ? { ...order, ...detailResponse.data.data }
                : order;
            } catch {
              return order;
            }
          }),
        );
        setOrders(enrichedOrders);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && isActive(order.status)) ||
        (filter === "past" && !isActive(order.status));

      const itemText = (order.items || [])
        .map((item) => getItemName(item))
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        order.restaurant_name.toLowerCase().includes(normalizedQuery) ||
        order.order_number.toLowerCase().includes(normalizedQuery) ||
        itemText.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, orders, query]);

  const activeCount = orders.filter((order) => isActive(order.status)).length;
  const pastCount = orders.length - activeCount;

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
      let items = order.items || [];
      if (items.length === 0) {
        const response = await api.get(`/orders/${order.id}`);
        items = response.data.data?.items || [];
      }

      if (!items.length) {
        toast.error("Could not find items for this order.");
        return;
      }

      for (const item of items) {
        const quantity = Math.max(1, Number(item.quantity || 1));
        for (let i = 0; i < quantity; i += 1) {
          addToCart?.({
            id: item.menu_id,
            name: getItemName(item),
            price: parseFloat(item.unit_price.toString()),
          });
        }
      }

      toast.success("Added previous order to your cart.");
    } catch (err) {
      console.error("Reorder failed:", err);
      toast.error("Could not reorder. Please try again.");
    } finally {
      setReorderingId(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-loading-state">
        <ShoppingBag size={28} />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={16} /> Back
      </button>

      <section className="orders-hero">
        <div>
          <p className="orders-kicker">Order history</p>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            Track live deliveries, repeat favorites, rate past orders, and get
            help from one place.
          </p>
        </div>
        <div className="orders-hero-stats" aria-label="Order summary">
          <div>
            <strong>{activeCount}</strong>
            <span>Active</span>
          </div>
          <div>
            <strong>{pastCount}</strong>
            <span>Past</span>
          </div>
        </div>
      </section>

      <div className="orders-toolbar">
        <div className="orders-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search restaurant, item, or order ID"
          />
        </div>
        <div className="orders-tabs" aria-label="Filter orders">
          {[
            ["all", "All", orders.length],
            ["active", "Active", activeCount],
            ["past", "Past", pastCount],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key as OrderFilter)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.map((order) => {
          const status = statusCopy[order.status] || {
            label: order.status.replace(/_/g, " "),
            detail: "Order details are available.",
          };
          const items = order.items || [];
          const previewItems = items.slice(0, 3);
          const hiddenItemCount = Math.max(0, items.length - previewItems.length);

          return (
            <article key={order.id} className="order-card">
              <div className="order-card-top">
                <div className="order-store-mark">
                  <Store size={20} />
                </div>
                <div className="order-card-main">
                  <div className="order-card-title-row">
                    <div>
                      <h2>{order.restaurant_name}</h2>
                      <p>
                        #{order.order_number} · {formatDate(order.placed_at)} at{" "}
                        {formatTime(order.placed_at)}
                      </p>
                    </div>
                    <span
                      className={`order-status-chip ${
                        isActive(order.status)
                          ? "order-status-chip--active"
                          : order.status === "cancelled"
                            ? "order-status-chip--cancelled"
                            : "order-status-chip--delivered"
                      }`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="order-progress-strip">
                    <div className="order-progress-icon">
                      {isActive(order.status) ? (
                        <Truck size={18} />
                      ) : (
                        <PackageCheck size={18} />
                      )}
                    </div>
                    <div>
                      <strong>{status.label}</strong>
                      <span>{status.detail}</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {previewItems.length > 0 ? (
                      previewItems.map((item) => (
                        <span key={item.id}>
                          {item.quantity}x {getItemName(item)}
                        </span>
                      ))
                    ) : (
                      <span>Items will appear here once details load.</span>
                    )}
                    {hiddenItemCount > 0 && <span>+{hiddenItemCount} more</span>}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-meta-pill">
                      <ReceiptText size={15} />
                      {formatMoney(order.total_payable)}
                    </div>
                    {order.street_address && (
                      <div className="order-meta-pill">
                        <MapPin size={15} />
                        {order.street_address}
                        {order.city ? `, ${order.city}` : ""}
                      </div>
                    )}
                    <div className="order-meta-pill">
                      <Clock3 size={15} />
                      {isActive(order.status) ? "Live updates" : "Past order"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-card-actions">
                {isActive(order.status) && (
                  <button
                    type="button"
                    onClick={() => navigate(`/track/${order.id}`)}
                    className="btn-premium order-primary-action"
                  >
                    Track live <ChevronRight size={16} />
                  </button>
                )}
                {order.status === "delivered" && (
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="btn-reorder"
                    disabled={reorderingId === order.id}
                  >
                    <RotateCcw size={15} />
                    {reorderingId === order.id ? "Adding..." : "Order again"}
                  </button>
                )}
                {order.status === "delivered" && (
                  <button
                    type="button"
                    onClick={() => setFeedbackOrderId(order.id)}
                    className="order-ghost-action"
                  >
                    <Star size={15} />
                    Rate
                  </button>
                )}
                <button type="button" className="order-ghost-action">
                  <Headphones size={15} />
                  Help
                </button>
              </div>
            </article>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="orders-empty-state">
            <ShoppingBag size={48} className="orders-empty-icon" />
            <h2>{orders.length === 0 ? "No orders yet" : "No matching orders"}</h2>
            <p>
              {orders.length === 0
                ? "Your first delivery will show up here with tracking, reorder, rating, and support options."
                : "Try searching another restaurant, item, or order ID."}
            </p>
            <button onClick={() => navigate("/")} className="btn-premium">
              Explore stores
            </button>
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={feedbackOrderId !== null}
        onClose={() => setFeedbackOrderId(null)}
        orderId={feedbackOrderId || ""}
      />
    </div>
  );
};
