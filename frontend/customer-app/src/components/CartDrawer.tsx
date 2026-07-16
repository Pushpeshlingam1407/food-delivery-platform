import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Percent, Trash2, Plus } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

import { useAppContext } from "../../../shared/context/AppContext";
import { formatIndianCurrency } from "../../../shared/utils/currency";
import "./CartDrawer.css";

export const CartDrawer: React.FC = () => {
  const {
    cartOpen: isOpen,
    setCartOpen,
    cartList: cartItems,
    updateQty,
    addToCart,
  } = useAppContext();

  const onClose = () => setCartOpen(false);

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  // Custom cart features
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

  // Automatically clear coupon if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      setAppliedCouponId(null);
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponCode("");
    }
  }, [cartItems.length]);

  // Recalculate discount or remove if subtotal changes
  useEffect(() => {
    if (appliedCoupon && cartItems.length > 0) {
      if (subtotal < parseFloat(appliedCoupon.min_order_amount.toString())) {
        setAppliedCouponId(null);
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode("");
        notify.warning(
          `Coupon '${appliedCoupon.code}' removed: minimum order of ₹${parseFloat(
            appliedCoupon.min_order_amount.toString(),
          ).toFixed(2)} required.`,
        );
      } else {
        let discountAmt = 0;
        if (appliedCoupon.discount_type === "percentage") {
          discountAmt =
            (subtotal * parseFloat(appliedCoupon.discount_value.toString())) / 100;
          if (appliedCoupon.max_discount_amount) {
            discountAmt = Math.min(
              discountAmt,
              parseFloat(appliedCoupon.max_discount_amount.toString()),
            );
          }
        } else {
          discountAmt = parseFloat(appliedCoupon.discount_value.toString());
        }
        discountAmt = Math.min(discountAmt, subtotal);
        discountAmt = parseFloat(discountAmt.toFixed(2));
        setDiscount(discountAmt);
      }
    }
  }, [subtotal, appliedCoupon]);

  const handleRemoveCoupon = () => {
    setAppliedCouponId(null);
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    notify.success("Coupon removed.");
  };

  const handleApplyCouponCode = async (code: string) => {
    if (appliedCouponId) {
      notify.warning("A coupon has already been applied.");
      return;
    }
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
            notify.warning("This coupon is no longer active.");
            return;
          }

          if (subtotal < parseFloat(coupon.min_order_amount.toString())) {
            notify.warning(
              `Add a bit more! Minimum order of ${formatIndianCurrency(coupon.min_order_amount)} required for this coupon.`,
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
          setAppliedCoupon(coupon);
          setCouponCode(coupon.code);

          const discountMsg =
            coupon.discount_type === "percentage"
              ? `${coupon.discount_value}% discount applied.`
              : `${formatIndianCurrency(coupon.discount_value)} discount applied.`;

          notify.success("Coupon applied!", {
            description: discountMsg,
          });
        } else {
          notify.error("That coupon code doesn't look quite right.");
        }
      }
    } catch (error) {
      console.error(error);
      notify.error("We couldn't apply that coupon right now.");
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    handleApplyCouponCode(couponCode);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      notify.warning("Your cart is looking a bit empty!");
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
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <div className="cart-drawer-header-left">
            <ShoppingCart size={20} />
            <h3 className="cart-drawer-title">Your Basket</h3>
          </div>
          <button onClick={onClose} className="cart-drawer-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="cart-drawer-item cart-drawer-item-container"
            >
              <div className="cart-drawer-item-grow">
                <h4 className="cart-drawer-item-name">{item.name}</h4>
                <span className="cart-drawer-item-price-qty">
                  {formatIndianCurrency(item.price)} x {item.qty}
                </span>
              </div>

              <div className="cart-drawer-item-controls cart-drawer-item-controls-wrapper">
                <input
                  type="number"
                  min={0}
                  value={item.qty}
                  onChange={(e) =>
                    updateQty(item.id, parseInt(e.target.value) || 0)
                  }
                  className="cart-drawer-item-qty-input"
                />
                <button
                  onClick={() => updateQty(item.id, 0)}
                  className="cart-drawer-item-trash-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="cart-drawer-empty-message">
              Your basket is empty
            </div>
          )}

          {/* Recommended Items Section */}
          {cartItems.length > 0 && recommendedItems.length > 0 && (
            <div className="cart-drawer-recommended-section">
              <h4 className="cart-drawer-recommended-title">
                Add to your order?
              </h4>
              <div className="cart-drawer-recommended-list">
                {recommendedItems.map((item) => (
                  <div key={item.id} className="cart-drawer-recommended-item">
                    <div>
                      <div className="cart-drawer-recommended-item-info">
                        {item.name}
                      </div>
                      <div className="cart-drawer-recommended-item-price">
                        {formatIndianCurrency(item.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="cart-drawer-recommended-add-btn"
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
          <div className="cart-drawer-footer cart-drawer-footer-wrapper">
            {/* Coupon Browse list */}
            {availableCoupons.length > 0 && (
              <div className="cart-drawer-coupons-section">
                <div className="cart-drawer-coupons-title">
                  Available Coupons
                </div>
                <div className="cart-drawer-coupons-scroll">
                  {availableCoupons.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleApplyCouponCode(c.code)}
                      disabled={!!appliedCouponId}
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
                        cursor: appliedCouponId ? "not-allowed" : "pointer",
                        opacity: appliedCouponId && appliedCouponId !== c.id ? 0.5 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="cart-drawer-coupon cart-drawer-coupon-pills-container">
              <div className="cart-drawer-coupon-input-wrapper" style={{ opacity: appliedCouponId ? 0.7 : 1 }}>
                <Percent size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="PROMOCODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCouponId}
                  className="cart-drawer-coupon-input"
                  style={{ cursor: appliedCouponId ? "not-allowed" : "text" }}
                />
              </div>
              {appliedCouponId ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    disabled
                    className="cart-drawer-coupon-apply-btn"
                    style={{
                      background: "#4CAF50",
                      borderColor: "#4CAF50",
                      color: "white",
                      cursor: "not-allowed",
                    }}
                  >
                    Applied
                  </button>
                  <button
                    onClick={handleRemoveCoupon}
                    className="cart-drawer-coupon-remove-btn"
                    style={{
                      background: "rgba(244, 67, 54, 0.1)",
                      color: "#f44336",
                      border: "1px solid #f44336",
                      padding: "8px 16px",
                      borderRadius: "99px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  className="cart-drawer-coupon-apply-btn"
                >
                  Apply
                </button>
              )}
            </div>

            <div className="cart-drawer-summary-section">
              <div className="cart-drawer-summary-row">
                <span>Subtotal</span>
                <span>{formatIndianCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="cart-drawer-summary-discount">
                  <span>Discount</span>
                  <span>-{formatIndianCurrency(discount)}</span>
                </div>
              )}
              <div className="cart-drawer-summary-row">
                <span>GST (18%)</span>
                <span>{formatIndianCurrency(tax)}</span>
              </div>
              <div className="cart-drawer-summary-row">
                <span>Delivery Fee</span>
                <span>{formatIndianCurrency(deliveryFee)}</span>
              </div>
              <hr className="cart-drawer-summary-divider" />
              <div className="cart-drawer-summary-total">
                <span>Total Pay</span>
                <span>{formatIndianCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="btn-premium cart-drawer-place-order-btn"
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </>
  );
};
