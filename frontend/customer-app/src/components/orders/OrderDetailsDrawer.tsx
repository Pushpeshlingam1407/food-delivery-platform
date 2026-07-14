import React from "react";
import { Headphones, PackageCheck, RotateCcw, X } from "lucide-react";
import {
  formatDate,
  formatOrderNumber,
  formatMoney,
  formatTime,
  getItemName,
  statusCopy,
  type Order,
} from "./orderUtils";

interface OrderDetailsDrawerProps {
  order: Order;
  reordering: boolean;
  onClose: () => void;
  onReorder: (order: Order) => void;
  onHelp: (order: Order) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  reordering,
  onClose,
  onReorder,
  onHelp,
}) => {
  const items = order.items || [];

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <aside
        className="order-surface order-details-panel"
        onClick={(event) => event.stopPropagation()}
        aria-label={`Order ${order.order_number} details`}
      >
        <div className="order-details-header">
          <div>
            <p>{formatOrderNumber(order.order_number)}</p>
            <h2>{order.restaurant_name}</h2>
            <span>
              {formatDate(order.placed_at)} at {formatTime(order.placed_at)}
            </span>
            <span className="order-id-label">ID: {order.id}</span>
          </div>
          <button
            type="button"
            className="order-details-close"
            onClick={onClose}
            aria-label="Close order details"
          >
            <X size={19} />
          </button>
        </div>

        <div className="order-details-status">
          <PackageCheck size={18} />
          <div>
            <strong>
              {statusCopy[order.status]?.label ||
                order.status.replace(/_/g, " ")}
            </strong>
            <span>
              {order.delivered_at
                ? `Delivered on ${formatDate(order.delivered_at)}`
                : statusCopy[order.status]?.detail}
            </span>
          </div>
        </div>

        <section className="order-details-section">
          <h3>Items</h3>
          <div className="order-details-items">
            {items.map((item) => (
              <div key={item.id} className="order-details-item">
                <div>
                  <strong>{getItemName(item)}</strong>
                  <span>
                    {item.quantity} x {formatMoney(item.unit_price)}
                  </span>
                </div>
                <b>{formatMoney(item.total_price)}</b>
              </div>
            ))}
            {items.length === 0 && (
              <p className="order-details-muted">
                Item details are not available for this order.
              </p>
            )}
          </div>
        </section>

        <section className="order-details-section">
          <h3>Bill summary</h3>
          <div className="order-bill-row">
            <span>Item total</span>
            <b>{formatMoney(order.item_total)}</b>
          </div>
          <div className="order-bill-row">
            <span>Delivery fee</span>
            <b>{formatMoney(order.delivery_charges)}</b>
          </div>
          <div className="order-bill-row">
            <span>Taxes</span>
            <b>{formatMoney(order.tax_amount)}</b>
          </div>
          <div className="order-bill-row order-bill-row--discount">
            <span>Discount</span>
            <b>-{formatMoney(order.discount_amount)}</b>
          </div>
          <div className="order-bill-row order-bill-row--total">
            <span>Paid</span>
            <b>{formatMoney(order.total_payable)}</b>
          </div>
        </section>

        {order.street_address && (
          <section className="order-details-section">
            <h3>Delivered to</h3>
            <p className="order-details-address">
              {order.street_address}
              {order.city ? `, ${order.city}` : ""}
            </p>
          </section>
        )}

        <div className="order-details-actions">
          {order.status === "delivered" && (
            <button
              type="button"
              className="order-action-button order-action-button--reorder"
              onClick={() => onReorder(order)}
              disabled={reordering}
            >
              <RotateCcw size={15} />
              {reordering ? "Adding..." : "Order again"}
            </button>
          )}
          <button
            type="button"
            className="order-action-button order-action-button--ghost"
            onClick={() => onHelp(order)}
          >
            <Headphones size={15} />
            Help
          </button>
        </div>
      </aside>
    </div>
  );
};
