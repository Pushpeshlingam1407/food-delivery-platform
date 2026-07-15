import React from "react";
import { Minus, Plus, Star } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_veg: boolean | number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  is_available?: boolean | number;
  available_quantity?: number;
  unlimited?: boolean | number;
}

interface MenuCardProps {
  item: MenuItem;
  qty?: number;
  onAdd?: (item: any) => void;
  onRemove?: (itemId: string) => void;
  renderFooterActions?: (item: MenuItem) => React.ReactNode;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  qty = 0,
  onAdd,
  onRemove,
  renderFooterActions,
}) => {
  const isVeg = !!item.is_veg;
  const formattedPrice = `₹${parseFloat(item.price.toString()).toFixed(2)}`;
  const isOutOfStock =
    (item.is_available !== undefined && !item.is_available) ||
    (!item.unlimited &&
      item.available_quantity !== undefined &&
      item.available_quantity <= 0);

  return (
    <div
      className={`restaurant-menu-card ${isOutOfStock ? "out-of-stock" : ""}`}
    >
      <div className="menu-card-image">
        {item.image_url ? (chna
          <img src={item.image_url} alt={item.name} />
        ) : (
          <div className="menu-card-image-placeholder">No Image</div>
        )}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">Out of stock</div>
        )}
      </div>

      <div className="menu-card-body">
        <div className="menu-card-topline">
          <span
            className={`menu-card-badge ${
              isVeg ? "menu-card-badge--veg" : "menu-card-badge--nonveg"
            }`}
          >
            {isVeg ? "VEG 🌱" : "NON-VEG 🍖"}
          </span>

          {item.rating !== undefined && (
            <span className="menu-card-rating">
              <Star size={14} /> {item.rating.toFixed(1)}
              {item.review_count ? ` (${item.review_count})` : ""}
            </span>
          )}
        </div>

        <h4 className="menu-card-title">{item.name}</h4>

        <p className="menu-card-description">
          {item.description || "No description available."}
        </p>

        <div className="menu-card-footer">
          <strong className="menu-card-price">{formattedPrice}</strong>

          {renderFooterActions ? (
            renderFooterActions(item)
          ) : isOutOfStock ? (
            <button
              type="button"
              className="menu-card-add-button out-of-stock-btn"
              disabled
            >
              Out of stock
            </button>
          ) : qty > 0 ? (
            <div className="menu-card-qty-control">
              <button
                type="button"
                onClick={() => onRemove && onRemove(item.id)}
                aria-label={`Remove one ${item.name}`}
              >
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => onAdd && onAdd(item)}
                aria-label={`Add one ${item.name}`}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="menu-card-add-button"
              onClick={() => onAdd && onAdd(item)}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
