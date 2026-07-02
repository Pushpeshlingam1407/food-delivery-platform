-- Food Delivery Platform Database Mock Seed Data (MySQL 8.x)

USE food_delivery_platform;

-- Disable checks to prevent foreign key errors on truncate/overwrite
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE device_tokens;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE otp_verifications;
TRUNCATE TABLE delivery_earnings;
TRUNCATE TABLE restaurant_earnings;
TRUNCATE TABLE system_settings;
TRUNCATE TABLE cms_pages;
TRUNCATE TABLE refunds;
TRUNCATE TABLE coupon_usage;
TRUNCATE TABLE coupons;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE ratings;
TRUNCATE TABLE favorites;
TRUNCATE TABLE wallet_transactions;
TRUNCATE TABLE wallets;
TRUNCATE TABLE driver_locations;
TRUNCATE TABLE payment_transactions;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE delivery_partners;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE inventory;
TRUNCATE TABLE menu_images;
TRUNCATE TABLE menus;
TRUNCATE TABLE menu_categories;
TRUNCATE TABLE restaurant_category_mapping;
TRUNCATE TABLE restaurant_categories;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE addresses;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'System administrator with global control'),
(2, 'customer', 'Standard platform customer placing orders'),
(3, 'restaurant_owner', 'Merchant selling food items'),
(4, 'delivery_partner', 'Delivery rider/driver fulfilling orders');

-- 2. Seed Users (using standard UUID v4 strings)
-- Admin
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, status, is_verified) VALUES
('u0000000-0000-0000-0000-000000000001', 1, 'Pushpesh', 'Admin', 'admin@fooddelivery.com', '+919999999999', '$2b$10$xyz...', 'active', TRUE);

-- Customers
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, status, is_verified) VALUES
('u0000000-0000-0000-0000-000000000002', 2, 'Aarav', 'Sharma', 'aarav.sharma@example.com', '+919876543210', '$2b$10$xyz...', 'active', TRUE),
('u0000000-0000-0000-0000-000000000003', 2, 'Aditi', 'Verma', 'aditi.verma@example.com', '+919876543211', '$2b$10$xyz...', 'active', TRUE);

-- Restaurant Owners
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, status, is_verified) VALUES
('u0000000-0000-0000-0000-000000000004', 3, 'Rajesh', 'Kumar', 'rajesh.owner1@example.com', '+918765432101', '$2b$10$xyz...', 'active', TRUE),
('u0000000-0000-0000-0000-000000000005', 3, 'Priya', 'Nair', 'priya.owner2@example.com', '+918765432102', '$2b$10$xyz...', 'active', TRUE);

-- Delivery Partners
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, status, is_verified) VALUES
('u0000000-0000-0000-0000-000000000006', 4, 'Amit', 'Singh', 'amit.driver1@example.com', '+917654321098', '$2b$10$xyz...', 'active', TRUE),
('u0000000-0000-0000-0000-000000000007', 4, 'Vikram', 'Rao', 'vikram.driver2@example.com', '+917654321099', '$2b$10$xyz...', 'active', TRUE);

-- 3. Seed Addresses
-- Restaurant Addresses
INSERT INTO addresses (id, user_id, address_type, street_address, landmark, city, state, postal_code, latitude, longitude, is_default) VALUES
('a0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000004', 'restaurant', '12, MG Road', 'Near Metro Station', 'Bengaluru', 'Karnataka', '560001', 12.9716, 77.5946, TRUE),
('a0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000005', 'restaurant', '45, Indiranagar Double Road', 'Opp Bank of Baroda', 'Bengaluru', 'Karnataka', '560038', 12.9784, 77.6408, TRUE);

-- Customer Addresses
INSERT INTO addresses (id, user_id, address_type, street_address, landmark, city, state, postal_code, latitude, longitude, is_default) VALUES
('a0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000002', 'home', 'Flat 402, Sunshine Apts', 'Opp Children Park', 'Bengaluru', 'Karnataka', '560001', 12.9725, 77.5980, TRUE),
('a0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000003', 'work', 'Tower B, Tech Park', 'Floor 8', 'Bengaluru', 'Karnataka', '560103', 12.9279, 77.6833, TRUE);

-- 4. Seed Restaurants
INSERT INTO restaurants (id, owner_id, name, description, address_id, commission_rate, average_delivery_time, is_active, is_verified, status, opening_time, closing_time) VALUES
('r0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000004', 'The Curry House', 'Authentic North Indian Curries and Biryanis', 'a0000000-0000-0000-0000-000000000004', 12.50, 35, TRUE, TRUE, 'open', '11:00:00', '23:00:00'),
('r0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000005', 'Pizza Imperia', 'Woodfired pizzas and Italian pasta', 'a0000000-0000-0000-0000-000000000005', 10.00, 25, TRUE, TRUE, 'open', '12:00:00', '23:30:00');

-- 5. Seed Restaurant Categories
INSERT INTO restaurant_categories (id, name, image_url, is_active) VALUES
(1, 'North Indian', 'http://cdn/categories/north_indian.jpg', TRUE),
(2, 'Pizza', 'http://cdn/categories/pizza.jpg', TRUE),
(3, 'Biryani', 'http://cdn/categories/biryani.jpg', TRUE),
(4, 'Italian', 'http://cdn/categories/italian.jpg', TRUE);

-- 6. Map Restaurants to Categories
INSERT INTO restaurant_category_mapping (restaurant_id, category_id) VALUES
('r0000000-0000-0000-0000-000000000001', 1),
('r0000000-0000-0000-0000-000000000001', 3),
('r0000000-0000-0000-0000-000000000002', 2),
('r0000000-0000-0000-0000-000000000002', 4);

-- 7. Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order, is_active) VALUES
('mc000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'Main Course', 1, TRUE),
('mc000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'Starters', 0, TRUE),
('mc000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000002', 'Gourmet Pizzas', 0, TRUE),
('mc000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000002', 'Beverages', 1, TRUE);

-- 8. Menus
INSERT INTO menus (id, restaurant_id, category_id, name, description, price, is_veg, is_available, preparation_time) VALUES
('m0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000001', 'Butter Chicken', 'Tender tandoori chicken cooked in rich butter tomato gravy', 380.00, FALSE, TRUE, 20),
('m0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000001', 'Paneer Butter Masala', 'Fresh cottage cheese cooked in creamy tomato butter gravy', 320.00, TRUE, TRUE, 15),
('m0000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000002', 'Garlic Naan', 'Leavened flatbread brushed with garlic and butter', 80.00, TRUE, TRUE, 8),
('m0000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Margherita Pizza', 'Classic pizza with fresh mozzarella, basil, and San Marzano tomatoes', 299.00, TRUE, TRUE, 12),
('m0000000-0000-0000-0000-000000000005', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Chicken Pepperoni Pizza', 'Spiced chicken pepperoni slices with cheese blend', 420.00, FALSE, TRUE, 15);

-- 9. Menu Images
INSERT INTO menu_images (id, menu_id, image_url, is_primary) VALUES
('mi000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'http://cdn/images/butter_chicken.jpg', TRUE),
('mi000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000004', 'http://cdn/images/margherita.jpg', TRUE);

-- 10. Inventory
INSERT INTO inventory (id, menu_id, available_quantity, unlimited) VALUES
('i0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 50, FALSE),
('i0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002', 100, FALSE),
('i0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000003', 200, FALSE),
('i0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000004', 30, FALSE),
('i0000000-0000-0000-0000-000000000005', 'm0000000-0000-0000-0000-000000000005', 0, FALSE); -- Sold out pepperoni

-- 11. Delivery Partners
INSERT INTO delivery_partners (id, vehicle_number, vehicle_type, license_number, is_online, status) VALUES
('u0000000-0000-0000-0000-000000000006', 'KA-03-EX-1234', 'bike', 'DL-1234567890', TRUE, 'idle'),
('u0000000-0000-0000-0000-000000000007', 'KA-03-EX-9999', 'scooter', 'DL-0987654321', FALSE, 'idle');

-- 12. Wallets
INSERT INTO wallets (id, user_id, balance, currency) VALUES
('w0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000002', 500.00, 'INR'), -- Customer Wallet
('w0000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000006', 150.00, 'INR'); -- Driver Wallet

-- 13. System Settings
INSERT INTO system_settings (key_name, value, description) VALUES
('base_delivery_charge', '40.00', 'Flat base delivery rate charged to customers'),
('tax_rate_percentage', '5.00', 'GST percentage added to menu price'),
('min_free_delivery_threshold', '500.00', 'Order total above which delivery is free');

-- 14. CMS Pages
INSERT INTO cms_pages (id, slug, title, content, is_published) VALUES
('c0000000-0000-0000-0000-000000000001', 'about-us', 'About Us', '<p>Welcome to our Premium Food Delivery Platform!</p>', TRUE),
('c0000000-0000-0000-0000-000000000002', 'privacy-policy', 'Privacy Policy', '<p>Your privacy is important to us...</p>', TRUE);

-- 15. Seed Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, max_discount_amount, min_order_amount, start_date, end_date, usage_limit, user_limit, is_active) VALUES
('cp000000-0000-0000-0000-000000000001', 'WELCOME50', 'percentage', 50.00, 100.00, 150.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 1, TRUE),
('cp000000-0000-0000-0000-000000000002', 'FLAT50', 'flat', 50.00, NULL, 200.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 1, TRUE);

-- 16. Sample Orders (1 Completed Order)
INSERT INTO orders (id, user_id, restaurant_id, delivery_partner_id, delivery_address_id, status, item_total, delivery_charges, tax_amount, discount_amount, total_payable, coupon_code, accepted_at, delivered_at) VALUES
('o0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'delivered', 700.00, 0.00, 35.00, 100.00, 635.00, 'WELCOME50', '2026-07-02 12:05:00', '2026-07-02 12:35:00');

-- Order Items
INSERT INTO order_items (id, order_id, menu_id, quantity, unit_price, total_price) VALUES
('oi000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 1, 380.00, 380.00),
('oi000000-0000-0000-0000-000000000002', 'o0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000002', 1, 320.00, 320.00);

-- Payments
INSERT INTO payments (id, order_id, payment_method, payment_status, amount) VALUES
('p0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'razorpay', 'completed', 635.00);

-- Payment Transactions
INSERT INTO payment_transactions (id, payment_id, gateway_transaction_id, status, gateway_response) VALUES
('pt000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'pay_RAZOR12345', 'captured', '{"status":"captured","method":"card"}');

-- Coupon Usage
INSERT INTO coupon_usage (id, coupon_id, user_id, order_id, discount_applied) VALUES
('cu000000-0000-0000-0000-000000000001', 'cp000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'o0000000-0000-0000-0000-000000000001', 100.00);

-- Ratings & Reviews
INSERT INTO ratings (id, order_id, user_id, restaurant_rating, delivery_rating) VALUES
('rt000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 5, 4);

INSERT INTO reviews (id, rating_id, restaurant_review, delivery_review) VALUES
('rv000000-0000-0000-0000-000000000001', 'rt000000-0000-0000-0000-000000000001', 'Excellent Butter Chicken and Paneer!', 'Polite driver, delivered hot.');

-- Restaurant Earnings
INSERT INTO restaurant_earnings (id, restaurant_id, order_id, order_total, commission_amount, net_earning, is_paid) VALUES
('re000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 700.00, 87.50, 612.50, FALSE);

-- Delivery Earnings
INSERT INTO delivery_earnings (id, driver_id, order_id, delivery_fee, tip_amount, total_earning, is_paid) VALUES
('de000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000006', 'o0000000-0000-0000-0000-000000000001', 40.00, 20.00, 60.00, FALSE);
