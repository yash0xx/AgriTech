import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const teamPassword = process.env.DEFAULT_TEAM_PASSWORD;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase configuration in environment.');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

async function loginUser(email: string) {
  const client = createClient(supabaseUrl!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: teamPassword!,
  });
  if (error || !data.session) {
    throw new Error(`Failed to log in ${email}: ${error?.message}`);
  }
  return { client, user: data.user, token: data.session.access_token };
}

async function runDirectSecurityTests() {
  console.log('============================================================');
  console.log('    SUPABASE ADVISOR HARDENING DIRECT RPC & ACCESS TESTS   ');
  console.log('============================================================\n');

  // --- 1. Anonymous Access Tests ---
  console.log('--- 1. Anonymous Direct RPC & Storage Access ---');
  
  const { error: anonOrderErr } = await anonClient.rpc('create_order_atomic', {
    p_buyer_id: '00000000-0000-0000-0000-000000000000',
    p_product_id: '00000000-0000-0000-0000-000000000000',
    p_quantity: 1,
    p_delivery_address: 'X',
    p_delivery_district: 'X',
    p_delivery_state: 'X',
    p_special_instructions: '',
    p_logistics_cost: 0,
    p_idempotency_key: null,
  });
  assert('Anon RPC create_order_atomic is BLOCKED', Boolean(anonOrderErr), anonOrderErr?.message);

  const { error: anonAdminErr } = await anonClient.rpc('is_admin');
  assert('Anon RPC is_admin is BLOCKED', Boolean(anonAdminErr), anonAdminErr?.message);

  const { error: anonProfileTriggerErr } = await anonClient.rpc('protect_profile_role');
  assert('Anon RPC protect_profile_role is BLOCKED', Boolean(anonProfileTriggerErr), anonProfileTriggerErr?.message);

  const { error: anonTeamTriggerErr } = await anonClient.rpc('protect_team_members');
  assert('Anon RPC protect_team_members is BLOCKED', Boolean(anonTeamTriggerErr), anonTeamTriggerErr?.message);

  const { data: anonStorageList, error: anonStorageErr } = await anonClient.storage
    .from('product-images')
    .list();
  assert(
    'Anon Storage API listing on product-images is BLOCKED or empty',
    Boolean(anonStorageErr) || !anonStorageList || anonStorageList.length === 0,
    anonStorageErr?.message
  );

  // --- 2. Authenticated 4-Role Direct RPC Tests ---
  console.log('\n--- 2. Authenticated 4-Role Direct RPC Access ---');
  
  const admin = await loginUser('om.nalawade.aids.25@vpkbiet.org');
  const farmer = await loginUser('dateathrav@gmail.com');
  const seller = await loginUser('yashlokhande082@gmail.com');
  const buyer = await loginUser('anuj.deshpande.comp.25@vpkbiet.org');

  const testRoles = [
    { name: 'ADMIN', session: admin, expectedIsAdmin: true },
    { name: 'FARMER', session: farmer, expectedIsAdmin: false },
    { name: 'SELLER', session: seller, expectedIsAdmin: false },
    { name: 'BUYER', session: buyer, expectedIsAdmin: false },
  ];

  for (const { name, session, expectedIsAdmin } of testRoles) {
    // is_admin delegate test
    const { data: isAdminRes, error: isAdminErr } = await session.client.rpc('is_admin');
    assert(
      `${name} RPC is_admin() executes and returns ${expectedIsAdmin}`,
      !isAdminErr && isAdminRes === expectedIsAdmin,
      isAdminErr?.message || `Received: ${isAdminRes}`
    );

    // create_order_atomic blocked from direct client RPC
    const { error: orderRpcErr } = await session.client.rpc('create_order_atomic', {
      p_buyer_id: session.user.id,
      p_product_id: '00000000-0000-0000-0000-000000000000',
      p_quantity: 1,
      p_delivery_address: 'X',
      p_delivery_district: 'X',
      p_delivery_state: 'X',
      p_special_instructions: '',
      p_logistics_cost: 0,
      p_idempotency_key: null,
    });
    assert(
      `${name} direct RPC create_order_atomic is BLOCKED`,
      Boolean(orderRpcErr),
      orderRpcErr?.message
    );

    // protect_profile_role blocked from direct client RPC
    const { error: profileRoleErr } = await session.client.rpc('protect_profile_role');
    assert(
      `${name} direct RPC protect_profile_role is BLOCKED`,
      Boolean(profileRoleErr),
      profileRoleErr?.message
    );

    // protect_team_members blocked from direct client RPC
    const { error: teamMembersErr } = await session.client.rpc('protect_team_members');
    assert(
      `${name} direct RPC protect_team_members is BLOCKED`,
      Boolean(teamMembersErr),
      teamMembersErr?.message
    );
  }

  // --- 3. Storage Authenticated Listing ---
  console.log('\n--- 3. Authenticated Storage Listing ---');
  const { data: authStorageList, error: authStorageErr } = await admin.client.storage
    .from('product-images')
    .list();
  assert(
    'Authenticated client can list product-images bucket',
    !authStorageErr && Array.isArray(authStorageList),
    authStorageErr?.message
  );

  // --- 4. Admin Views Isolation (v_admin_dashboard_stats) ---
  console.log('\n--- 4. Role Isolation on Hardened Views ---');
  const { data: adminViewStats } = await admin.client
    .from('v_admin_dashboard_stats')
    .select('*');
  assert('ADMIN reads v_admin_dashboard_stats', Boolean(adminViewStats && adminViewStats.length > 0));

  const { data: farmerViewStats } = await farmer.client
    .from('v_admin_dashboard_stats')
    .select('*');
  assert('FARMER receives 0 rows from v_admin_dashboard_stats', farmerViewStats?.length === 0);

  const { data: sellerViewStats } = await seller.client
    .from('v_admin_dashboard_stats')
    .select('*');
  assert('SELLER receives 0 rows from v_admin_dashboard_stats', sellerViewStats?.length === 0);

  const { data: buyerViewStats } = await buyer.client
    .from('v_admin_dashboard_stats')
    .select('*');
  assert('BUYER receives 0 rows from v_admin_dashboard_stats', buyerViewStats?.length === 0);

  console.log('\n============================================================');
  console.log(`Direct Security Test Results: ${totalPassed} passed, ${totalFailed} failed.`);
  console.log('============================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runDirectSecurityTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
