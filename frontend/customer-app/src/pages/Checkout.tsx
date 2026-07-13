import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, MapPin, DollarSign, ArrowLeft } from "lucide-react";
import notify from "../../../shared/utils/toast";
import { PremiumCard } from "../../../shared/components/PremiumCard";
import api from "../../../shared/services/api";

interface Address {
  id: string;
  street_address: string;
  landmark: string;
  city: string;
  postal_code: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve items passed from state
  const stateData = (location.state as {
    cartItems: CartItem[];
    subtotal: number;
    couponId: string | null;
    couponCode: string | null;
  }) || {
    cartItems: [],
    subtotal: 0,
    couponId: null,
    couponCode: null,
  };

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "wallet">("cod");
  const [loading, setLoading] = useState(false);

  // Form states for new address
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const tax = stateData.subtotal * 0.18;
  const deliveryFee = stateData.subtotal > 0 ? 2.0 : 0;
  const total = stateData.subtotal + tax + deliveryFee;

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const addrRes = await api.get("/addresses");
        if (addrRes.data.status === "success") {
          setAddresses(addrRes.data.data);
          if (addrRes.data.data.length > 0) {
            setSelectedAddressId(addrRes.data.data[0].id);
          }
        }

        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        }
      } catch (err) {
        console.error("Fetch checkout details failed:", err);
      }
    };

    fetchCheckoutData();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/addresses", {
        street_address: streetAddress,
        landmark,
        city,
        state: stateName,
        postal_code: postalCode,
        latitude: 12.9716, // Mock default coordinates
        longitude: 77.5946,
      });

      if (response.data.status === "success") {
        const newAddr = response.data.data;
        setAddresses((prev) => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        setShowNewAddressForm(false);
        notify.success("New address saved.");
      }
    } catch (err) {
      notify.error("We couldn't save your address.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      notify.warning("Where should we deliver this?");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < total) {
      notify.error("Not enough funds in your wallet. Please select COD.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/orders", {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        couponCode: stateData.couponCode,
        items: stateData.cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.qty,
        })),
      });

      if (response.data.status === "success") {
        notify.success("Order confirmed!", {
          description: "Forwarding to live tracking dashboard.",
        });
        const orderId = response.data.data.orderId;
        navigate(`/track/${orderId}`);
      }
    } catch (err: any) {
      console.error(err);
      notify.error(
        err.response?.data?.message ||
          "We couldn't place your order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          color: "var(--text-slate)",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "24px",
          fontFamily: "var(--font-cohere)",
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "32px" }}>
        Order Checkout
      </h1>

      <div className="checkout-layout-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Address select block */}
          <div className="card-premium">
            <h3
              style={{
                fontFamily: "var(--font-cohere)",
                fontSize: "1.2rem",
                marginBottom: "20px",
              }}
            >
              1. Delivery Address
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  style={{
                    display: "flex",
                    alignItems: "start",
                    gap: "12px",
                    padding: "16px",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-standard)",
                    cursor: "pointer",
                    background:
                      selectedAddressId === addr.id
                        ? "rgba(25, 25, 25, 0.02)"
                        : "#FFF",
                  }}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    style={{ marginTop: "4px" }}
                  />
                  <div style={{ fontSize: "0.95rem" }}>
                    <strong>{addr.street_address}</strong>
                    <div style={{ color: "var(--text-muted)" }}>
                      {addr.landmark ? `${addr.landmark}, ` : ""}
                      {addr.city} - {addr.postal_code}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {!showNewAddressForm ? (
              <button
                onClick={() => setShowNewAddressForm(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-orange)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                + Add New Address
              </button>
            ) : (
              <form
                onSubmit={handleAddAddress}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Street Address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid var(--glass-border)",
                      flex: 1,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid var(--glass-border)",
                      flex: 1,
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid var(--glass-border)",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    className="btn-premium"
                    style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method select block */}
          <PremiumCard>
            <h3
              style={{
                fontFamily: "var(--font-cohere)",
                fontSize: "1.2rem",
                marginBottom: "20px",
              }}
            >
              2. Payment Method
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-standard)",
                  cursor: "pointer",
                  background:
                    paymentMethod === "cod" ? "rgba(25, 25, 25, 0.02)" : "#FFF",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <DollarSign size={18} color="var(--accent-orange)" />
                <div style={{ fontSize: "0.95rem" }}>
                  <strong>Cash on Delivery (COD)</strong>
                  <div style={{ color: "var(--text-muted)" }}>
                    Pay at your doorstep.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-standard)",
                  cursor: "pointer",
                  background:
                    paymentMethod === "wallet"
                      ? "rgba(25, 25, 25, 0.02)"
                      : "#FFF",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                />
                <CreditCard size={18} color="var(--accent-violet)" />
                <div style={{ fontSize: "0.95rem" }}>
                  <strong>Pay via bites Wallet</strong>
                  <div style={{ color: "var(--text-muted)" }}>
                    Current Balance:{" "}
                    <strong>${walletBalance.toFixed(2)}</strong>
                  </div>
                </div>
              </label>
            </PremiumCard>
          </div>
        </div>

        {/* Order details checklist card */}
        <div>
          <PremiumCard
            style={{
              position: "sticky",
              top: "100px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-cohere)",
                fontSize: "1.2rem",
                marginBottom: "20px",
              }}
            >
              Order Review
            </h3>

            {/* Selected Address Preview */}
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                background: "rgba(25, 25, 25, 0.02)",
                borderRadius: "var(--radius-standard)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                <MapPin size={14} /> Deliver To
              </div>
              {selectedAddressId ? (
                (() => {
                  const selectedAddr = addresses.find(
                    (a) => a.id === selectedAddressId,
                  );
                  return selectedAddr ? (
                    <div style={{ fontSize: "0.9rem" }}>
                      <strong>{selectedAddr.street_address}</strong>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                          marginTop: "2px",
                        }}
                      >
                        {selectedAddr.landmark
                          ? `${selectedAddr.landmark}, `
                          : ""}
                        {selectedAddr.city} - {selectedAddr.postal_code}
                      </div>
                    </div>
                  ) : (
                    <span
                      style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}
                    >
                      Finding address...
                    </span>
                  );
                })()
              ) : (
                <span style={{ fontSize: "0.9rem", color: "red" }}>
                  No address selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              {stateData.cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>
                    {item.name} <strong>x {item.qty}</strong>
                  </span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--glass-border)",
                margin: "16px 0",
              }}
            />

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
                <span>${stateData.subtotal.toFixed(2)}</span>
              </div>
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
              onClick={handlePlaceOrder}
              disabled={loading || stateData.cartItems.length === 0}
              className="btn-premium"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Placing Order..." : "Confirm Order"}
            </button>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};
