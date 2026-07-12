import React from "react";
import {
  ChevronRight,
  Clock3,
  Headphones,
  MapPin,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  Star,
  Store,
  Truck,
} from "lucide-react";
import {
  formatDate,
  formatOrderNumber,
  formatMoney,
  formatTime,
  getItemName,
  isActive,
  type Order,
} from "./orderUtils";

interface OrderCardProps {
  order: Order;
  reordering: boolean;
  onOpen: (order: Order) => void;
  onTrack: (order: Order) => void;
  onReorder: (order: Order) => void;
  onRate: (order: Order) => void;
  onHelp: (order: Order) => void;
}

const stopAndRun =
  (callback: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    callback();
  };

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  reordering,
  onOpen,
  onTrack,
  onReorder,
  onRate,
  onHelp,
}) => {
  const active = isActive(order.status);
  const items = order.items || [];
  const previewItems = items.slice(0, 3);
  const hiddenItemCount = Math.max(0, items.length - previewItems.length);

  const statusLabel = order.status.replace(/_/g, " ");
  const statusClass = active
    ? "order-status-chip--active"
    : order.status === "cancelled"
      ? "order-status-chip--cancelled"
      : "order-status-chip--delivered";

  return (
    <article
      className={`order-surface order-card ${!active ? "order-card--clickable" : ""}`}
      onClick={() => onOpen(order)}
    >
      <div className="order-card-top">
        <div className="order-store-mark">
          <Store size={20} />
        </div>

        <div className="order-card-main">
          <div className="order-card-title-row">
            <div>
              <h2>{order.restaurant_name}</h2>
              <p>
                {formatOrderNumber(order.order_number)} -{" "}
                {formatDate(order.placed_at)} at {formatTime(order.placed_at)}
              </p>
            </div>
            <span className={`order-status-chip ${statusClass}`}>
              {active ? "Live order" : statusLabel}
            </span>
          </div>

          <div className="order-progress-strip">
            <div className="order-progress-icon">
              {active ? <Truck size={18} /> : <PackageCheck size={18} />}
            </div>
            <div>
              <strong>
                {active ? "Track your delivery" : "Tap to view receipt"}
              </strong>
              <span>
                {active
                  ? "See live updates, rider movement, and order progress."
                  : "Review items, bill summary, address, and support options."}
              </span>
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
              {active ? "Live updates" : "Past order"}
            </div>
          </div>
        </div>
      </div>

      <div className="order-card-actions">
        {active && (
          <button
            type="button"
            onClick={stopAndRun(() => onTrack(order))}
            className="order-action-button order-action-button--primary"
          >
            Track live <ChevronRight size={16} />
          </button>
        )}

        {order.status === "delivered" && (
          <button
            type="button"
            onClick={stopAndRun(() => onReorder(order))}
            className="order-action-button order-action-button--reorder"
            disabled={reordering}
          >
            <RotateCcw size={15} />
            {reordering ? "Adding..." : "Order again"}
          </button>
        )}

        {order.status === "delivered" && (
          <button
            type="button"
            onClick={stopAndRun(() => onRate(order))}
            className="order-action-button order-action-button--ghost"
          >
            <Star size={15} />
            Rate
          </button>
        )}

        <button
          type="button"
          className="order-action-button order-action-button--ghost"
          onClick={stopAndRun(() => onHelp(order))}
        >
          <Headphones size={15} />
          Help
        </button>

        {!active && (
          <button
            type="button"
            className="order-action-button order-action-button--ghost"
            onClick={stopAndRun(() => onOpen(order))}
          >
            <ReceiptText size={15} />
            View details
          </button>
        )}
      </div>
    </article>
  );
};
