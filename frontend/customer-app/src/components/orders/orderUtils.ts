export interface OrderItem {
  id: string;
  menu_id: string;
  item_name?: string;
  name?: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
}

export interface Order {
  id: string;
  order_number: string;
  restaurant_name: string;
  status:
    | "placed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  total_payable: number | string;
  item_total?: number | string;
  delivery_charges?: number | string;
  tax_amount?: number | string;
  discount_amount?: number | string;
  placed_at: string;
  delivered_at?: string | null;
  street_address?: string;
  city?: string;
  restaurant_id?: string;
  items?: OrderItem[];
}

export type OrderFilter = "all" | "active" | "past";

export const ACTIVE_STATUSES = [
  "placed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
];

export const statusCopy: Record<string, { label: string; detail: string }> = {
  placed: {
    label: "Order placed",
    detail: "The store is confirming your order.",
  },
  preparing: {
    label: "Being prepared",
    detail: "Your items are getting packed now.",
  },
  ready_for_pickup: {
    label: "Ready for pickup",
    detail: "A delivery partner will pick it up soon.",
  },
  out_for_delivery: {
    label: "On the way",
    detail: "Track the rider live from here.",
  },
  delivered: {
    label: "Delivered",
    detail: "Saved in your order history.",
  },
  cancelled: {
    label: "Cancelled",
    detail: "This order was cancelled.",
  },
};

export const filterOptions: Array<[OrderFilter, string]> = [
  ["all", "All"],
  ["active", "Active"],
  ["past", "Past"],
];

export const formatMoney = (value: number | string | undefined) =>
  `₹${parseFloat((value || 0).toString()).toFixed(2)}`;

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

export const formatOrderNumber = (value: string) => `Order No. ${value}`;

export const isActive = (status: string) => ACTIVE_STATUSES.includes(status);

export const getItemName = (item: OrderItem) =>
  item.item_name || item.name || "Menu item";
