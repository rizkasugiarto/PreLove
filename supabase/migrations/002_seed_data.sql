-- ============================================================
-- PreLove - Seed Data
-- Jalankan SETELAH 001_initial_schema.sql
-- ============================================================

-- Categories
INSERT INTO categories (name, slug, icon_url, sort_order) VALUES
('Fashion Wanita', 'fashion-wanita', NULL, 1),
('Fashion Pria', 'fashion-pria', NULL, 2),
('Elektronik', 'elektronik', NULL, 3),
('Buku & Alat Tulis', 'buku-alat-tulis', NULL, 4),
('Peralatan Rumah', 'peralatan-rumah', NULL, 5),
('Tas & Aksesoris', 'tas-aksesoris', NULL, 6),
('Sepatu', 'sepatu', NULL, 7),
('Olahraga', 'olahraga', NULL, 8),
('Mainan & Hobi', 'mainan-hobi', NULL, 9),
('Lainnya', 'lainnya', NULL, 10)
ON CONFLICT (slug) DO NOTHING;

-- Bank Accounts (untuk pembayaran manual)
INSERT INTO bank_accounts (bank_name, account_number, account_name, sort_order) VALUES
('BCA', '1234567890', 'PreLove Marketplace', 1),
('BNI', '0987654321', 'PreLove Marketplace', 2),
('BRI', '1122334455', 'PreLove Marketplace', 3),
('GoPay', '081234567890', 'PreLove Marketplace', 4),
('OVO', '081234567890', 'PreLove Marketplace', 5)
ON CONFLICT (account_number) DO NOTHING;
