import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  Truck,
  User,
  Wallet,
} from "lucide-react";

export interface DeliveryNavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface DeliveryNavigationSection {
  label: string;
  shortLabel: string;
  items: DeliveryNavigationItem[];
}

export const deliveryNavigation: DeliveryNavigationSection[] = [
  {
    label: "Operations",
    shortLabel: "OPS",
    items: [
      { label: "Dashboard / Home", path: "/", icon: LayoutDashboard },
      { label: "Job Board", path: "/deliveries", icon: ClipboardList },
      { label: "Delivery Requests", path: "/requests", icon: Truck },
      { label: "Active Deliveries", path: "/active-orders", icon: Map },
      { label: "Assigned Jobs", path: "/assigned-jobs", icon: ClipboardList },
      { label: "Route & Navigation", path: "/route", icon: Map },
    ],
  },
  {
    label: "Finance & Stats",
    shortLabel: "FIN",
    items: [
      { label: "Earnings & Payments", path: "/earnings", icon: ClipboardList },
      { label: "Wallet", path: "/wallet", icon: Wallet },
      { label: "Delivery History", path: "/ledger", icon: FileText },
      { label: "Performance", path: "/performance", icon: ClipboardList },
    ],
  },
  {
    label: "Account",
    shortLabel: "ACC",
    items: [
      { label: "Profile & Vehicle Details", path: "/profile", icon: User },
      { label: "Notifications", path: "/notifications", icon: ClipboardList },
      { label: "Support", path: "/support", icon: User },
      { label: "Settings", path: "/settings", icon: User },
    ],
  },
];
