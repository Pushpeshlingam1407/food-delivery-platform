import React from "react";
import { Search } from "lucide-react";
import { filterOptions, type OrderFilter } from "./orderUtils";

interface OrderSearchBarProps {
  query: string;
  activeFilter: OrderFilter;
  counts: Record<OrderFilter, number>;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: OrderFilter) => void;
}

export const OrderSearchBar: React.FC<OrderSearchBarProps> = ({
  query,
  activeFilter,
  counts,
  onQueryChange,
  onFilterChange,
}) => {
  return (
    <div className="orders-toolbar order-toolbar">
      <label className="orders-search order-search-field">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search restaurant, item, or order number"
        />
      </label>
      <div className="orders-tabs order-filter-tabs" aria-label="Filter orders">
        {filterOptions.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`order-filter-tab${activeFilter === key ? " active" : ""}`}
            onClick={() => onFilterChange(key)}
          >
            {label}
            <span>{counts[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
