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
('u0000000-0000-0000-0000-000000000002', 2, 'Jimmy', 'McGill', 'jimmy@slippin.com', '+919876543220', '$2b$10$xyz...', 'active', TRUE),
('u0000000-0000-0000-0000-000000000003', 2, 'Aditi', 'Verma', 'aditi.verma@example.com', '+919876543211', '$2b$10$xyz...', 'active', TRUE);

-- Restaurant Owners
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, status, is_verified) VALUES
('u0000000-0000-0000-0000-000000000004', 3, 'Rajesh', 'Kumar', 'rajesh.owner1@example.com', '+918765432101', '$2b$10$xyz...', 'active', TRUE), -- Owns The Curry House
('u0000000-0000-0000-0000-000000000005', 3, 'Priya', 'Nair', 'priya.owner2@example.com', '+918765432102', '$2b$10$xyz...', 'active', TRUE), -- Owns Pizza Imperia
('u0000000-0000-0000-0000-000000000008', 3, 'Vikram', 'Mehta', 'vikram.owner3@example.com', '+918765432108', '$2b$10$xyz...', 'active', TRUE), -- Owns Sushi World
('u0000000-0000-0000-0000-000000000009', 3, 'Maya', 'Sen', 'maya.owner4@example.com', '+918765432109', '$2b$10$xyz...', 'active', TRUE), -- Owns Bake & Brew Cafe
('u0000000-0000-0000-0000-000000000010', 3, 'John', 'Doe', 'john.owner5@example.com', '+918765432110', '$2b$10$xyz...', 'active', TRUE), -- Owns Burger Bistro
('u0000000-0000-0000-0000-000000000011', 3, 'Chen', 'Wei', 'chen.owner6@example.com', '+918765432111', '$2b$10$xyz...', 'active', TRUE), -- Owns Wok Express
('u0000000-0000-0000-0000-000000000012', 3, 'Karthik', 'Raja', 'karthik.owner7@example.com', '+918765432112', '$2b$10$xyz...', 'active', TRUE), -- Owns Dakshin Delights
('u0000000-0000-0000-0000-000000000013', 3, 'Sara', 'Miller', 'sara.owner8@example.com', '+918765432113', '$2b$10$xyz...', 'active', TRUE), -- Owns Sweet Tooth Emporium
('u0000000-0000-0000-0000-000000000014', 3, 'Elena', 'Rostova', 'elena.owner9@example.com', '+918765432114', '$2b$10$xyz...', 'active', TRUE), -- Owns The Green Bowl
('u0000000-0000-0000-0000-000000000015', 3, 'Rahul', 'Dev', 'rahul.owner10@example.com', '+918765432115', '$2b$10$xyz...', 'active', TRUE), -- Owns Rolls King
('u0000000-0000-0000-0000-000000000016', 3, 'Sanjay', 'Singhania', 'sanjay.owner11@example.com', '+918765432116', '$2b$10$xyz...', 'active', TRUE); -- Owns Shahi Rasoi

-- Delivery Partners
INSERT INTO users (id, role_id, first_name, last_name, email, phone, password_hash, status, is_verified) VALUES
('u0000000-0000-0000-0000-000000000006', 4, 'Amit', 'Singh', 'amit.driver1@example.com', '+917654321098', '$2b$10$xyz...', 'active', TRUE),
('u0000000-0000-0000-0000-000000000007', 4, 'Vikram', 'Rao', 'vikram.driver2@example.com', '+917654321099', '$2b$10$xyz...', 'active', TRUE);

-- 3. Seed Addresses
-- Restaurant Addresses
INSERT INTO addresses (id, user_id, address_type, street_address, landmark, city, state, postal_code, latitude, longitude, is_default) VALUES
('a0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000004', 'restaurant', '12, MG Road', 'Near Metro Station', 'Bengaluru', 'Karnataka', '560001', 12.9716, 77.5946, TRUE),
('a0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000005', 'restaurant', '45, Indiranagar Double Road', 'Opp Bank of Baroda', 'Bengaluru', 'Karnataka', '560038', 12.9784, 77.6408, TRUE),
('a0000000-0000-0000-0000-000000000008', 'u0000000-0000-0000-0000-000000000008', 'restaurant', '88, Koramangala 4th Block', 'Near Sony Signal', 'Bengaluru', 'Karnataka', '560034', 12.9343, 77.6244, TRUE),
('a0000000-0000-0000-0000-000000000009', 'u0000000-0000-0000-0000-000000000009', 'restaurant', '201, 100 Feet Road', 'Hal 2nd Stage', 'Bengaluru', 'Karnataka', '560008', 12.9698, 77.6413, TRUE),
('a0000000-0000-0000-0000-000000000010', 'u0000000-0000-0000-0000-000000000010', 'restaurant', '15, Residency Road', 'Opp Ritz Carlton', 'Bengaluru', 'Karnataka', '560025', 12.9610, 77.6011, TRUE),
('a0000000-0000-0000-0000-000000000011', 'u0000000-0000-0000-0000-000000000011', 'restaurant', '180, Brigade Road', 'Near Rex Theatre', 'Bengaluru', 'Karnataka', '560001', 12.9738, 77.6074, TRUE),
('a0000000-0000-0000-0000-000000000012', 'u0000000-0000-0000-0000-000000000012', 'restaurant', '55, Jayanagar 3rd Block', 'Near Madhavan Park', 'Bengaluru', 'Karnataka', '560011', 12.9348, 77.5872, TRUE),
('a0000000-0000-0000-0000-000000000013', 'u0000000-0000-0000-0000-000000000013', 'restaurant', '10, Lavelle Road', 'Near UB City', 'Bengaluru', 'Karnataka', '560001', 12.9715, 77.5960, TRUE),
('a0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000014', 'restaurant', '42, HSR Layout Sector 4', 'Near BDA Complex', 'Bengaluru', 'Karnataka', '560102', 12.9118, 77.6385, TRUE),
('a0000000-0000-0000-0000-000000000015', 'u0000000-0000-0000-0000-000000000015', 'restaurant', '72, Commercial Street', 'Near Police Station', 'Bengaluru', 'Karnataka', '560001', 12.9822, 77.6083, TRUE),
('a0000000-0000-0000-0000-000000000016', 'u0000000-0000-0000-0000-000000000016', 'restaurant', '310, Outer Ring Road', 'Opp Manyata Tech Park', 'Bengaluru', 'Karnataka', '560045', 13.0451, 77.6266, TRUE);

-- Customer Addresses
INSERT INTO addresses (id, user_id, address_type, street_address, landmark, city, state, postal_code, latitude, longitude, is_default) VALUES
('a0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000002', 'home', 'Flat 402, Sunshine Apts', 'Opp Children Park', 'Bengaluru', 'Karnataka', '560001', 12.9725, 77.5980, TRUE),
('a0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000003', 'work', 'Tower B, Tech Park', 'Floor 8', 'Bengaluru', 'Karnataka', '560103', 12.9279, 77.6833, TRUE);

-- 4. Seed Restaurants
INSERT INTO restaurants (id, owner_id, name, description, address_id, banner_image_url, logo_url, commission_rate, average_delivery_time, is_active, is_verified, status, opening_time, closing_time) VALUES
('r0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000004', 'The Curry House', 'Authentic North Indian Curries and Biryanis', 'a0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=80&auto=format&fit=crop', 12.50, 35, TRUE, TRUE, 'open', '11:00:00', '23:00:00'),
('r0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000005', 'Pizza Imperia', 'Woodfired pizzas and Italian pasta', 'a0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&auto=format&fit=crop', 10.00, 25, TRUE, TRUE, 'open', '12:00:00', '23:30:00'),
('r0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000008', 'Sushi World', 'Premium Japanese Sushi and Ramen', 'a0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=80&auto=format&fit=crop', 15.00, 40, TRUE, TRUE, 'open', '11:30:00', '22:30:00'),
('r0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000009', 'Bake & Brew Cafe', 'Fresh artisanal bakery and specialty coffee', 'a0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&auto=format&fit=crop', 8.00, 20, TRUE, TRUE, 'open', '08:00:00', '21:00:00'),
('r0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000010', 'Burger Bistro', 'Juicy burgers, crispy fries and shakes', 'a0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&auto=format&fit=crop', 12.00, 20, TRUE, TRUE, 'open', '10:00:00', '23:00:00'),
('r0000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000011', 'Wok Express', 'Spicy Schezwan and authentic Chinese noodles', 'a0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=80&auto=format&fit=crop', 11.00, 30, TRUE, TRUE, 'open', '11:00:00', '22:30:00'),
('r0000000-0000-0000-0000-000000000007', 'u0000000-0000-0000-0000-000000000012', 'Dakshin Delights', 'Crispy dosas and South Indian breakfast classics', 'a0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=80&auto=format&fit=crop', 9.00, 25, TRUE, TRUE, 'open', '07:00:00', '21:30:00'),
('r0000000-0000-0000-0000-000000000008', 'u0000000-0000-0000-0000-000000000013', 'Sweet Tooth Emporium', 'Heavenly desserts, pastries, and ice creams', 'a0000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=80&auto=format&fit=crop', 10.00, 15, TRUE, TRUE, 'open', '10:00:00', '23:59:00'),
('r0000000-0000-0000-0000-000000000009', 'u0000000-0000-0000-0000-000000000014', 'The Green Bowl', 'Fresh salads, healthy bowls, and protein shakes', 'a0000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&auto=format&fit=crop', 12.00, 30, TRUE, TRUE, 'open', '09:00:00', '22:00:00'),
('r0000000-0000-0000-0000-000000000010', 'u0000000-0000-0000-0000-000000000015', 'Rolls King', 'Tasty rolls, wraps and loaded quick bites', 'a0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=80&auto=format&fit=crop', 10.00, 20, TRUE, TRUE, 'open', '11:00:00', '23:30:00'),
('r0000000-0000-0000-0000-000000000011', 'u0000000-0000-0000-0000-000000000016', 'Shahi Rasoi', 'Authentic Gujarati and North Indian thali meals', 'a0000000-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1585934589900-54e50592426f?w=600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1585934589900-54e50592426f?w=80&auto=format&fit=crop', 10.00, 35, TRUE, TRUE, 'open', '11:30:00', '22:30:00');

-- 5. Seed Restaurant Categories
INSERT INTO restaurant_categories (id, name, image_url, is_active) VALUES
(1, 'North Indian', 'http://cdn/categories/north_indian.jpg', TRUE),
(2, 'Pizza', 'http://cdn/categories/pizza.jpg', TRUE),
(3, 'Biryani', 'http://cdn/categories/biryani.jpg', TRUE),
(4, 'Italian', 'http://cdn/categories/italian.jpg', TRUE),
(5, 'Japanese', 'http://cdn/categories/japanese.jpg', TRUE),
(6, 'Bakery', 'http://cdn/categories/bakery.jpg', TRUE),
(7, 'Burgers', 'http://cdn/categories/burgers.jpg', TRUE),
(8, 'Chinese', 'http://cdn/categories/chinese.jpg', TRUE),
(9, 'South Indian', 'http://cdn/categories/south_indian.jpg', TRUE),
(10, 'Desserts', 'http://cdn/categories/desserts.jpg', TRUE),
(11, 'Healthy', 'http://cdn/categories/healthy.jpg', TRUE),
(12, 'Rolls & Wraps', 'http://cdn/categories/rolls.jpg', TRUE),
(13, 'Thali', 'http://cdn/categories/thali.jpg', TRUE);

-- 6. Map Restaurants to Categories
INSERT INTO restaurant_category_mapping (restaurant_id, category_id) VALUES
('r0000000-0000-0000-0000-000000000001', 1),
('r0000000-0000-0000-0000-000000000001', 3),
('r0000000-0000-0000-0000-000000000002', 2),
('r0000000-0000-0000-0000-000000000002', 4),
('r0000000-0000-0000-0000-000000000003', 5),
('r0000000-0000-0000-0000-000000000004', 6),
('r0000000-0000-0000-0000-000000000005', 7),
('r0000000-0000-0000-0000-000000000006', 8),
('r0000000-0000-0000-0000-000000000007', 9),
('r0000000-0000-0000-0000-000000000008', 10),
('r0000000-0000-0000-0000-000000000009', 11),
('r0000000-0000-0000-0000-000000000010', 12),
('r0000000-0000-0000-0000-000000000011', 13);

-- 7. Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, sort_order, is_active) VALUES
('mc000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'Main Course', 1, TRUE),
('mc000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'Starters', 0, TRUE),
('mc000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000002', 'Gourmet Pizzas', 0, TRUE),
('mc000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000002', 'Beverages', 1, TRUE),
('mc000000-0000-0000-0000-000000000005', 'r0000000-0000-0000-0000-000000000003', 'Sushi & Rolls', 0, TRUE),
('mc000000-0000-0000-0000-000000000006', 'r0000000-0000-0000-0000-000000000003', 'Ramen & Bowls', 1, TRUE),
('mc000000-0000-0000-0000-000000000007', 'r0000000-0000-0000-0000-000000000004', 'Artisanal Bread & Pastry', 0, TRUE),
('mc000000-0000-0000-0000-000000000008', 'r0000000-0000-0000-0000-000000000004', 'Specialty Coffee', 1, TRUE),
('mc000000-0000-0000-0000-000000000009', 'r0000000-0000-0000-0000-000000000005', 'Gourmet Burgers', 0, TRUE),
('mc000000-0000-0000-0000-000000000010', 'r0000000-0000-0000-0000-000000000006', 'Hakka & Wok Specials', 0, TRUE),
('mc000000-0000-0000-0000-000000000011', 'r0000000-0000-0000-0000-000000000007', 'South Indian Classics', 0, TRUE),
('mc000000-0000-0000-0000-000000000012', 'r0000000-0000-0000-0000-000000000008', 'Decadent Desserts', 0, TRUE),
('mc000000-0000-0000-0000-000000000013', 'r0000000-0000-0000-0000-000000000009', 'Healthy Salads & Bowls', 0, TRUE),
('mc000000-0000-0000-0000-000000000014', 'r0000000-0000-0000-0000-000000000010', 'Wraps & Rolls', 0, TRUE),
('mc000000-0000-0000-0000-000000000015', 'r0000000-0000-0000-0000-000000000011', 'Premium Thalis', 0, TRUE);

-- 8. Menus
INSERT INTO menus (id, restaurant_id, category_id, name, description, price, is_veg, is_available, preparation_time) VALUES
('m0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000001', 'Butter Chicken', 'Tender tandoori chicken cooked in rich butter tomato gravy', 380.00, FALSE, TRUE, 20),
('m0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000001', 'Paneer Butter Masala', 'Fresh cottage cheese cooked in creamy tomato butter gravy', 320.00, TRUE, TRUE, 15),
('m0000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000002', 'Garlic Naan', 'Leavened flatbread brushed with garlic and butter', 80.00, TRUE, TRUE, 8),
('m0000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Margherita Pizza', 'Classic pizza with fresh mozzarella, basil, and San Marzano tomatoes', 299.00, TRUE, TRUE, 12),
('m0000000-0000-0000-0000-000000000005', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Chicken Pepperoni Pizza', 'Spiced chicken pepperoni slices with cheese blend', 420.00, FALSE, TRUE, 15),
('m0000000-0000-0000-0000-000000000006', 'r0000000-0000-0000-0000-000000000003', 'mc000000-0000-0000-0000-000000000005', 'California Roll', 'Premium crab meat, avocado, cucumber', 350.00, FALSE, TRUE, 10),
('m0000000-0000-0000-0000-000000000007', 'r0000000-0000-0000-0000-000000000003', 'mc000000-0000-0000-0000-000000000005', 'Spicy Tuna Roll', 'Fresh yellowfin tuna, spicy mayo, green onions', 390.00, FALSE, TRUE, 12),
('m0000000-0000-0000-0000-000000000008', 'r0000000-0000-0000-0000-000000000003', 'mc000000-0000-0000-0000-000000000006', 'Tonkotsu Ramen', 'Rich pork bone broth, soft-boiled egg, chashu pork', 450.00, FALSE, TRUE, 18),
('m0000000-0000-0000-0000-000000000009', 'r0000000-0000-0000-0000-000000000003', 'mc000000-0000-0000-0000-000000000006', 'Vegetable Gyoza', 'Pan-seared dumplings filled with seasoned vegetables', 250.00, TRUE, TRUE, 10),
('m0000000-0000-0000-0000-000000000010', 'r0000000-0000-0000-0000-000000000004', 'mc000000-0000-0000-0000-000000000007', 'Butter Croissant', 'Flaky, butter-laminated french style croissant', 120.00, TRUE, TRUE, 5),
('m0000000-0000-0000-0000-000000000011', 'r0000000-0000-0000-0000-000000000004', 'mc000000-0000-0000-0000-000000000007', 'Pain au Chocolat', 'Butter pastry filled with dark Belgian chocolate', 150.00, TRUE, TRUE, 5),
('m0000000-0000-0000-0000-000000000012', 'r0000000-0000-0000-0000-000000000004', 'mc000000-0000-0000-0000-000000000008', 'Cold Brew Coffee', 'Slow-steeped specialty single-origin coffee', 180.00, TRUE, TRUE, 3),
('m0000000-0000-0000-0000-000000000013', 'r0000000-0000-0000-0000-000000000004', 'mc000000-0000-0000-0000-000000000008', 'Caramel Macchiato', 'Espresso with steamed milk, vanilla syrup, caramel drizzle', 220.00, TRUE, TRUE, 5),
('m0000000-0000-0000-0000-000000000014', 'r0000000-0000-0000-0000-000000000001', 'mc000000-0000-0000-0000-000000000001', 'Dal Makhani', 'Slow-cooked black lentils in butter and cream', 280.00, TRUE, TRUE, 15),
('m0000000-0000-0000-0000-000000000015', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Four Cheese White Pizza', 'Mozzarella, gorgonzola, parmesan, ricotta', 380.00, TRUE, TRUE, 12),
('m0000000-0000-0000-0000-000000000016', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Garlic Breadsticks', 'Fresh baked dough brushed with butter and garlic herbs', 149.00, TRUE, TRUE, 8),
('m0000000-0000-0000-0000-000000000017', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Truffle Mushroom Pasta', 'Penne pasta in rich creamy parmesan and truffle oil sauce', 349.00, TRUE, TRUE, 12),
('m0000000-0000-0000-0000-000000000018', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Pesto Chicken Pizza', 'Grilled chicken, house basil pesto, sun-dried tomatoes', 449.00, FALSE, TRUE, 15),
('m0000000-0000-0000-0000-000000000019', 'r0000000-0000-0000-0000-000000000002', 'mc000000-0000-0000-0000-000000000003', 'Tiramisu', 'Classic Italian dessert with coffee-dipped ladyfingers and mascarpone', 199.00, TRUE, TRUE, 8),
('m0000000-0000-0000-0000-000000000020', 'r0000000-0000-0000-0000-000000000005', 'mc000000-0000-0000-0000-000000000009', 'Classic Cheese Burger', 'Grilled chicken patty with melted cheddar', 199.00, FALSE, TRUE, 12),
('m0000000-0000-0000-0000-000000000021', 'r0000000-0000-0000-0000-000000000005', 'mc000000-0000-0000-0000-000000000009', 'Crispy Veggie Burger', 'Crispy spiced vegetable patty with house sauce', 149.00, TRUE, TRUE, 10),
('m0000000-0000-0000-0000-000000000022', 'r0000000-0000-0000-0000-000000000006', 'mc000000-0000-0000-0000-000000000010', 'Schezwan Hakka Noodles', 'Stir-fried noodles in fiery Schezwan chili paste', 220.00, TRUE, TRUE, 15),
('m0000000-0000-0000-0000-000000000023', 'r0000000-0000-0000-0000-000000000006', 'mc000000-0000-0000-0000-000000000010', 'Kung Pao Chicken', 'Diced chicken stir-fried with peanuts and dry chilies', 320.00, FALSE, TRUE, 15),
('m0000000-0000-0000-0000-000000000024', 'r0000000-0000-0000-0000-000000000007', 'mc000000-0000-0000-0000-000000000011', 'Masala Dosa', 'Thin crispy rice crepe filled with potato masala', 120.00, TRUE, TRUE, 8),
('m0000000-0000-0000-0000-000000000025', 'r0000000-0000-0000-0000-000000000007', 'mc000000-0000-0000-0000-000000000011', 'Idli Sambar (2 Pcs)', 'Steamed soft rice cakes served with sambar and chutneys', 80.00, TRUE, TRUE, 5),
('m0000000-0000-0000-0000-000000000026', 'r0000000-0000-0000-0000-000000000008', 'mc000000-0000-0000-0000-000000000012', 'Hot Fudge Chocolate Brownie', 'Warm chocolate walnut brownie with hot fudge syrup', 160.00, TRUE, TRUE, 5),
('m0000000-0000-0000-0000-000000000027', 'r0000000-0000-0000-0000-000000000009', 'mc000000-0000-0000-0000-000000000013', 'Avocado Quinoa Salad', 'Creamy avocado, red quinoa, cherry tomatoes, lime vinaigrette', 290.00, TRUE, TRUE, 10),
('m0000000-0000-0000-0000-000000000028', 'r0000000-0000-0000-0000-000000000010', 'mc000000-0000-0000-0000-000000000014', 'Double Egg Chicken Roll', 'Flaky paratha layered with two eggs and spiced chicken filling', 180.00, FALSE, TRUE, 10),
('m0000000-0000-0000-0000-000000000029', 'r0000000-0000-0000-0000-000000000011', 'mc000000-0000-0000-0000-000000000015', 'Grand Maharaja Veg Thali', 'Assortment of paneer subzi, dal, rice, roti, sweet, and raita', 350.00, TRUE, TRUE, 20);

-- 9. Menu Images
INSERT INTO menu_images (id, menu_id, image_url, is_primary) VALUES
('mi000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000005', 'm0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000006', 'm0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000007', 'm0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000008', 'm0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000009', 'm0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000010', 'm0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000011', 'm0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000012', 'm0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000013', 'm0000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000014', 'm0000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000015', 'm0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000016', 'm0000000-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000017', 'm0000000-0000-0000-0000-000000000017', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000018', 'm0000000-0000-0000-0000-000000000018', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000019', 'm0000000-0000-0000-0000-000000000019', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000020', 'm0000000-0000-0000-0000-000000000020', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000021', 'm0000000-0000-0000-0000-000000000021', 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000022', 'm0000000-0000-0000-0000-000000000022', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000023', 'm0000000-0000-0000-0000-000000000023', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000024', 'm0000000-0000-0000-0000-000000000024', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000025', 'm0000000-0000-0000-0000-000000000025', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000026', 'm0000000-0000-0000-0000-000000000026', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000027', 'm0000000-0000-0000-0000-000000000027', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000028', 'm0000000-0000-0000-0000-000000000028', 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=600&auto=format&fit=crop', TRUE),
('mi000000-0000-0000-0000-000000000029', 'm0000000-0000-0000-0000-000000000029', 'https://images.unsplash.com/photo-1585934589900-54e50592426f?w=600&auto=format&fit=crop', TRUE);


-- 10. Inventory
INSERT INTO inventory (id, menu_id, available_quantity, unlimited) VALUES
('i0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 50, FALSE),
('i0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002', 100, FALSE),
('i0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000003', 200, FALSE),
('i0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000004', 30, FALSE),
('i0000000-0000-0000-0000-000000000005', 'm0000000-0000-0000-0000-000000000005', 0, FALSE), -- Sold out pepperoni
('i0000000-0000-0000-0000-000000000006', 'm0000000-0000-0000-0000-000000000006', 75, FALSE),
('i0000000-0000-0000-0000-000000000007', 'm0000000-0000-0000-0000-000000000007', 40, FALSE),
('i0000000-0000-0000-0000-000000000008', 'm0000000-0000-0000-0000-000000000008', 50, FALSE),
('i0000000-0000-0000-0000-000000000009', 'm0000000-0000-0000-0000-000000000009', 90, FALSE),
('i0000000-0000-0000-0000-000000000010', 'm0000000-0000-0000-0000-000000000010', 120, FALSE),
('i0000000-0000-0000-0000-000000000011', 'm0000000-0000-0000-0000-000000000011', 80, FALSE),
('i0000000-0000-0000-0000-000000000012', 'm0000000-0000-0000-0000-000000000012', 150, FALSE),
('i0000000-0000-0000-0000-000000000013', 'm0000000-0000-0000-0000-000000000013', 60, FALSE),
('i0000000-0000-0000-0000-000000000014', 'm0000000-0000-0000-0000-000000000014', 110, FALSE),
('i0000000-0000-0000-0000-000000000015', 'm0000000-0000-0000-0000-000000000015', 70, FALSE),
('i0000000-0000-0000-0000-000000000016', 'm0000000-0000-0000-0000-000000000016', 50, FALSE),
('i0000000-0000-0000-0000-000000000017', 'm0000000-0000-0000-0000-000000000017', 45, FALSE),
('i0000000-0000-0000-0000-000000000018', 'm0000000-0000-0000-0000-000000000018', 60, FALSE),
('i0000000-0000-0000-0000-000000000019', 'm0000000-0000-0000-0000-000000000019', 30, FALSE);

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
