-- ============================================================
-- 004. RESERVE STOCK SYSTEM MIGRATION
-- ============================================================

-- 1. Add payment_due_at to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMPTZ;

-- 2. Create the cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS void AS $$
DECLARE
  expired_order RECORD;
  o_item RECORD;
BEGIN
  -- Find all orders that are waiting_payment and past their due date
  FOR expired_order IN
    SELECT id FROM orders 
    WHERE status = 'waiting_payment' 
    AND payment_due_at < NOW()
  LOOP
    -- Update the order to cancelled
    UPDATE orders 
    SET status = 'cancelled', 
        cancelled_reason = 'Waktu pembayaran telah habis (otomatis oleh sistem)',
        cancelled_by = 'system',
        updated_at = NOW()
    WHERE id = expired_order.id;

    -- Return the stock for all items in this order
    FOR o_item IN
      SELECT product_id, quantity FROM order_items WHERE order_id = expired_order.id
    LOOP
      -- Only update if product_id is not null
      IF o_item.product_id IS NOT NULL THEN
        UPDATE products 
        SET stock = stock + o_item.quantity 
        WHERE id = o_item.product_id;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a helper function for checkout that does transaction
-- This ensures stock locking and order creation happens atomically
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
  END LOOP;

  -- Create the order record (locks for 15 minutes)
  INSERT INTO orders (
    buyer_id, 
    store_id, 
    shipping_address, 
    shipping_method, 
    shipping_cost, 
    total, 
    status, 
    payment_due_at
  ) VALUES (
    p_buyer_id,
    p_store_id,
    p_shipping_address,
    p_shipping_method,
    p_shipping_cost,
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
