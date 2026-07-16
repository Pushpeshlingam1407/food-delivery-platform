import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAppContext } from "../../../shared/context/AppContext";

interface DeliveryContextValue {
  driverName: string;
  isOnline: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

const DeliveryContext = createContext<DeliveryContextValue | undefined>(undefined);

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const {
    driverOnline,
    deliverySidebarCollapsed,
    setDeliverySidebarCollapsed,
    handleLogout,
  } = useAppContext();

  const value = useMemo(
    () => ({
      driverName: localStorage.getItem("userName") || "Driver",
      isOnline: driverOnline,
      sidebarCollapsed: deliverySidebarCollapsed,
      toggleSidebar: () => setDeliverySidebarCollapsed((collapsed) => !collapsed),
      logout: handleLogout,
    }),
    [
      deliverySidebarCollapsed,
      driverOnline,
      handleLogout,
      setDeliverySidebarCollapsed,
    ],
  );

  return (
    <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>
  );
};

export const useDeliveryContext = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error("useDeliveryContext must be used within DeliveryProvider");
  }
  return context;
};
