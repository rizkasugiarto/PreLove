-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  seller1_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  seller2_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  buyer1_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  buyer2_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  
  cat_wanita UUID;
  cat_pria UUID;
  cat_tas UUID;
  
  prod1 UUID := '11111111-1111-1111-1111-111111111111';
  prod2 UUID := '22222222-2222-2222-2222-222222222222';
  prod3 UUID := '33333333-3333-3333-3333-333333333333';
  prod4 UUID := '44444444-4444-4444-4444-444444444444';
  prod5 UUID := '55555555-5555-5555-5555-555555555555';
  prod6 UUID := '66666666-6666-6666-6666-666666666666';
  prod7 UUID := '77777777-7777-7777-7777-777777777777';
  prod8 UUID := '88888888-8888-8888-8888-888888888888';
  
  enc_password VARCHAR := crypt('Password123!', gen_salt('bf'));
BEGIN

  -- 1. Get Categories
  SELECT id INTO cat_wanita FROM categories WHERE slug = 'fashion-wanita' LIMIT 1;
  SELECT id INTO cat_pria FROM categories WHERE slug = 'fashion-pria' LIMIT 1;
  SELECT id INTO cat_tas FROM categories WHERE slug = 'tas-aksesoris' LIMIT 1;

  -- 2. Create Users in auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES 
  ('00000000-0000-0000-0000-000000000000', seller1_id, 'authenticated', 'authenticated', 'seller1@prelove.test', enc_password, now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Rina Maharani", "username": "rina_hijab"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', seller2_id, 'authenticated', 'authenticated', 'seller2@prelove.test', enc_password, now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Siti Nurhaliza", "username": "siti_modesty"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', buyer1_id, 'authenticated', 'authenticated', 'buyer1@prelove.test', enc_password, now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Anisa Rahmawati", "username": "anisa_buyer"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', buyer2_id, 'authenticated', 'authenticated', 'buyer2@prelove.test', enc_password, now(), '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dewi Kartika", "username": "dewi_buyer"}', now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Update Profiles (trigger will auto-create them, so we DO UPDATE)
  INSERT INTO public.profiles (id, username, full_name, role) VALUES 
  (seller1_id, 'rina_hijab', 'Rina Maharani', 'seller'),
  (seller2_id, 'siti_modesty', 'Siti Nurhaliza', 'seller'),
  (buyer1_id, 'anisa_buyer', 'Anisa Rahmawati', 'customer'),
  (buyer2_id, 'dewi_buyer', 'Dewi Kartika', 'customer')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, username = EXCLUDED.username;

  -- 4. Create Stores
  INSERT INTO public.stores (id, owner_id, name, slug, description, city, province, phone, logo_url, rating, total_sales) VALUES 
  (seller1_id, seller1_id, 'Hijab Aesthetic Store', 'hijab-aesthetic-store', 'Koleksi hijab premium second hand.', 'Bandung', 'Jawa Barat', '082211223344', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop', 4.9, 234),
  (seller2_id, seller2_id, 'Modesty Closet', 'modesty-closet', 'Fashion muslimah modern.', 'Jakarta Selatan', 'DKI Jakarta', '089955443322', 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&h=200&fit=crop', 4.7, 178)
  ON CONFLICT (id) DO NOTHING;

  -- 5. Insert Products
  INSERT INTO public.products (id, store_id, category_id, title, description, price, original_price, condition, stock, rating, total_reviews) VALUES 
  (prod1, seller1_id, cat_wanita, 'Hijab Voal Premium Motif Bunga Mewah', 'Hijab voal premium motif bunga.', 85000, 220000, 'like_new', 3, 5.0, 12),
  (prod2, seller1_id, cat_wanita, 'Pashmina Satin Silk Polos Abu Elegance', 'Pashmina satin silk abu-abu.', 65000, 180000, 'good', 1, 4.8, 7),
  (prod3, seller1_id, cat_wanita, 'Gamis Syari Wolfis Set Khimar XL', 'Gamis syari wolfis tebal.', 195000, 550000, 'like_new', 1, 4.9, 21),
  (prod4, seller1_id, cat_tas, 'Tas Selempang Wanita Muslimah Kulit Sintetis', 'Tas selempang cantik.', 120000, 350000, 'good', 2, 4.7, 5),
  
  (prod5, seller2_id, cat_wanita, 'Baju Atasan Blouse Tunik Muslimah Crinkle', 'Atasan tunik crinkle airflow.', 75000, 200000, 'like_new', 2, 4.8, 15),
  (prod6, seller2_id, cat_wanita, 'Dress Midi Floral Muslimah Lengan Panjang', 'Dress midi cantik bermotif bunga.', 150000, 420000, 'good', 1, 5.0, 8),
  (prod7, seller2_id, cat_wanita, 'Hijab Bergo Instan Jersey Premium Anti Merosot', 'Bergo instan jersey.', 45000, 120000, 'like_new', 5, 4.9, 30),
  (prod8, seller2_id, cat_pria, 'Koko Pria Bahan Katun Premium Motif Songket', 'Baju koko motif songket.', 130000, 380000, 'good', 1, 4.6, 9)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Insert Product Images (delete first to avoid duplicates if run multiple times)
  DELETE FROM public.product_images WHERE product_id IN (prod1, prod2, prod3, prod4, prod5, prod6, prod7, prod8);
  
  INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES 
  (prod1, 'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=800&q=80', true),
  (prod2, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', true),
  (prod3, 'https://images.unsplash.com/photo-1606216840131-7fc7dee2f8e3?auto=format&fit=crop&w=800&q=80', true),
  (prod4, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', true),
  
  (prod5, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80', true),
  (prod6, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', true),
  (prod7, 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80', true),
  (prod8, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80', true);

END $$;
