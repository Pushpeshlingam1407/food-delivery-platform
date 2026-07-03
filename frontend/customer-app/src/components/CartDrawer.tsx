import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Percent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQty: (itemId: string, newQty: number) => void;
  clearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateQty,
  clearCart,
}) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const tax = subtotal * 0.18; // 18% GST
  const deliveryFee = subtotal > 0 ? 2.0 : 0;
  const total = subtotal - discount + tax + deliveryFee;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await api.get(`/admin/coupons`); // Fetch active coupons list
      if (response.data.status === "success") {
        const coupons = response.data.data;
        const coupon = coupons.find(
          (c: any) =>
            c.code.toLowerCase() === couponCode.toLowerCase() && c.is_active,
        );

        if (coupon) {
          const discountAmt =
            (subtotal * parseFloat(coupon.discount_percent.toString())) / 100;
          setDiscount(discountAmt);
          setAppliedCouponId(coupon.id);
          toast.success("Coupon applied successfully!", {
            description: `${coupon.discount_percent}% discount applied.`,
          });
        } else {
          toast.error("Invalid or expired coupon code.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate coupon.");
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    onClose();
    navigate("/checkout", {
      state: {
        cartItems,
        subtotal,
        couponId: appliedCouponId,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "420px",
        background: "var(--bg-sand)",
        borderLeft: "1px solid var(--glass-border)",
        boxShadow: "-8px 0 32px rgba(25, 25, 25, 0.08)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-apple)",
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShoppingCart size={20} />
          <h3 style={{ fontFamily: "var(--font-cohere)", fontSize: "1.2rem" }}>
            Your Basket
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-slate)",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Cart Items list */}
      <div style={{ flexGrow: 1, overflowY: "auto", padding: "24px" }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: "1px solid var(--glass-border)",
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <h4
                style={{
                  fontFamily: "var(--font-cohere)",
                  fontSize: "1rem",
                  marginBottom: "4px",
                }}
              >
                {item.name}
              </h4>
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                ${item.price.toFixed(2)} x {item.qty}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <input
                type="number"
                min={0}
                value={item.qty}
                onChange={(e) =>
                  updateQty(item.id, parseInt(e.target.value) || 0)
                }
                style={{
                  width: "50px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--glass-border)",
                  textAlign: "center",
                }}
              />
              <button
                onClick={() => updateQty(item.id, 0)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "red",
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {cartItems.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Your basket is empty
          </div>
        )}
      </div>

      {/* Drawer Footer details */}
      <div
        style={{
          padding: "24px",
          background: "rgba(25, 25, 25, 0.02)",
          borderTop: "1px solid var(--glass-border)",
        }}
      >
        {/* Coupon code */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FFF",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-standard)",
              padding: "6px 12px",
              flexGrow: 1,
              gap: "8px",
            }}
          >
            <Percent size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="PROMOCODE"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.85rem",
                textTransform: "uppercase",
              }}
            />
          </div>
          <button
            onClick={handleApplyCoupon}
            style={{
              background: "var(--text-slate)",
              color: "var(--text-sand)",
              border: "none",
              borderRadius: "var(--radius-standard)",
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Apply
          </button>
        </div>

        {/* Breakdown rates */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "0.9rem",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#4CAF50",
              }}
            >
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>GST (18%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--glass-border)",
              margin: "8px 0",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            <span>Total Pay</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={checkoutLoading || cartItems.length === 0}
          className="btn-premium"
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "1rem",
            opacity: checkoutLoading ? 0.7 : 1,
            cursor: checkoutLoading ? "not-allowed" : "pointer",
          }}
        >
          {checkoutLoading ? "Processing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};
