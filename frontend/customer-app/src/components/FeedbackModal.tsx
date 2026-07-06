import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onSubmitted,
}) => {
  const [restRating, setRestRating] = useState(5);
  const [delivRating, setDelivRating] = useState(5);
  const [restReview, setRestReview] = useState("");
  const [delivReview, setDelivReview] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/ratings", {
        orderId,
        restaurantRating: restRating,
        deliveryRating: delivRating,
        restaurantReview: restReview,
        deliveryReview: delivReview,
      });

      if (response.data.status === "success") {
        toast.success("Thank you for your feedback!");
        if (onSubmitted) onSubmitted();
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: "rgba(25, 25, 25, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#FFF",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "32px",
          boxShadow: "var(--glass-shadow)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          <X size={20} />
        </button>

        <h3
          style={{
            fontSize: "1.4rem",
            marginBottom: "8px",
            fontFamily: "var(--font-anthropic)",
          }}
        >
          Rate Your Experience
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
          Tell us how your food was and how the rider did!
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Restaurant Rating */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>
              RATE THE FOOD & RESTAURANT
            </label>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRestRating(star)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <Star
                    size={28}
                    fill={star <= restRating ? "var(--accent-orange)" : "none"}
                    color={star <= restRating ? "var(--accent-orange)" : "var(--text-muted)"}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="How was the taste, packaging, and portion size?..."
              value={restReview}
              onChange={(e) => setRestReview(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--glass-border)",
                fontSize: "0.85rem",
                outline: "none",
                minHeight: "60px",
              }}
            />
          </div>

          {/* Delivery Rating */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>
              RATE THE RIDER & DELIVERY
            </label>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setDelivRating(star)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <Star
                    size={28}
                    fill={star <= delivRating ? "var(--accent-violet)" : "none"}
                    color={star <= delivRating ? "var(--accent-violet)" : "var(--text-muted)"}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Was the delivery fast, polite, and handled well?..."
              value={delivReview}
              onChange={(e) => setDelivReview(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--glass-border)",
                fontSize: "0.85rem",
                outline: "none",
                minHeight: "60px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium"
            style={{ width: "100%", padding: "12px", marginTop: "10px" }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};
