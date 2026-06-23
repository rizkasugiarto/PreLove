-- ============================================================
-- PreLove Marketplace - Initial Database Schema
-- Run this on Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  is_banned BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  fcm_token TEXT, -- Firebase Cloud Messaging token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. STORES (Toko)
-- ============================================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sales INT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PRODUCTS (Produk)
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  original_price DECIMAL(15,2), -- harga beli aslinya
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  category_id UUID REFERENCES categories(id),
  stock INT DEFAULT 1,
  weight_gram INT DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  is_sold BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. ADDRESSES (Alamat Pengiriman)
-- ============================================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah', -- 'Rumah', 'Kos', 'Kantor', etc
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CART ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. PLV-20240614-0001
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  address_id UUID REFERENCES addresses(id),
  -- Snapshot alamat agar tidak berubah jika user edit alamat
  address_snapshot JSONB,
  shipping_courier TEXT DEFAULT 'COD' CHECK (shipping_courier IN ('COD', 'JNE', 'JNT', 'SiCepat', 'AnterAja')),
  shipping_service TEXT,
  shipping_cost DECIMAL(15,2) DEFAULT 0,
  tracking_number TEXT,
  subtotal DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  -- Payment (Manual Transfer)
  payment_method TEXT DEFAULT 'manual_transfer',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'refunded')),
  payment_proof_url TEXT, -- URL bukti transfer
  payment_bank TEXT, -- Bank tujuan transfer
  payment_account_number TEXT,
  payment_account_name TEXT,
  -- Order Status
  status TEXT DEFAULT 'waiting_payment' CHECK (status IN (
    'waiting_payment',   -- menunggu pembayaran
    'pending',           -- sudah bayar, menunggu konfirmasi penjual
    'confirmed',         -- penjual konfirmasi
    'packed',            -- barang dikemas
    'shipped',           -- barang dikirim
    'delivered',         -- barang tiba (user konfirmasi)
    'completed',         -- selesai (sudah review)
    'cancelled'          -- dibatalkan
  )),
  notes TEXT,
  cancelled_reason TEXT,
  cancelled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL, -- harga saat transaksi
  product_snapshot JSONB NOT NULL -- snapshot data produk
);

-- ============================================================
-- 10. REVIEWS (Rating & Review)
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image_urls TEXT[], -- array URL gambar review
  seller_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_item_id, reviewer_id)
);

-- ============================================================
-- 11. WISHLISTS
-- ============================================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 12. CHAT ROOMS
-- ============================================================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  product_id UUID REFERENCES products(id), -- produk yang pertama ditanyakan
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  buyer_unread_count INT DEFAULT 0,
  seller_unread_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, store_id)
);

-- ============================================================
-- 13. CHAT MESSAGES
-- ============================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order_update', 'chat', 'review', 'payment', 'promo', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. REPORTS (Laporan)
-- ============================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('product', 'store', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- 16. BANK ACCOUNTS (Rekening Admin untuk pembayaran manual)
-- ============================================================
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name TEXT NOT NULL, -- 'BCA', 'BNI', 'BRI', 'Mandiri', 'GoPay', 'OVO', etc
  account_number TEXT UNIQUE NOT NULL,
  account_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES untuk performa
-- ============================================================
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Full-text search index untuk produk
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('indonesian', title || ' ' || COALESCE(description, '')));

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile after user registers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today TEXT;
  seq INT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO seq FROM orders WHERE DATE(created_at) = CURRENT_DATE;
  NEW.order_number := 'PLV-' || today || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update product rating when review is added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;

  UPDATE stores SET
    rating = (SELECT AVG(rating) FROM reviews WHERE store_id = NEW.store_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE store_id = NEW.store_id)
  WHERE id = NEW.store_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Profiles: siapa saja bisa lihat, hanya pemilik yang bisa update
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: semua bisa baca
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

-- Stores: semua bisa lihat store aktif
CREATE POLICY "stores_select_active" ON stores FOR SELECT USING (is_active = true OR owner_id = auth.uid());
CREATE POLICY "stores_insert_own" ON stores FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "stores_update_own" ON stores FOR UPDATE USING (auth.uid() = owner_id);

-- Products: semua bisa lihat produk aktif
CREATE POLICY "products_select_active" ON products FOR SELECT USING (is_active = true OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "products_insert_own" ON products FOR INSERT WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "products_update_own" ON products FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "products_delete_own" ON products FOR DELETE USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- Product images
CREATE POLICY "product_images_select_all" ON product_images FOR SELECT USING (true);
CREATE POLICY "product_images_insert_own" ON product_images FOR INSERT WITH CHECK (product_id IN (SELECT p.id FROM products p JOIN stores s ON s.id = p.store_id WHERE s.owner_id = auth.uid()));
CREATE POLICY "product_images_delete_own" ON product_images FOR DELETE USING (product_id IN (SELECT p.id FROM products p JOIN stores s ON s.id = p.store_id WHERE s.owner_id = auth.uid()));

-- Addresses: hanya pemilik
CREATE POLICY "addresses_own" ON addresses USING (auth.uid() = user_id);

-- Cart: hanya pemilik
CREATE POLICY "cart_own" ON cart_items USING (auth.uid() = user_id);

-- Orders: buyer dan seller toko bisa lihat
CREATE POLICY "orders_buyer" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "orders_seller" ON orders FOR SELECT USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
CREATE POLICY "orders_insert_buyer" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_update_buyer" ON orders FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "orders_update_seller" ON orders FOR UPDATE USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- Order items
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid() OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid())
);

-- Reviews: semua bisa baca, hanya pembeli yg bisa tulis
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Wishlists: hanya pemilik
CREATE POLICY "wishlists_own" ON wishlists USING (auth.uid() = user_id);

-- Chat rooms: buyer dan seller toko
CREATE POLICY "chat_rooms_select" ON chat_rooms FOR SELECT USING (
  auth.uid() = buyer_id OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);
CREATE POLICY "chat_rooms_insert" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "chat_rooms_update" ON chat_rooms FOR UPDATE USING (
  auth.uid() = buyer_id OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
);

-- Chat messages
CREATE POLICY "chat_messages_select" ON chat_messages FOR SELECT USING (
  room_id IN (SELECT id FROM chat_rooms WHERE buyer_id = auth.uid() OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
);
CREATE POLICY "chat_messages_insert" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  room_id IN (SELECT id FROM chat_rooms WHERE buyer_id = auth.uid() OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
);

-- Notifications: hanya pemilik
CREATE POLICY "notifications_own" ON notifications USING (auth.uid() = user_id);

-- Reports: hanya reporter dan admin
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Bank accounts: semua bisa lihat
CREATE POLICY "bank_accounts_select" ON bank_accounts FOR SELECT USING (is_active = true);
