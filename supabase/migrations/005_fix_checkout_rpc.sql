-- ============================================================
-- 005. FIX CHECKOUT RPC
-- ============================================================

CREATE OR REPLACE FUNCTION process_checkout_reservation(
  p_buyer_id UUID,
  p_store_id UUID,
  p_shipping_address TEXT,
  p_shipping_method TEXT,
  p_shipping_cost DECIMAL,
  p_total DECIMAL,
  p_items JSONB -- Array of items: [{product_id, quantity, price, snapshot}]
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_stock INT;
  v_order_number TEXT;
  v_subtotal DECIMAL := 0;
BEGIN
  -- First, check and deduct stock for all items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check current stock and lock row
    SELECT stock INTO v_stock FROM products WHERE id = (v_item->>'product_id')::UUID FOR UPDATE;
    
    IF v_stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Stok tidak mencukupi untuk produk ID: %', v_item->>'product_id';
    END IF;

    -- Deduct stock
    UPDATE products 
    SET stock = stock - (v_item->>'quantity')::INT
    WHERE id = (v_item->>'product_id')::UUID;

    v_subtotal := v_subtotal + ((v_item->>'price')::DECIMAL * (v_item->>'quantity')::INT);
  END LOOP;

  -- Generate order number
  v_order_number := 'PLV-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || SUBSTRING(p_store_id::text, 1, 4);

  -- Create the order record (locks for 15 minutes)
  INSERT INTO orders (
    order_number,
    buyer_id, 
    store_id, 
    address_snapshot, 
    shipping_courier, 
    shipping_cost, 
    subtotal,
    total, 
    status, 
    payment_due_at
  ) VALUES (
    v_order_number,
    p_buyer_id,
    p_store_id,
    p_shipping_address::JSONB,
    p_shipping_method,
    p_shipping_cost,
    v_subtotal,
    p_total,
    'waiting_payment',
    NOW() + INTERVAL '15 minutes'
  ) RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price,
      product_snapshot
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INT,
      (v_item->>'price')::DECIMAL,
      v_item->'snapshot'
    );
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
