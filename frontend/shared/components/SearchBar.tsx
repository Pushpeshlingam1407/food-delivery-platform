import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string | number | readonly string[];
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  value,
  onSearchChange,
  placeholder = "Search...",
  className,
}: SearchBarProps) => {
  return (
    <div className={`search-bar ${className || ""}`}>
      <Search size={16} className="search-bar-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event: { target: HTMLInputElement }) =>
          onSearchChange && onSearchChange(event.target.value)
        }
        className="search-bar-input"
      />
    </div>
  );
};
