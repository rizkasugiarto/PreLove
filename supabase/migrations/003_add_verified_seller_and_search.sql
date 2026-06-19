-- 1. Tambahkan kolom is_verified ke tabel stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Buat fungsi RPC untuk Smart Search menggunakan Full-Text Search
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, category_filter UUID DEFAULT NULL, condition_filter TEXT DEFAULT NULL, min_price NUMERIC DEFAULT NULL, max_price NUMERIC DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  original_price DECIMAL,
  condition TEXT,
  stock INT,
  rating DECIMAL,
  store_id UUID,
  store_name TEXT,
  store_is_verified BOOLEAN,
  image_url TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.description, p.price, p.original_price, p.condition, p.stock, p.rating,
    s.id as store_id, s.name as store_name, s.is_verified as store_is_verified,
    (SELECT img.image_url FROM product_images img WHERE img.product_id = p.id ORDER BY img.is_primary DESC LIMIT 1) as image_url,
    ts_rank(to_tsvector('indonesian', p.title || ' ' || COALESCE(p.description, '')), plainto_tsquery('indonesian', search_query)) as similarity
  FROM products p
  JOIN stores s ON p.store_id = s.id
  WHERE p.is_active = true 
    AND p.stock > 0
    AND (search_query = '' OR to_tsvector('indonesian', p.title || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('indonesian', search_query))
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (condition_filter IS NULL OR p.condition = condition_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  ORDER BY similarity DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
