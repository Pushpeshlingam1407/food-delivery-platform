import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import notify from "../utils/toast";

interface CartItem {
  name: string;
  price: number;
  qty: number;
}

interface AppContextType {
  userEmail: string | null;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  handleLogout: () => void;
  driverOnline: boolean;
  setDriverOnline: React.Dispatch<React.SetStateAction<boolean>>;
  deliverySidebarCollapsed: boolean;
  setDeliverySidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  cart: { [itemId: string]: CartItem };
  setCart: React.Dispatch<React.SetStateAction<{ [itemId: string]: CartItem }>>;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  walletBalance: number | null;
  setWalletBalance: React.Dispatch<React.SetStateAction<number | null>>;
  deliveryAddress: string;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<string>>;
  fetchWallet: () => Promise<void>;
  fetchDeliveryAddress: () => Promise<void>;
  handleDeposit: () => Promise<void>;
  addToCart: (item: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQty: (itemId: string, newQty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartList: any[];
  cartCount: number;
  cartItemsCountMap: { [key: string]: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("userEmail"),
  );
  const [userRole, setUserRole] = useState<string | null>(() =>
    localStorage.getItem("userRole"),
  );
  const [driverOnline, setDriverOnline] = useState(false);
  const [deliverySidebarCollapsed, setDeliverySidebarCollapsed] =
    useState(false);
  const [cart, setCart] = useState<{ [itemId: string]: CartItem }>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] =
    useState<string>("Select Address");

  useEffect(() => {
    const syncShiftState = () =>
      setDriverOnline(localStorage.getItem("driverOnline") === "true");
    syncShiftState();
    window.addEventListener("driver-shift-change", syncShiftState);
    return () =>
      window.removeEventListener("driver-shift-change", syncShiftState);
  }, []);

  const fetchDeliveryAddress = async () => {
    if (localStorage.getItem("accessToken")) {
      try {
        const res = await api.get("/addresses");
        if (res.data.status === "success") {
          const list = res.data.data || [];
          const defaultAddr =
            list.find((addr: any) => addr.is_default) || list[0];
          if (defaultAddr) {
            setDeliveryAddress(`${defaultAddr.city}, ${defaultAddr.state}`);
          }
        }
      } catch (err) {
        console.error("Fetch delivery address error:", err);
      }
    }
  };

  const fetchWallet = async () => {
    if (localStorage.getItem("accessToken")) {
      try {
        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        }
      } catch (err) {
        console.error("Fetch wallet error:", err);
      }
    }
  };

  const handleDeposit = async () => {
    const amountStr = prompt("Enter deposit amount (₹):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      notify.error("Please enter a valid deposit amount.");
      return;
    }
    try {
      const res = await api.post("/wallets/deposit", {
        amount,
        description: "Wallet Top-up",
      });
      if (res.data.status === "success") {
        notify.success("Wallet funds added successfully!");
        fetchWallet();
      }
    } catch (err) {
      notify.error("Failed to deposit funds.");
    }
  };

  const fetchCartFromBackend = async () => {
    try {
      const res = await api.get("/cart");
      if (res.data.status === "success") {
        const backendItems = res.data.data.items || [];
        const newCart: any = {};
        backendItems.forEach((item: any) => {
          newCart[item.menu_id] = {
            name: item.name,
            price: parseFloat(item.price),
            qty: item.quantity,
          };
        });
        setCart(newCart);
      }
    } catch (err) {
      console.error("Fetch backend cart failed:", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchCartFromBackend();
      fetchWallet();
      fetchDeliveryAddress();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("realEmail");
    setUserEmail(null);
    setUserRole(null);
    window.location.reload();
  };

  const addToCart = async (item: any) => {
    const existing = cart[item.id];
    const newQty = existing ? existing.qty + 1 : 1;

    setCart((prev) => ({
      ...prev,
      [item.id]: {
        name: item.name,
        price: item.price != null ? parseFloat(item.price.toString()) : 0,
        qty: newQty,
      },
    }));

    try {
      if (localStorage.getItem("accessToken")) {
        await api.post("/cart/items", { menuId: item.id, quantity: 1 });
      }
    } catch (err) {
      console.error("Sync add to cart failed:", err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const existing = cart[itemId];
    if (!existing) return;

    setCart((prev) => {
      const updated = { ...prev };
      if (existing.qty <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId] = { ...existing, qty: existing.qty - 1 };
      }
      return updated;
    });

    try {
      if (localStorage.getItem("accessToken")) {
        if (existing.qty <= 1) {
          await api.delete(`/cart/items/${itemId}`);
        } else {
          await api.put(`/cart/items/${itemId}`, {
            quantity: existing.qty - 1,
          });
        }
      }
    } catch (err) {
      console.error("Sync remove from cart failed:", err);
    }
  };

  const updateQty = async (itemId: string, newQty: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[itemId];
      } else if (updated[itemId]) {
        updated[itemId] = { ...updated[itemId], qty: newQty };
      }
      return updated;
    });

    try {
      if (localStorage.getItem("accessToken")) {
        if (newQty <= 0) {
          await api.delete(`/cart/items/${itemId}`);
        } else {
          await api.put(`/cart/items/${itemId}`, { quantity: newQty });
        }
      }
    } catch (err) {
      console.error("Sync update qty failed:", err);
    }
  };

  const clearCart = async () => {
    setCart({});
    try {
      if (localStorage.getItem("accessToken")) {
        await api.delete("/cart");
      }
    } catch (err) {
      console.error("Sync clear cart failed:", err);
    }
  };

  const cartList = Object.entries(cart).map(([id, val]) => ({
    id,
    ...val,
  }));

  const cartCount = cartList.reduce((acc, item) => acc + item.qty, 0);

  const cartItemsCountMap = Object.keys(cart).reduce(
    (acc, id) => {
      acc[id] = cart[id].qty;
      return acc;
    },
    {} as { [key: string]: number },
  );

  return (
    <AppContext.Provider
      value={{
        userEmail,
        setUserEmail,
        userRole,
        setUserRole,
        handleLogout,
        driverOnline,
        setDriverOnline,
        deliverySidebarCollapsed,
        setDeliverySidebarCollapsed,
        cart,
        setCart,
        cartOpen,
        setCartOpen,
        searchQuery,
        setSearchQuery,
        walletBalance,
        setWalletBalance,
        deliveryAddress,
        setDeliveryAddress,
        fetchWallet,
        fetchDeliveryAddress,
        handleDeposit,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartList,
        cartCount,
        cartItemsCountMap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
