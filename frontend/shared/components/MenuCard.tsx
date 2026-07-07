import React from "react";
import { Minus, Plus } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_veg: boolean | number;
}

interface MenuCardProps {
  item: MenuItem;
  qty: number;
  onAdd: (item: any) => void;
  onRemove: (itemId: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  qty,
  onAdd,
  onRemove,
}) => {
  const isVeg = !!item.is_veg;

  return (
    <div
      className="card-premium"
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        gap: "20px",
      }}
    >
      <div style={{ flexGrow: 1, textAlign: "left" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              border: `1px solid ${isVeg ? "#4CAF50" : "#F44336"}`,
              padding: "2px 6px",
              fontSize: "0.65rem",
              fontWeight: 800,
              color: isVeg ? "#4CAF50" : "#F44336",
              borderRadius: "4px",
            }}
          >
            {isVeg ? "VEG 🌱" : "NON-VEG 🍖"}
          </span>
          <h4
            style={{
              fontFamily: "var(--font-cohere)",
              fontSize: "1.15rem",
              margin: 0,
            }}
          >
            {item.name}
          </h4>
        </div>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginBottom: "12px",
          }}
        >
          {item.description || "No description available"}
        </p>
        <strong style={{ fontSize: "1.1rem", color: "var(--text-slate)" }}>
          ${parseFloat(item.price.toString()).toFixed(2)}
        </strong>
      </div>

      <div style={{ flexShrink: 0 }}>
        {qty > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              border: "1px solid var(--glass-border)",
              borderRadius: "100px",
              padding: "6px 16px",
              background: "rgba(25, 25, 25, 0.02)",
            }}
          >
            <button
              onClick={() => onRemove(item.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Minus size={16} />
            </button>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {qty}
            </span>
            <button
              onClick={() => onAdd(item)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            style={{
              background: "var(--text-slate)",
              color: "var(--text-sand)",
              border: "none",
              borderRadius: "100px",
              padding: "8px 24px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
};
