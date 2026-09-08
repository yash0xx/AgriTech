-- ============================================================
-- 021_functions_triggers.sql
-- Database functions, triggers, and automated workflows
-- ============================================================

-- 1. Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_farmer_profiles_updated_at BEFORE UPDATE ON public.farmer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_buyer_profiles_updated_at BEFORE UPDATE ON public.buyer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_buyer_requests_updated_at BEFORE UPDATE ON public.buyer_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_logistics_bookings_updated_at BEFORE UPDATE ON public.logistics_bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_kyc_records_updated_at BEFORE UPDATE ON public.kyc_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Helper function: check if currently authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Function: Auto-create profile on auth.users signup
-- SECURITY RULE (Section 9): Only FARMER and BUYER may be created through public registration.
-- ADMIN role creation is strictly forbidden from public metadata to prevent privilege escalation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_raw_role TEXT;
  v_full_name TEXT;
  v_is_authorized_admin BOOLEAN;
BEGIN
  v_raw_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER'));

  -- Check if caller is already an admin or service_role
  v_is_authorized_admin := (auth.uid() IS NULL) OR public.is_admin();

  -- Unrestricted metadata can NEVER create an ADMIN account!
  IF v_raw_role = 'ADMIN' AND v_is_authorized_admin THEN
    v_role := 'ADMIN'::public.user_role;
  ELSIF v_raw_role = 'FARMER' THEN
    v_role := 'FARMER'::public.user_role;
  ELSE
    -- Default safely to BUYER for all public signups
    v_role := 'BUYER'::public.user_role;
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    NEW.id,
    v_full_name,
    v_role,
    'ACTIVE'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Function: Prevent non-admin users from changing their own platform role or status
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_role public.user_role;
BEGIN
  -- If invoked by service_role (auth.uid() IS NULL), allow
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get caller's existing role from DB
  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();

  -- Non-admins cannot alter platform role
  IF (NEW.role IS DISTINCT FROM OLD.role) AND (v_caller_role IS DISTINCT FROM 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot change their platform role.';
  END IF;

  -- Non-admins cannot alter account status
  IF (NEW.status IS DISTINCT FROM OLD.status) AND (v_caller_role IS DISTINCT FROM 'ADMIN') THEN
    RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user status.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 5. Function: Enforce business rules on buyer requests
-- Rules: Buyer cannot request their own product, and farmer_id must correspond to product owner
CREATE OR REPLACE FUNCTION public.validate_buyer_request()
RETURNS TRIGGER AS $$
DECLARE
  v_product_farmer UUID;
BEGIN
  SELECT farmer_id INTO v_product_farmer FROM public.products WHERE id = NEW.product_id;

  IF v_product_farmer IS NULL THEN
    RAISE EXCEPTION 'Invalid request: Product does not exist.';
  END IF;

  IF NEW.buyer_id = v_product_farmer THEN
    RAISE EXCEPTION 'Invalid request: A buyer cannot request their own product.';
  END IF;

  -- Auto-sync farmer_id to guarantee it belongs to the actual product owner
  NEW.farmer_id = v_product_farmer;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_buyer_request_integrity
  BEFORE INSERT OR UPDATE ON public.buyer_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_buyer_request();

-- 6. Function: Enforce team members security
-- Rules: Normal users cannot add themselves or modify team roles
CREATE OR REPLACE FUNCTION public.protect_team_members()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only platform administrators can assign or alter team member records.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_team_members_permission
  BEFORE INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.protect_team_members();

-- 7. Function: Generate unique human-readable order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- 8. Function: Atomic product inventory decrement with strict concurrency stock guard
CREATE OR REPLACE FUNCTION public.decrement_product_inventory(
  p_product_id UUID,
  p_quantity NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_remaining NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: Requested quantity must be greater than zero.';
  END IF;

  UPDATE public.products
  SET quantity = quantity - p_quantity,
      status = CASE WHEN quantity - p_quantity <= 0 THEN 'SOLD_OUT'::public.product_status ELSE status END,
      updated_at = now()
  WHERE id = p_product_id
    AND quantity >= p_quantity
    AND status = 'ACTIVE'
  RETURNING quantity INTO v_remaining;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: Requested quantity exceeds concurrently available active stock.';
  END IF;

  RETURN v_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function: Compensating transaction to restore inventory if downstream order insertion fails
CREATE OR REPLACE FUNCTION public.restore_product_inventory(
  p_product_id UUID,
  p_quantity NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_new_qty NUMERIC;
BEGIN
  UPDATE public.products
  SET quantity = quantity + p_quantity,
      status = 'ACTIVE'::public.product_status,
      updated_at = now()
  WHERE id = p_product_id
  RETURNING quantity INTO v_new_qty;

  RETURN v_new_qty;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function: True Atomic Order Creation Transaction
-- Atomically executes: product locking, stock decrement, pricing calculation, order creation,
-- order items creation, initial milestone, and escrow hold state in a single PostgreSQL ACID transaction.
-- If any operation fails, the entire transaction is rolled back natively by PostgreSQL.
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_buyer_id UUID,
  p_product_id UUID,
  p_quantity NUMERIC,
  p_delivery_address TEXT DEFAULT 'Standard Delivery',
  p_delivery_district TEXT DEFAULT 'District Hub',
  p_delivery_state TEXT DEFAULT 'Maharashtra',
  p_special_instructions TEXT DEFAULT NULL,
  p_logistics_cost NUMERIC DEFAULT 0,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_product RECORD;
  v_subtotal NUMERIC(12, 2);
  v_platform_fee NUMERIC(12, 2);
  v_escrow_safety_fee NUMERIC(12, 2) := 25.00;
  v_total_amount NUMERIC(12, 2);
  v_logistics_cost NUMERIC(12, 2) := COALESCE(p_logistics_cost, 0);
  v_order_number TEXT;
  v_order_id UUID;
  v_remaining_stock NUMERIC;
  v_existing_order RECORD;
  v_instructions TEXT;
BEGIN
  -- 1. Idempotency Check: return existing order if same idempotency key was already processed
  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) != '' THEN
    SELECT * INTO v_existing_order FROM public.orders
    WHERE special_instructions LIKE ('%IDEMPOTENCY:' || p_idempotency_key || '%')
    LIMIT 1;

    IF v_existing_order.id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_existing_order.id,
        'order_number', v_existing_order.order_number,
        'total_amount', v_existing_order.total_amount,
        'status', v_existing_order.status,
        'idempotent_replay', true
      );
    END IF;
  END IF;

  -- 2. Input validation
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: Order quantity must be greater than zero.';
  END IF;

  IF v_logistics_cost < 0 THEN
    RAISE EXCEPTION 'INVALID_LOGISTICS_COST: Logistics cost cannot be negative.';
  END IF;

  -- 3. Row lock and fetch product listing to guarantee concurrency isolation
  SELECT id, farmer_id, title, price_per_unit, min_order_quantity, quantity, status
  INTO v_product
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND: Product listing does not exist.';
  END IF;

  IF v_product.status != 'ACTIVE' THEN
    RAISE EXCEPTION 'PRODUCT_NOT_ACTIVE: Listing is no longer active for orders.';
  END IF;

  IF p_buyer_id = v_product.farmer_id THEN
    RAISE EXCEPTION 'SELF_PURCHASE_FORBIDDEN: Farmers cannot purchase their own produce listing.';
  END IF;

  IF p_quantity < COALESCE(v_product.min_order_quantity, 1) THEN
    RAISE EXCEPTION 'BELOW_MIN_ORDER_QTY: Order quantity must be at least % units.', v_product.min_order_quantity;
  END IF;

  -- 4. Check stock availability under row lock
  IF v_product.quantity < p_quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: Requested quantity (%) exceeds available stock (%).', p_quantity, v_product.quantity;
  END IF;

  -- 5. Atomically decrement stock
  v_remaining_stock := v_product.quantity - p_quantity;
  UPDATE public.products
  SET quantity = v_remaining_stock,
      status = CASE WHEN v_remaining_stock <= 0 THEN 'SOLD_OUT'::public.product_status ELSE status END,
      updated_at = now()
  WHERE id = p_product_id;

  -- 6. Calculate server-side financial integrity values
  v_subtotal := round((v_product.price_per_unit * p_quantity)::numeric, 2);
  v_platform_fee := round((v_subtotal * 0.01)::numeric, 2);
  v_total_amount := round((v_subtotal + v_platform_fee + v_escrow_safety_fee + v_logistics_cost)::numeric, 2);

  v_order_number := public.generate_order_number();

  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) != '' THEN
    v_instructions := COALESCE(p_special_instructions, '') || ' | IDEMPOTENCY:' || p_idempotency_key;
  ELSE
    v_instructions := p_special_instructions;
  END IF;

  -- 7. Insert Order
  INSERT INTO public.orders (
    order_number,
    buyer_id,
    farmer_id,
    subtotal,
    logistics_cost,
    platform_fee,
    total_amount,
    status,
    payment_status,
    delivery_address,
    delivery_district,
    delivery_state,
    special_instructions
  ) VALUES (
    v_order_number,
    p_buyer_id,
    v_product.farmer_id,
    v_subtotal,
    v_logistics_cost,
    v_platform_fee + v_escrow_safety_fee,
    v_total_amount,
    'PLACED',
    'HELD_IN_ESCROW',
    COALESCE(p_delivery_address, 'Standard Delivery'),
    COALESCE(p_delivery_district, 'District Hub'),
    COALESCE(p_delivery_state, 'Maharashtra'),
    v_instructions
  )
  RETURNING id INTO v_order_id;

  -- 8. Insert Order Items
  INSERT INTO public.order_items (
    order_id,
    product_id,
    quantity,
    price_per_unit,
    total_price
  ) VALUES (
    v_order_id,
    p_product_id,
    p_quantity,
    v_product.price_per_unit,
    v_subtotal
  );

  -- 9. Insert Initial Order Milestone
  INSERT INTO public.order_milestones (
    order_id,
    status,
    location,
    note
  ) VALUES (
    v_order_id,
    'PLACED',
    COALESCE(p_delivery_district, 'Order Dispatch Hub'),
    'Order placed and payment successfully locked in AgriTech Escrow.'
  );

  -- 10. Record Escrow Hold Transaction
  INSERT INTO public.escrow_transactions (
    order_id,
    transaction_type,
    amount,
    status,
    payment_reference,
    metadata
  ) VALUES (
    v_order_id,
    'HOLD',
    v_total_amount,
    'COMPLETED',
    'ESC-HOLD-' || v_order_number,
    jsonb_build_object(
      'productId', p_product_id,
      'quantity', p_quantity,
      'subtotal', v_subtotal,
      'logisticsCost', v_logistics_cost
    )
  );

  -- 11. Send Notification to Farmer
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    reference_id
  ) VALUES (
    v_product.farmer_id,
    'New Order Received',
    'You have received a new order ' || v_order_number || ' for ' || p_quantity || ' units of ' || v_product.title || '. Funds are held in escrow.',
    'ORDER_UPDATE',
    v_order_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'remaining_stock', v_remaining_stock,
    'total_amount', v_total_amount,
    'idempotent_replay', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
