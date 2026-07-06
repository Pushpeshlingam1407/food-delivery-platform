# Backend Reference Atlas & Architectural Novelty

This document provides a file-by-file specification of the food-delivery-platform backend engine, detailing the purpose of every code component, followed by an explanation of the system's design novelty.

---

## 1. File-by-File Reference (A-Z Hierarchical)

### Root Configuration

- **`.env`**: Holds local environment secrets (database ports, token signature keys, salt rounds, and server ports).
- **`package.json`**: Specifies app metadata, dependencies (Express, Socket.IO, Bcrypt, JWT), and entry scripts (`node src/server.js`).
- **`schema.sql`**: Definitive SQL database script initializing all 34 transactional tables, constraints, keys, and enumeration parameters.
- **`seed.sql`**: Injectable data payload seeding roles, demo users, sample addresses, and menus for active testing.

---

### Core Initialization (`/src`)

- **[server.js](file:///C:/Users/pushp/Desktop/food-delivery-platform/backend/src/server.js)**: Runs the HTTP port listener on `5000` and configures real-time socket connections.
- **[app.js](file:///C:/Users/pushp/Desktop/food-delivery-platform/backend/src/app.js)**: Mounts global Express filters (Helmet, Cors, JSON) and configures the `/api/*` feature routes.

---

### Infrastructure Layer (`/src/config`)

- **[db.js](file:///C:/Users/pushp/Desktop/food-delivery-platform/backend/src/config/db.js)**: Creates the asynchronous MySQL connection pool.
- **[socket.js](file:///C:/Users/pushp/Desktop/food-delivery-platform/backend/src/config/socket.js)**: Governs live updates, connection state recovery, and coordinate broadcast rooms.

---

### Security Filters (`/src/middlewares`)

- **[auth.js](file:///C:/Users/pushp/Desktop/food-delivery-platform/backend/src/middlewares/auth.js)**: Validates bearer headers and routes auth errors via `401 Unauthorized` status codes.

---

### API Route Maps (`/src/routes`)

- **`addressRoutes.js`**: Routes customer address operations.
- **`adminRoutes.js`**: Routes revenue analytics, merchant verification, settings, and coupon management.
- **`authRoutes.js`**: Routes registration, password login, token refresh, and OTP operations.
- **`cartRoutes.js`**: Routes active basket item operations.
- **`cmsRoutes.js`**: Routes CMS markdown and SEO lookup.
- **`deliveryRoutes.js`**: Routes shift status toggles and GPS tracking coordinates logs.
- **`favoriteRoutes.js`**: Routes customer favorites list operations.
- **`notificationRoutes.js`**: Routes delivery notifications.
- **`orderRoutes.js`**: Routes order placement and status transitions.
- **`paymentRoutes.js`**: Routes transaction status callbacks.
- **`ratingRoutes.js`**: Routes customer feedback and ratings.
- **`refundRoutes.js`**: Routes wallet dispute refunds.
- **`reportRoutes.js`**: Routes store sales and driver earnings analytics.
- **`restaurantRoutes.js`**: Routes merchant catalog categories, items, and timings updates.
- **`walletRoutes.js`**: Routes deposits, balances, and payouts.

---

### Transaction Handlers (`/src/controllers`)

- **`addressController.js`**: Add, list, or delete saved customer addresses.
- **`adminController.js`**: Audits store verifications, compiles dashboard analytics, and manages coupons.
- **`authController.js`**: Implements hashing, checks passwords, registers new accounts, and parses profiles.
- **`cartController.js`**: Calculates subtotals, GST, and distance-based delivery charges.
- **`cmsController.js`**: Edits dynamic markdown pages.
- **`deliveryController.js`**: Logs location coordinates and updates driver shifts.
- **`favoriteController.js`**: Toggles menu items on the user's favorites list.
- **`inventoryController.js`**: Updates available catalog stock levels.
- **`menuController.js`**: Implements menu categories and item CRUD.
- **`notificationController.js`**: Sends system and delivery alerts.
- **`orderController.js`**: Places orders, checks inventory, updates status, and processes payouts.
- **`paymentController.js`**: Verifies transaction callback signatures.
- **`ratingController.js`**: Manages reviews and star ratings.
- **`refundController.js`**: Cancels payments and returns money to customer wallets.
- **`reportController.js`**: Compiles merchant sales reports and driver earnings.
- **`restaurantController.js`**: Modifies restaurant settings, open hours, and busy status.
- **`walletController.js`**: Handles wallet deposits, balances, and payouts.

---

### Utility Helpers (`/src/utils`)

- **[jwt.js](file:///C:/Users/pushp/Desktop/food-delivery-platform/backend/src/utils/jwt.js)**: Configures access and refresh token signing.

---

## 2. Novelty and Special Features of This Project

Unlike standard template backends, this system is custom-tailored for multi-portal, high-concurrency food logistics:

### 1. Dual-Token Handshake Interceptor Sync

Most web apps force complete re-authentication when a session expires, creating a bad user experience.
This backend responds with a strict `401 Unauthorized` for expired sessions, enabling a client interceptor to run a silent refresh request (`/auth/refresh`), update storage, and replay the original transaction seamlessly without interrupting the user.

### 2. Multi-Role Transaction Ledger Isolation

Instead of running separate backends for customers, merchants, and drivers, a single database engine manages role-specific ledgers:

- Customers pay via wallet deposits or COD.
- Delivery partners receive immediate payouts (fees + tips) in their wallets upon confirming delivery.
- Restaurant owners receive earnings minus platform commission.
  The backend handles these financial transitions atomically inside MySQL transactions to guarantee data integrity.

### 3. Resilient WebSocket State Recovery

Logistics apps often suffer from socket disconnections due to fluctuating mobile networks.
By enabling `connectionStateRecovery` and tuning `pingTimeout` to `60000ms`, the Socket.IO gateway buffers connection drops. When a driver reconnects, they automatically rejoin their active order tracking rooms without losing their delivery stream history.
