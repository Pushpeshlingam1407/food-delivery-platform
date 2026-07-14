import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { FeedbackModal } from "../components/FeedbackModal";
import { OrderCard } from "../components/orders/OrderCard";
import { OrderDetailsDrawer } from "../components/orders/OrderDetailsDrawer";
import { OrderSearchBar } from "../components/orders/OrderSearchBar";
import {
  formatOrderNumber,
  getItemName,
  isActive,
  type Order,
  type OrderFilter,
} from "../components/orders/orderUtils";

interface OrdersProps {
  addToCart?: (item: {
    id: string;
    name: string;
    price: number;
  }) => void | Promise<void>;
}

export const Orders: React.FC<OrdersProps> = ({ addToCart }) => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get("/orders");
      if (response.data.status === "success") {
        const orderList: Order[] = response.data.data || [];
        const enrichedOrders = await Promise.all(
          orderList.map(async (order) => {
            try {
              const detailResponse = await api.get(`/orders/${order.id}`);
              return detailResponse.data.status === "success"
                ? { ...order, ...detailResponse.data.data }
                : order;
            } catch {
              return order;
            }
          }),
        );
        setOrders(enrichedOrders);
      }
    } catch (err) {
      console.error(err);
      notify.error("Couldn't load your order history right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const counts = useMemo(() => {
    const active = orders.filter((order) => isActive(order.status)).length;
    return {
      all: orders.length,
      active,
      past: orders.length - active,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && isActive(order.status)) ||
        (filter === "past" && !isActive(order.status));

      const itemText = (order.items || [])
        .map((item) => getItemName(item))
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        order.restaurant_name.toLowerCase().includes(normalizedQuery) ||
        order.order_number.toLowerCase().includes(normalizedQuery) ||
        itemText.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, orders, query]);

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
      let items = order.items || [];
      if (items.length === 0) {
        const response = await api.get(`/orders/${order.id}`);
        items = response.data.data?.items || [];
      }

      if (!items.length) {
        notify.warning("Couldn't retrieve items for reordering.");
        return;
      }

      const restaurantId = order.restaurant_id;

      // Fetch restaurant menu to check availability
      let availableItemsMap: Record<string, any> = {};
      if (restaurantId) {
        try {
          const menuRes = await api.get(`/restaurants/${restaurantId}/items`);
          if (menuRes.data.status === "success") {
            const menuItems = menuRes.data.data || [];
            menuItems.forEach((m: any) => {
              availableItemsMap[m.id] = m;
            });
          }
        } catch (menuErr) {
          console.error("Could not fetch restaurant menu for validation:", menuErr);
        }
      }

      const unavailableNames: string[] = [];
      const addedNames: string[] = [];

      for (const item of items) {
        const menuId = item.menu_id;
        const menuItem = availableItemsMap[menuId];
        const isItemAvailable = menuItem && (menuItem.is_available === true || menuItem.is_available === 1 || menuItem.is_available === "1");

        if (isItemAvailable) {
          if (addToCart) {
            const qty = Math.max(1, Number(item.quantity || (item as any).qty || 1));
            for (let i = 0; i < qty; i++) {
              await addToCart({
                id: menuId,
                name: menuItem.name || item.name || getItemName(item),
                price: parseFloat((menuItem.price || item.unit_price || 0).toString()),
              });
            }
          }
          addedNames.push(menuItem.name || item.name || getItemName(item));
        } else {
          unavailableNames.push(item.name || getItemName(item) || "Unknown Item");
        }
      }

      if (unavailableNames.length > 0) {
        notify.warning(
          `Unavailable items: ${unavailableNames.join(", ")}`,
          { description: "The rest of the available items were added." }
        );
      }
      if (addedNames.length > 0) {
        notify.success(`Added to cart: ${addedNames.join(", ")}`);
      } else if (unavailableNames.length > 0 && addedNames.length === 0) {
        notify.error("None of the items in this order are currently available.");
      }
    } catch (err) {
      console.error("Reorder failed:", err);
      notify.error("We couldn't reorder these items. Please try again.");
    } finally {
      setReorderingId(null);
    }
  };

  const handleHelp = (order: Order) => {
    notify.info("Support is ready to help.", {
      description: formatOrderNumber(order.order_number),
    });
  };

  const openOrderDetails = (order: Order) => {
    if (isActive(order.status)) {
      navigate(`/track/${order.id}`);
      return;
    }

    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="orders-loading-state">
        <ShoppingBag size={28} />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper orders-page-wrapper--polished">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={16} /> Back
      </button>

      <section className="orders-hero orders-hero--polished">
        <div>
          <p className="orders-kicker">Food memories, neatly kept</p>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            A calm, beautiful place to track what is arriving, revisit what you
            loved, and pull up every receipt without digging.
          </p>
        </div>
        <div className="orders-hero-stats" aria-label="Order summary">
          <div>
            <strong>{counts.active}</strong>
            <span>Active</span>
          </div>
          <div>
            <strong>{counts.past}</strong>
            <span>Past</span>
          </div>
        </div>
      </section>

      <OrderSearchBar
        query={query}
        activeFilter={filter}
        counts={counts}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
      />

      <div className="orders-list">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            reordering={reorderingId === order.id}
            onOpen={openOrderDetails}
            onTrack={(activeOrder) => navigate(`/track/${activeOrder.id}`)}
            onReorder={handleReorder}
            onRate={(rateOrder) => setFeedbackOrderId(rateOrder.id)}
            onHelp={handleHelp}
          />
        ))}

        {filteredOrders.length === 0 && (
          <div className="orders-empty-state">
            <ShoppingBag size={48} className="orders-empty-icon" />
            <h2>
              {orders.length === 0 ? "No orders yet" : "No matching orders"}
            </h2>
            <p>
              {orders.length === 0
                ? "Your first delivery will show up here with tracking, reorder, rating, and support options."
                : "Try searching another restaurant, item, or order number."}
            </p>
            <button onClick={() => navigate("/")} className="btn-premium">
              Explore stores
            </button>
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={feedbackOrderId !== null}
        onClose={() => setFeedbackOrderId(null)}
        orderId={feedbackOrderId || ""}
      />

      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          reordering={reorderingId === selectedOrder.id}
          onClose={() => setSelectedOrder(null)}
          onReorder={handleReorder}
          onHelp={handleHelp}
        />
      )}
    </div>
  );
};
