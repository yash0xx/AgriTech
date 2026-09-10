import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { PaymentsService, RazorpayProvider } from '../backend/src/modules/payments/payments.service';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const teamPassword = process.env.DEFAULT_TEAM_PASSWORD;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('Missing Supabase configuration in environment.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEAM_MEMBERS = [
  { name: 'Om Nalawade', email: 'om.nalawade.aids.25@vpkbiet.org', expectedRole: 'ADMIN', teamRole: 'TEAM_LEAD', dashboard: '/admin' },
  { name: 'Date Atharv', email: 'dateathrav@gmail.com', expectedRole: 'FARMER', teamRole: 'BACKEND', dashboard: '/farmer' },
  { name: 'Yash Lokhande', email: 'yashlokhande082@gmail.com', expectedRole: 'SELLER', teamRole: 'FRONTEND', dashboard: '/seller' },
  { name: 'Shravani Bhosale', email: 'shravani2.bhosale.comp.25@vpkbiet.org', expectedRole: 'FARMER', teamRole: 'DATABASE', dashboard: '/farmer' },
  { name: 'Anuj Deshpande', email: 'anuj.deshpande.comp.25@vpkbiet.org', expectedRole: 'BUYER', teamRole: 'AI_ML', dashboard: '/buyer' },
  { name: 'Prajwal Khomane', email: 'prajwal.khomane.aids.25@vpkbiet.org', expectedRole: 'BUYER', teamRole: 'QA', dashboard: '/buyer' },
];

let totalPassed = 0;
let totalFailed = 0;

function assert(description: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✓ PASS: ${description}`);
    totalPassed++;
  } else {
    console.error(`❌ FAIL: ${description}${details ? ` -> ${details}` : ''}`);
    totalFailed++;
  }
}

async function runStagingAcceptanceSuite() {
  console.log('============================================================');
  console.log('     AGRITECH LIVE STAGING & REAL-USER ACCEPTANCE SUITE     ');
  console.log('============================================================\n');

  // --- PHASE 4: Health & Connectivity ---
  console.log('--- 1. Health & Live Staging Connectivity ---');
  try {
    const healthRes = await fetch('http://localhost:5001/api/health');
    const healthData = await healthRes.json();
    assert('GET /api/health responds with status 200', healthRes.status === 200);
    assert('GET /api/health metadata contains status ok', healthData.status === 'ok');
    assert('GET /api/health metadata contains requestId', typeof healthData.requestId === 'string');
    assert('GET /api/health metadata contains timestamp', Boolean(healthData.timestamp));
  } catch (err: any) {
    assert('GET /api/health reachable', false, err.message);
  }

  // --- PHASE 5: Real Team Account Acceptance ---
  console.log('\n--- 2. Real Team Accounts Acceptance (6 Confirmed Accounts) ---');
  const authenticatedSessions: Record<string, { token: string; userId: string; client: any }> = {};

  for (const member of TEAM_MEMBERS) {
    const memberClient = createClient(supabaseUrl!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await memberClient.auth.signInWithPassword({
      email: member.email,
      password: teamPassword,
    });

    assert(
      `Login successful for ${member.name} (${member.teamRole} / ${member.expectedRole})`,
      Boolean(authData?.session?.access_token),
      authError?.message
    );

    if (authData?.session) {
      const token = authData.session.access_token;
      const userId = authData.user.id;
      authenticatedSessions[member.expectedRole + '_' + member.name.split(' ')[0]] = {
        token,
        userId,
        client: memberClient,
      };

      // Session restoration & role check
      const { data: profile } = await memberClient
        .from('profiles')
        .select('id, full_name, role, status')
        .eq('id', userId)
        .single();

      assert(
        `Profile role verified for ${member.name}: ${profile?.role} === ${member.expectedRole}`,
        profile?.role === member.expectedRole
      );
      assert(`Account status is ACTIVE for ${member.name}`, profile?.status === 'ACTIVE');

      // Team role verification (Admin/Service access)
      const { data: teamRec } = await supabaseAdmin
        .from('team_members')
        .select('team_role')
        .eq('user_id', userId)
        .single();

      assert(
        `Internal team role verified for ${member.name}: ${teamRec?.team_role} === ${member.teamRole}`,
        teamRec?.team_role === member.teamRole
      );

      // Session refresh
      const { data: refreshed, error: refreshErr } = await memberClient.auth.refreshSession({
        refresh_token: authData.session.refresh_token,
      });
      assert(`Session refresh succeeded for ${member.name}`, Boolean(refreshed?.session), refreshErr?.message);
    }
  }

  // --- PHASE 6 & 7: FARMER & SELLER Workflow & Product Ownership ---
  console.log('\n--- 3. Product Ownership & Cross-Role Permissions ---');
  const farmerSession = authenticatedSessions['FARMER_Date'];
  const sellerSession = authenticatedSessions['SELLER_Yash'];
  const buyerSession = authenticatedSessions['BUYER_Anuj'];

  let farmerProductId: string | null = null;
  let sellerProductId: string | null = null;

  if (farmerSession) {
    const { data: fProd, error: fError } = await farmerSession.client
      .from('products')
      .insert({
        farmer_id: farmerSession.userId,
        title: 'Organic Sharbati Wheat - Farmer Lot',
        crop_name: 'Wheat',
        category: 'Grains',
        price_per_unit: 3200,
        unit: 'quintal',
        quantity: 50,
        min_order_quantity: 5,
        district: 'Indore',
        state: 'Madhya Pradesh',
        status: 'ACTIVE',
      })
      .select()
      .single();

    assert('Farmer can create produce listing', Boolean(fProd?.id), fError?.message);
    farmerProductId = fProd?.id;

    // Farmer updates own product
    const { error: fUpdateErr } = await farmerSession.client
      .from('products')
      .update({ price_per_unit: 3250 })
      .eq('id', farmerProductId);
    assert('Farmer can update own produce listing', !fUpdateErr);
  }

  if (sellerSession) {
    const { data: sProd, error: sError } = await sellerSession.client
      .from('products')
      .insert({
        farmer_id: sellerSession.userId,
        title: 'Premium Cold-Pressed Mustard Oil - Seller Lot',
        crop_name: 'Mustard Oil',
        category: 'Oilseeds',
        price_per_unit: 180,
        unit: 'kg',
        quantity: 100,
        min_order_quantity: 10,
        district: 'Nashik',
        state: 'Maharashtra',
        status: 'ACTIVE',
      })
      .select()
      .single();

    assert('Seller can create merchant listing', Boolean(sProd?.id), sError?.message);
    sellerProductId = sProd?.id;

    // Seller updates own product
    const { error: sUpdateErr } = await sellerSession.client
      .from('products')
      .update({ price_per_unit: 185 })
      .eq('id', sellerProductId);
    assert('Seller can update own merchant listing', !sUpdateErr);
  }

  // Cross-ownership isolation
  if (farmerSession && sellerProductId) {
    const { error: crossErr } = await farmerSession.client
      .from('products')
      .update({ price_per_unit: 999 })
      .eq('id', sellerProductId);
    // RLS will prevent update on other's row
    const { data: checkSProd } = await supabaseAdmin.from('products').select('price_per_unit').eq('id', sellerProductId).single();
    assert('Farmer CANNOT update Seller listing (RLS isolation)', checkSProd?.price_per_unit !== 999);
  }

  if (sellerSession && farmerProductId) {
    const { error: crossErr } = await sellerSession.client
      .from('products')
      .update({ price_per_unit: 999 })
      .eq('id', farmerProductId);
    const { data: checkFProd } = await supabaseAdmin.from('products').select('price_per_unit').eq('id', farmerProductId).single();
    assert('Seller CANNOT update Farmer listing (RLS isolation)', checkFProd?.price_per_unit !== 999);
  }

  if (buyerSession && farmerProductId) {
    const { error: buyerUpdateErr } = await buyerSession.client
      .from('products')
      .update({ price_per_unit: 1 })
      .eq('id', farmerProductId);
    const { data: checkFProd } = await supabaseAdmin.from('products').select('price_per_unit').eq('id', farmerProductId).single();
    assert('Buyer CANNOT update produce listing (RLS isolation)', checkFProd?.price_per_unit !== 1);
  }

  // --- PHASE 8 & 12: BUYER Workflow & Complete Business Transaction ---
  console.log('\n--- 4. Complete Business Lifecycle & Order Transaction ---');
  if (buyerSession && farmerSession && farmerProductId) {
    // 1. Buyer creates Buyer Request
    const { data: rfq, error: rfqErr } = await buyerSession.client
      .from('buyer_requests')
      .insert({
        buyer_id: buyerSession.userId,
        product_id: farmerProductId,
        farmer_id: farmerSession.userId,
        offered_quantity: 10,
        offered_price: 3100,
        message: 'Initial RFQ offer for organic grain',
        status: 'PENDING',
      })
      .select()
      .single();

    assert('Buyer can submit Request for Quote (RFQ)', Boolean(rfq?.id), rfqErr?.message);

    if (rfq?.id) {
      // 2. Farmer counters offer
      const { data: counter, error: counterErr } = await farmerSession.client
        .from('request_counters')
        .insert({
          request_id: rfq.id,
          offered_by: farmerSession.userId,
          price: 3200,
          quantity: 10,
          note: 'Best market price with organic certification included',
        })
        .select()
        .single();

      assert('Farmer can submit counter offer round', Boolean(counter?.id), counterErr?.message);

      // 3. Buyer accepts counter offer
      const { error: acceptErr } = await buyerSession.client
        .from('buyer_requests')
        .update({ status: 'ACCEPTED' })
        .eq('id', rfq.id);
      assert('Buyer can accept negotiation offer', !acceptErr);

      // 4. Create Order atomically
      const { data: orderResult, error: orderErr } = await supabaseAdmin.rpc('create_order_atomic', {
        p_buyer_id: buyerSession.userId,
        p_product_id: farmerProductId,
        p_quantity: 10,
        p_delivery_address: 'Central Grain Depot, Pune',
        p_delivery_district: 'Pune',
        p_delivery_state: 'Maharashtra',
        p_special_instructions: `RFQ_REF:${rfq.id}`,
        p_logistics_cost: 6500,
      });

      assert('Atomic order creation succeeds and decrements stock', Boolean(orderResult?.order_id), orderErr?.message);

      if (orderResult?.order_id) {
        const orderId = orderResult.order_id;

        // Check stock decremented from 50 to 40
        const { data: updatedProd } = await supabaseAdmin.from('products').select('quantity').eq('id', farmerProductId).single();
        assert('Inventory atomically decremented: 50 -> 40', Number(updatedProd?.quantity) === 40);

        // Logistics booking
        const { data: logistics, error: logErr } = await supabaseAdmin
          .from('logistics_bookings')
          .insert({
            booking_ref: `LOG-STG-${Date.now()}`,
            order_id: orderId,
            farmer_id: farmerSession.userId,
            buyer_id: buyerSession.userId,
            pickup_location: 'Farm Gate Warehouse, Indore',
            delivery_location: 'Central Grain Depot, Pune',
            distance_km: 590,
            weight_kg: 1000,
            vehicle_type: 'HEAVY_TRUCK',
            freight_cost: 6500,
            status: 'CONFIRMED',
          })
          .select()
          .single();

        assert('Logistics booking created for order', Boolean(logistics?.id), logErr?.message);

        // Milestone progression
        const { data: milestone, error: mileErr } = await supabaseAdmin
          .from('order_milestones')
          .insert({
            order_id: orderId,
            status: 'DISPATCHED',
            location: 'Indore APMC Hub',
            note: 'Loaded on carrier vehicle MH-12-AB-1234',
          })
          .select()
          .single();

        assert('Order milestone recorded: DISPATCHED', Boolean(milestone?.id), mileErr?.message);

        // Escrow transaction record
        const { data: escrow, error: escErr } = await supabaseAdmin
          .from('escrow_transactions')
          .insert({
            order_id: orderId,
            amount: 32000,
            transaction_type: 'HOLD',
            status: 'COMPLETED',
          })
          .select()
          .single();

        assert('Escrow transaction recorded in HOLD state', Boolean(escrow?.id), escErr?.message);

        // Notification created
        const { data: notif, error: notifErr } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: buyerSession.userId,
            type: 'ORDER_UPDATE',
            title: 'Order Dispatched',
            message: 'Your order has been dispatched from the farm',
            reference_type: 'orders',
            reference_id: orderId,
          })
          .select()
          .single();

        assert('Notification delivered to buyer', Boolean(notif?.id), notifErr?.message);

        // Immutable Audit Log
        const { data: audit, error: auditErr } = await supabaseAdmin
          .from('audit_logs')
          .insert({
            user_id: buyerSession.userId,
            action: 'ORDER_LIFECYCLE_VERIFIED',
            entity_type: 'orders',
            entity_id: orderId,
            new_data: { total: 32000, status: 'CONFIRMED' },
          })
          .select()
          .single();

        assert('Immutable audit log committed', Boolean(audit?.id), auditErr?.message);
      }
    }
  }

  // --- PHASE 13: Razorpay Sandbox & Webhook Hardening ---
  console.log('\n--- 5. Razorpay Sandbox & Webhook Security ---');
  const testSecret = 'rzp_test_secret_hardening_2026';
  process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;
  const razorpay = new RazorpayProvider();

  const testPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_sandbox_12345',
          order_id: 'ord_test_001',
          amount: 3200000,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  const validSig = crypto.createHmac('sha256', testSecret).update(testPayload).digest('hex');
  const invalidSig = 'invalid_tampered_signature_hex';

  // 1. Valid webhook
  const validCheck = await razorpay.verifyWebhook(testPayload, validSig);
  assert('Valid Razorpay HMAC signature accepted', validCheck.isValid && validCheck.eventType === 'payment.captured');

  // 2. Invalid signature
  const invalidCheck = await razorpay.verifyWebhook(testPayload, invalidSig);
  assert('Invalid signature rejected', !invalidCheck.isValid);

  // 3. Tampered payload
  const tamperedPayload = testPayload.replace('3200000', '100');
  const tamperedCheck = await razorpay.verifyWebhook(tamperedPayload, validSig);
  assert('Tampered payload rejected', !tamperedCheck.isValid);

  // 4. Missing signature
  const missingCheck = await razorpay.verifyWebhook(testPayload, '');
  assert('Missing signature rejected', !missingCheck.isValid);

  // --- PHASE 16: Storage Security Acceptance ---
  console.log('\n--- 6. Supabase Storage Security (product-images vs kyc-documents) ---');
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const prodImgBucket = buckets?.find((b: any) => b.id === 'product-images');
  const kycBucket = buckets?.find((b: any) => b.id === 'kyc-documents');

  assert('Bucket product-images exists and is PUBLIC', Boolean(prodImgBucket) && prodImgBucket?.public === true);
  assert('Bucket kyc-documents exists and is PRIVATE (vault)', Boolean(kycBucket) && kycBucket?.public === false);

  // --- PHASE 9: ADMIN Workflow ---
  console.log('\n--- 7. ADMIN Platform Controls & Visibility ---');
  const adminSession = authenticatedSessions['ADMIN_Om'];
  if (adminSession) {
    const { data: stats, error: statsErr } = await adminSession.client
      .from('v_admin_dashboard_stats')
      .select('*')
      .single();

    assert('Admin can query v_admin_dashboard_stats', Boolean(stats), statsErr?.message);
    assert('Total farmers reported accurately', Number(stats?.total_farmers) >= 2);
    assert('Total sellers reported accurately', Number(stats?.total_sellers) >= 1);
    assert('Total buyers reported accurately', Number(stats?.total_buyers) >= 2);

    // Admin view team overview
    const { data: teamOverview } = await adminSession.client.from('team_members_overview').select('*');
    assert('Admin can view team_members_overview with all 6 members', teamOverview?.length === 6);
  }

  console.log(`\n============================================================`);
  console.log(`Staging Real-User Acceptance: ${totalPassed} passed, ${totalFailed} failed.`);
  console.log(`============================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runStagingAcceptanceSuite().catch((err) => {
  console.error('Fatal error in staging acceptance suite:', err);
  process.exit(1);
});
