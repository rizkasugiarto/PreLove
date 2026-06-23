-- ============================================================
-- Fix Product Deletion Constraints & RLS
-- ============================================================

-- 1. Update Foreign Key for order_items (Preserve order history if product deleted)
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- 2. Update Foreign Key for chat_rooms (Preserve chat history if product deleted)
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_product_id_fkey;
ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- 3. Update Foreign Key for reviews (Delete reviews if product deleted)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 4. Add RLS policy to allow sellers to cascade delete products from carts
DROP POLICY IF EXISTS "cart_items_seller_cascade" ON cart_items;
CREATE POLICY "cart_items_seller_cascade" ON cart_items FOR DELETE
USING (
  product_id IN (
    SELECT id FROM products WHERE store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
);

-- 5. Add RLS policy to allow sellers to cascade delete products from wishlists
DROP POLICY IF EXISTS "wishlists_seller_cascade" ON wishlists;
CREATE POLICY "wishlists_seller_cascade" ON wishlists FOR DELETE
USING (
  product_id IN (
    SELECT id FROM products WHERE store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
);
