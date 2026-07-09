import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (value: string) => void;
  containerStyle?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearchChange,
  placeholder = "Search...",
  containerStyle,
  style,
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#FFF",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-standard)",
        padding: "8px 16px",
        gap: "8px",
        ...containerStyle,
      }}
    >
      <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          fontFamily: "var(--font-apple)",
          fontSize: "0.9rem",
          background: "transparent",
          ...style,
        }}
        {...props}
      />
    </div>
  );
};
