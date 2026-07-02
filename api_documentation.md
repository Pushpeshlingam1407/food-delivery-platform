# API Reference Guide - Monorepo Integration

This document outlines all backend REST endpoints and Socket.IO real-time events exposed by the single backend server, categorized by which of the three frontend apps consumes them.

---

## 1. Customer Application Endpoints

### Authentication & Profile
* **POST `/api/auth/register`**: Registers a new customer profile.
* **POST `/api/auth/login`**: Logs in customer using email and password.
* **POST `/api/auth/otp/send`**: Dispatches 6-digit OTP code to phone.
* **POST `/api/auth/otp/verify`**: Verifies phone OTP, automatically registers profile if new, returns JWT.
* **GET `/api/auth/me`**: Fetches details of the active customer profile.
* **POST `/api/auth/refresh`**: Generates a new short-lived access token.
* **POST `/api/auth/logout`**: Revokes customer's session refresh token.

### Browsing & Search
* **GET `/api/restaurants`**: Browse/search restaurants. (Parameters: `?search=pizza&categoryId=2`).
* **GET `/api/restaurants/:id`**: View restaurant details, timings, and category tags.
* **GET `/api/restaurants/:restaurantId/items`**: Fetch menu items for a restaurant. (Parameters: `?isVeg=true&categoryId=UUID`).

### Shopping Cart
* **GET `/api/cart`**: Get cart items, subtotals, GST tax, delivery charges, and applied coupon code discount (`?coupon=WELCOME50`).
* **POST `/api/cart/items`**: Add item to cart. (Enforces single-restaurant rule. Body: `{"menuId": "UUID", "quantity": 1}`).
* **PUT `/api/cart/items/:itemId`**: Update cart item quantity (decrease to `0` removes it).
* **DELETE `/api/cart/items/:itemId`**: Remove item from cart.
* **DELETE `/api/cart`**: Empty the shopping cart.

### Favorites
* **POST `/api/favorites`**: Toggle a menu item on the customer's favorite list.
* **GET `/api/favorites`**: Retrieve all saved menu items.

### Orders & Tracking
* **POST `/api/orders`**: Place an order from the active cart. (Decrements inventory stock. Body: `{"addressId": "UUID", "paymentMethod": "cod"|"wallet", "notes": "Leave at door"}`).
* **GET `/api/orders`**: View customer order history.
* **GET `/api/orders/:id`**: View snapshot of order items, totals, delivery address, and status.

### Realtime Customer Events (Socket.IO)
* **Emit `join_order` (Payload: `orderId`)**: Joins tracking room for the order.
* **Listen `status_update` (Payload: `{ orderId, status }`)**: Listens for restaurant/driver status updates.
* **Listen `location_update` (Payload: `{ latitude, longitude, bearing }`)**: Receives real-time coordinates of the assigned driver.

---

## 2. Restaurant Owner Application Endpoints

### Authentication & Profile
* **POST `/api/auth/login`**: Login using owner credentials.
* **GET `/api/auth/me`**: Fetches owner details.
* **PUT `/api/restaurants/:id`**: Update timings, description, or toggle open/closed/busy status (`status: "open"|"closed"|"busy"`).

### Menu Management
* **POST `/api/restaurants/categories`**: Create menu category (e.g. "Starters").
* **PUT `/api/restaurants/categories/:id`**: Update category name or sort order.
* **DELETE `/api/restaurants/categories/:id`**: Soft-delete a menu category.
* **POST `/api/restaurants/items`**: Create a new menu item and auto-initialize inventory.
* **PUT `/api/restaurants/items/:id`**: Update item pricing, description, availability, and veg/non-veg status.
* **DELETE `/api/restaurants/items/:id`**: Soft-delete a menu item.
* **PUT `/api/restaurants/items/:menuId/inventory`**: Update available stock quantity.

### Order Processing
* **GET `/api/orders`**: List all orders placed at this restaurant.
* **PUT `/api/orders/:id/status`**: Transition order status.
  * **Payload `status: "accepted"`**: Accepts incoming order (starts prep).
  * **Payload `status: "preparing"`**: Cooking in progress.
  * **Payload `status: "ready_for_pickup"`**: Order ready for driver pickup.

### Realtime Restaurant Events (Socket.IO)
* **Emit `join_order` (Payload: `orderId`)**: Joins order room to push prep updates.

---

## 3. Delivery Partner Application Endpoints

### Authentication & Profile
* **POST `/api/auth/login`**: Login using driver credentials.
* **GET `/api/auth/me`**: Fetches driver details.

### Delivery Job Management
* **GET `/api/orders`**: View available orders matching `ready_for_pickup` or currently assigned orders.
* **PUT `/api/orders/:id/status`**: Transition assigned order status.
  * **Payload `status: "out_for_delivery"`**: Picks up order from restaurant. Sets driver state to busy.
  * **Payload `status: "delivered"`**: Delivers order to customer. Triggers driver payout and credit transactions.

### Realtime Location Emitters (Socket.IO)
* **Emit `driver_location` (Payload: `{ driverId, orderId, latitude, longitude, bearing }`)**: Emits coordinate streams, which the backend broadcasts to the customer's map.
