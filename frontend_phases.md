# Frontend Workspace Implementation Roadmap

This document outlines the phased plan to build the three React.js frontend applications (`customer-app`, `restaurant-app`, and `delivery-app`) inside the `frontend/` workspace directory, connecting to the single backend engine.

---

## Phase 1: Shared Workspace & Design System

### Objectives

- Initialize the monorepo workspace for React + Vite.
- Setup global CSS themes (`frontend/shared/themes/variables.css`) containing HSL custom properties (light/dark parameters, Outfit & Inter typography imports, glassmorphism templates, and modern button gradients).
- Configure the central API client (`frontend/shared/services/api.js`) using Axios interceptors to automatically attach JWT token headers, catch `401 Unauthorized` token expiry errors, and perform silent refresh token rotations.
- Create common React context utilities (`AuthContext`) for tracking profile status.

---

## Phase 2: Customer App - Authentication & Shell Layouts

### Objectives

- Construct the Customer App layout (responsive top navigation bar, cart status badge, location address selectors, and footer widgets).
- Build the Customer authentication flow:
  - Email & Password registration / login.
  - OTP request and verification codes page.
  - Active profile profile view (`/profile`).

---

## Phase 3: Customer App - Browsing, Cart & Favorites

### Objectives

- Build the home page: list all active restaurants with category selectors, search inputs, and average delivery times.
- Build the Restaurant Menu view: browse menu items, categorize sections (e.g. Starters, Desserts), filter veg/non-veg, and toggle items on the favorites list.
- Build the Shopping Cart drawer: add items, change quantities, customization notes, apply coupons, and calculate total payables (GST, delivery charges, discounts).

---

## Phase 4: Customer App - Checkout & Real-time Order Tracking

### Objectives

- Build the Checkout wizard: select shipping address from saved list (or add new coordinates/landmarks), select payment method (COD or Wallet balance).
- Build the Live Order Tracking screen:
  - Join order rooms via Socket.IO.
  - Listen for cooking and delivery updates.
  - Display progress bars (Placed ➡️ Preparing ➡️ Ready ➡️ Out for Delivery ➡️ Delivered).
  - Display driver location on a mock navigation map using coordinates from Socket.IO stream.

---

## Phase 5: Restaurant Owner App - Dashboard & Menu Management

### Objectives

- Build the Restaurant Dashboard: list incoming orders, show current restaurant status (open, busy, closed), and aggregate today's sales.
- Build the Order Manager: accept incoming order (starts prep), update progress (preparing, ready for pickup).
- Build the Menu Catalog: CRUD operations for categories, menu items, and adjusting real-time stock levels.
- Build Restaurant Earnings & Payout reports.

---

## Phase 6: Delivery Partner App - Logistics & Wallet

### Objectives

- Build a mobile-optimized interface: online/offline shift toggle, vehicle/license setup dashboard.
- Build the Order Dispatch board: display orders `ready_for_pickup`, accept delivery jobs.
- Build the Active Delivery screen: show restaurant/customer address directions, log GPS coordinate update signals.
- Build the Driver Wallet: show total earnings breakdown (delivery fees + tips), trigger cash withdrawals to bank.

---

## Phase 7: Verification, Transitions & Polish

### Objectives

- Perform an end-to-end simulation: placing a customer order ➡️ restaurant accepts & prepares ➡️ driver goes online & accepts pickup ➡️ driver completes delivery ➡️ wallet balances are credited.
- Add premium micro-animations (hover transitions, checkout button loaders, notification shimmers).
