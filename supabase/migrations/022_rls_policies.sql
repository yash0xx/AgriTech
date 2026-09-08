-- ============================================================
-- 022_rls_policies.sql
-- Complete Row Level Security (RLS) policies for AgriTech
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Public can view basic farmer profiles for marketplace"
  ON public.profiles FOR SELECT
  USING (role = 'FARMER' AND status = 'ACTIVE');

CREATE POLICY "Users can update own profile data"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin() OR (
      auth.uid() = id AND
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
      status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- ------------------------------------------------------------
-- FARMER PROFILES
-- ------------------------------------------------------------
CREATE POLICY "Authenticated users can read farmer profiles"
  ON public.farmer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Farmers can insert own profile"
  ON public.farmer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Farmers can update own profile"
  ON public.farmer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------
-- BUYER PROFILES
-- ------------------------------------------------------------
CREATE POLICY "Buyers can read own profile and admins can read all"
  ON public.buyer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Buyers can insert own profile"
  ON public.buyer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Buyers can update own profile"
  ON public.buyer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE POLICY "Anyone authenticated can view active products"
  ON public.products FOR SELECT
  TO authenticated
  USING (status = 'ACTIVE' OR farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Farmers can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Farmers can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid() OR public.is_admin())
  WITH CHECK (farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Farmers can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------
-- PRODUCT IMAGES
-- ------------------------------------------------------------
CREATE POLICY "Anyone authenticated can view product images"
  ON public.product_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Farmers can manage own product images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_images.product_id AND (farmer_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------
-- MANDI PRICES
-- ------------------------------------------------------------
CREATE POLICY "Authenticated users can read mandi prices"
  ON public.mandi_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mandi prices"
  ON public.mandi_prices FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------
-- BUYER REQUESTS
-- ------------------------------------------------------------
CREATE POLICY "Parties and admins can view buyer requests"
  ON public.buyer_requests FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Buyers can create requests"
  ON public.buyer_requests FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Parties can update requests"
  ON public.buyer_requests FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------
-- REQUEST COUNTERS
-- ------------------------------------------------------------
CREATE POLICY "Parties and admins can view request counters"
  ON public.request_counters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buyer_requests
      WHERE id = request_counters.request_id
        AND (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Parties can create request counters"
  ON public.request_counters FOR INSERT
  TO authenticated
  WITH CHECK (offered_by = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------
-- ORDERS & ORDER ITEMS
-- ------------------------------------------------------------
CREATE POLICY "Parties and admins can view orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Buyers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Parties can update order status"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Parties and admins can view order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id
        AND (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Buyers can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND (buyer_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------
-- ORDER MILESTONES
-- ------------------------------------------------------------
CREATE POLICY "Parties and admins can view order milestones"
  ON public.order_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_milestones.order_id
        AND (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Parties and admins can insert milestones"
  ON public.order_milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_milestones.order_id
        AND (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------
-- ESCROW TRANSACTIONS (Strict Security)
-- ------------------------------------------------------------
CREATE POLICY "Parties and admins can view escrow transactions"
  ON public.escrow_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = escrow_transactions.order_id
        AND (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin())
    )
  );

-- Escrow modification is ONLY allowed by admins or service-role (no client write)
CREATE POLICY "Only admins can insert or update escrow transactions"
  ON public.escrow_transactions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- LOGISTICS BOOKINGS
-- ------------------------------------------------------------
CREATE POLICY "Parties and admins can view logistics"
  ON public.logistics_bookings FOR SELECT
  TO authenticated
  USING (
    farmer_id = auth.uid() OR buyer_id = auth.uid() OR public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = logistics_bookings.order_id
        AND (buyer_id = auth.uid() OR farmer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Parties can book logistics"
  ON public.logistics_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = auth.uid() OR buyer_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "Parties and admins can update logistics"
  ON public.logistics_bookings FOR UPDATE
  TO authenticated
  USING (
    farmer_id = auth.uid() OR buyer_id = auth.uid() OR public.is_admin()
  );

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------
-- DISPUTES
-- ------------------------------------------------------------
CREATE POLICY "Order parties and admins can view disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    raised_by = auth.uid() OR
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = disputes.order_id AND (buyer_id = auth.uid() OR farmer_id = auth.uid())
    )
  );

CREATE POLICY "Order parties can raise disputes"
  ON public.disputes FOR INSERT
  TO authenticated
  WITH CHECK (raised_by = auth.uid());

CREATE POLICY "Admins can resolve disputes"
  ON public.disputes FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------
-- KYC RECORDS
-- ------------------------------------------------------------
CREATE POLICY "Users can read own KYC records and admins read all"
  ON public.kyc_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can submit own KYC records"
  ON public.kyc_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins and owners can update KYC records"
  ON public.kyc_records FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR (user_id = auth.uid() AND status IN ('PENDING', 'REJECTED')))
  WITH CHECK (public.is_admin() OR (user_id = auth.uid() AND status = 'PENDING'));

-- ------------------------------------------------------------
-- AUDIT LOGS (Immutable)
-- ------------------------------------------------------------
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated users can create audit log entries"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Notice: NO UPDATE or DELETE policies for audit_logs. They are immutable!

-- ------------------------------------------------------------
-- TEAM MEMBERS (Strict Access Controls)
-- ------------------------------------------------------------
CREATE POLICY "Admins can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can assign team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can modify team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can remove team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (public.is_admin());
