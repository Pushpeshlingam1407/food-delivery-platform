export const mockOrders = [
  {
    id: "order-1",
    user_id: "user-123",
    restaurant_id: "rest-1",
    status: "pending",
    total_amount: "35.50",
    delivery_address: "123 Main St",
    created_at: new Date().toISOString(),
    items: [
      { id: "item-1", name: "Pizza", price: "15.00", quantity: 2 },
      { id: "item-2", name: "Soda", price: "5.50", quantity: 1 }
    ]
  },
  {
    id: "order-2",
    user_id: "user-123",
    restaurant_id: "rest-2",
    status: "delivered",
    total_amount: "18.00",
    delivery_address: "123 Main St",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { id: "item-3", name: "Burger", price: "12.00", quantity: 1 },
      { id: "item-4", name: "Fries", price: "6.00", quantity: 1 }
    ]
  }
];

export const mockDriverOrders = [
  {
    id: "order-3",
    restaurant: { name: "Burger King", address: "789 Fast Rd" },
    customer: { name: "John Doe", phone: "555-1234", address: "123 Main St" },
    status: "ready_for_pickup",
    total_amount: "25.00",
    delivery_fee: "5.00",
  }
];
