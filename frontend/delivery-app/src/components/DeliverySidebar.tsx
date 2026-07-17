import React from "react";
import {
  AppSidebar,
  type NavGroup,
} from "../../../shared/components/AppSidebar";
import { useDelivery } from "../hooks/useDelivery";
import { deliveryNavigation } from "./deliveryNavigation";

const deliveryNavGroups: NavGroup[] = deliveryNavigation.map((section) => ({
  label: section.label,
  items: section.items,
}));

/** Delivery-specific configuration rendered by the shared sidebar shell. */
export const DeliverySidebar: React.FC = () => {
  const { driverName, logout, sidebarCollapsed, toggleSidebar } = useDelivery();

  return (
    <AppSidebar
      role="delivery_partner"
      userName={driverName}
      isLoggedIn
      navGroups={deliveryNavGroups}
      onLogout={logout}
      collapsed={sidebarCollapsed}
      onCollapsedChange={toggleSidebar}
      persistentOnDesktop
    />
  );
};
