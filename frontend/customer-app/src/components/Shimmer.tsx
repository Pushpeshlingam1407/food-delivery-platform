import React from "react";

export const ShimmerCard: React.FC = () => {
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-squircle)",
        padding: "24px",
        boxShadow: "var(--glass-shadow)",
        backdropFilter: "var(--glass-blur)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "shimmerPulse 1.8s infinite ease-in-out",
      }}
    >
      {/* Title Shimmer */}
      <div
        style={{
          height: "24px",
          background: "rgba(25, 25, 25, 0.06)",
          borderRadius: "4px",
          width: "60%",
        }}
      />
      {/* Description Shimmer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            height: "14px",
            background: "rgba(25, 25, 25, 0.04)",
            borderRadius: "4px",
            width: "90%",
          }}
        />
        <div
          style={{
            height: "14px",
            background: "rgba(25, 25, 25, 0.04)",
            borderRadius: "4px",
            width: "75%",
          }}
        />
      </div>
      {/* Footer Shimmer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <div
          style={{
            height: "16px",
            background: "rgba(25, 25, 25, 0.06)",
            borderRadius: "4px",
            width: "30%",
          }}
        />
        <div
          style={{
            height: "24px",
            background: "rgba(25, 25, 25, 0.06)",
            borderRadius: "100px",
            width: "25%",
          }}
        />
      </div>
    </div>
  );
};

export const ShimmerList: React.FC = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "32px",
        width: "100%",
      }}
    >
      <ShimmerCard />
      <ShimmerCard />
      <ShimmerCard />
    </div>
  );
};
