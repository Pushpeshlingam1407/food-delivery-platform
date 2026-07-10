import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Percent, Trash2, Plus } from "lucide-react";
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
  addToCart: (item: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateQty,
  addToCart,
}) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);

  // Custom Swiggy/Blinkit features
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const tax = subtotal * 0.18; // 18% GST
  const deliveryFee = subtotal > 0 ? 2.0 : 0;
  const total = subtotal - discount + tax + deliveryFee;

  // Load coupons and recommended items
  useEffect(() => {
    if (!isOpen) return;

    const loadDrawerFeatures = async () => {
      try {
        // 1. Fetch available coupons
        const couponRes = await api.get("/admin/coupons");
        if (couponRes.data.status === "success") {
          const now = new Date();
          const active = couponRes.data.data.filter((c: any) => {
            const start = new Date(c.start_date);
            const end = new Date(c.end_date);
            return c.is_active && now >= start && now <= end;
          });
          setAvailableCoupons(active);
        }

        // 2. Fetch cart to find restaurant_id and fetch menu for recommendations
        if (cartItems.length > 0) {
          const cartRes = await api.get("/cart");
          if (
            cartRes.data.status === "success" &&
            cartRes.data.data.restaurant_id
          ) {
            const restId = cartRes.data.data.restaurant_id;
            const itemsRes = await api.get(`/restaurants/${restId}/items`);
            if (itemsRes.data.status === "success") {
              const menuItems = itemsRes.data.data || [];
              const cartItemIds = cartItems.map((ci) => ci.id);
              // Filter out items already in cart
              const remaining = menuItems.filter(
                (mi: any) => !cartItemIds.includes(mi.id),
              );
              setRecommendedItems(remaining.slice(0, 3)); // show top 3 recommendations
            }
          }
        } else {
          setRecommendedItems([]);
        }
      } catch (err) {
        console.error("Load cart drawer enhancements failed:", err);
      }
    };

    loadDrawerFeatures();
  }, [isOpen, cartItems.length]);

  const handleApplyCouponCode = async (code: string) => {
    try {
      const response = await api.get(`/admin/coupons`);
      if (response.data.status === "success") {
        const coupons = response.data.data;
        const coupon = coupons.find(
          (c: any) =>
            c.code.toLowerCase() === code.toLowerCase() && c.is_active,
        );

        if (coupon) {
          const now = new Date();
          const startDate = new Date(coupon.start_date);
          const endDate = new Date(coupon.end_date);
          if (now < startDate || now > endDate) {
            toast.error("This coupon has expired or is not active yet.");
            return;
          }

          if (subtotal < parseFloat(coupon.min_order_amount.toString())) {
            toast.error(
              `Minimum order amount of $${parseFloat(
                coupon.min_order_amount.toString(),
              ).toFixed(2)} required for this coupon.`,
            );
            return;
          }

          let discountAmt = 0;
          if (coupon.discount_type === "percentage") {
            discountAmt =
              (subtotal * parseFloat(coupon.discount_value.toString())) / 100;
            if (coupon.max_discount_amount) {
              discountAmt = Math.min(
                discountAmt,
                parseFloat(coupon.max_discount_amount.toString()),
              );
            }
          } else {
            discountAmt = parseFloat(coupon.discount_value.toString());
          }
          discountAmt = Math.min(discountAmt, subtotal);
          discountAmt = parseFloat(discountAmt.toFixed(2));

          setDiscount(discountAmt);
          setAppliedCouponId(coupon.id);
          setCouponCode(coupon.code);

          const discountMsg =
            coupon.discount_type === "percentage"
              ? `${coupon.discount_value}% discount applied.`
              : `$${parseFloat(coupon.discount_value.toString()).toFixed(2)} discount applied.`;

          toast.success("Coupon applied successfully!", {
            description: discountMsg,
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

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    handleApplyCouponCode(couponCode);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const appliedCoupon = appliedCouponId ? couponCode : null;
    onClose();
    navigate("/checkout", {
      state: {
        cartItems,
        subtotal,
        couponId: appliedCouponId,
        couponCode: appliedCoupon,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close cart drawer"
        className="drawer-backdrop drawer-backdrop--soft"
        onClick={onClose}
      />
      <div
        className="cart-drawer"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "var(--bg-sand)",
          borderLeft: "1px solid var(--glass-border)",
          boxShadow: "-8px 0 32px rgba(25, 25, 25, 0.08)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-apple)",
        }}
      >
        <div
          className="cart-drawer-header"
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
            <h3
              style={{ fontFamily: "var(--font-cohere)", fontSize: "1.2rem" }}
            >
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

        <div
          className="cart-drawer-body"
          style={{ flexGrow: 1, overflowY: "auto", padding: "24px" }}
        >
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="cart-drawer-item"
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
                <span
                  style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}
                >
                  ${item.price.toFixed(2)} x {item.qty}
                </span>
              </div>

              <div
                className="cart-drawer-item-controls"
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
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

          {/* Blinkit Recommended Items Section */}
          {cartItems.length > 0 && recommendedItems.length > 0 && (
            <div
              style={{
                marginTop: "32px",
                borderTop: "2px dashed var(--glass-border)",
                paddingTop: "20px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontFamily: "var(--font-cohere)",
                  fontSize: "0.95rem",
                  color: "var(--text-slate)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Add to your order?
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {recommendedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "rgba(25,25,25,0.02)",
                      borderRadius: "8px",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        ${parseFloat(item.price).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        border: "1px solid var(--accent-orange)",
                        borderRadius: "4px",
                        color: "var(--accent-orange)",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Plus size={12} /> ADD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: "24px",
              background: "rgba(25, 25, 25, 0.02)",
              borderTop: "1px solid var(--glass-border)",
            }}
          >
            {/* Coupon Browse list */}
            {availableCoupons.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  Available Coupons
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                  }}
                >
                  {availableCoupons.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleApplyCouponCode(c.code)}
                      style={{
                        background:
                          appliedCouponId === c.id
                            ? "rgba(76, 175, 80, 0.1)"
                            : "#fff",
                        border:
                          appliedCouponId === c.id
                            ? "1px solid #4CAF50"
                            : "1px solid var(--glass-border)",
                        color:
                          appliedCouponId === c.id
                            ? "#4CAF50"
                            : "var(--text-slate)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      🏷️ {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className="cart-drawer-coupon"
              style={{ display: "flex", gap: "12px", marginBottom: "24px" }}
            >
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
              disabled={cartItems.length === 0}
              className="btn-premium"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
              }}
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </>
  );
};
