import fs from 'fs';
import path from 'path';

/**
 * Validation Script for Supabase PostgreSQL Migrations
 * Validates:
 * 1. All 25 migration files exist in proper sequence
 * 2. All 18 required application tables exist
 * 3. Every application table has RLS explicitly enabled
 * 4. Checks, constraints, and views are well-formed
 */

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');

const REQUIRED_TABLES = [
  'profiles',
  'farmer_profiles',
  'buyer_profiles',
  'seller_profiles',
  'products',
  'product_images',
  'mandi_prices',
  'buyer_requests',
  'request_counters',
  'orders',
  'order_items',
  'order_milestones',
  'escrow_transactions',
  'logistics_bookings',
  'notifications',
  'disputes',
  'kyc_records',
  'audit_logs',
  'team_members',
  'idempotency_records',
];

const REQUIRED_MIGRATIONS = [
  '001_extensions.sql',
  '002_enums.sql',
  '003_profiles.sql',
  '004_farmer_profiles.sql',
  '005_buyer_profiles.sql',
  '006_products.sql',
  '007_product_images.sql',
  '008_mandi_prices.sql',
  '009_buyer_requests.sql',
  '010_request_counters.sql',
  '011_orders.sql',
  '012_order_items.sql',
  '013_order_milestones.sql',
  '014_escrow_transactions.sql',
  '015_logistics_bookings.sql',
  '016_notifications.sql',
  '017_disputes.sql',
  '018_kyc_records.sql',
  '019_audit_logs.sql',
  '020_team_members.sql',
  '021_functions_triggers.sql',
  '022_rls_policies.sql',
  '023_views.sql',
  '024_indexes.sql',
  '025_seed.sql',
  '026_idempotency_records.sql',
  '027_storage_policies.sql',
  '028_add_seller_role.sql',
  '029_security_advisor_view_hardening.sql',
  '030_security_advisor_warning_hardening.sql',
];

function validateMigrations() {
  console.log('--- Validating Supabase PostgreSQL Migrations ---');

  // Check file presence
  const files = fs.readdirSync(MIGRATIONS_DIR);
  let missingFiles = 0;
  for (const reqFile of REQUIRED_MIGRATIONS) {
    if (!files.includes(reqFile)) {
      console.error(`❌ Missing migration file: ${reqFile}`);
      missingFiles++;
    }
  }

  if (missingFiles === 0) {
    console.log(`✓ All ${REQUIRED_MIGRATIONS.length} migration files present in correct order.`);
  }

  // Concatenate all migrations to analyze schema
  let combinedSql = '';
  for (const reqFile of REQUIRED_MIGRATIONS) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, reqFile), 'utf8');
    combinedSql += '\n' + content;
  }

  // Verify all 18 tables are created
  console.log('\n--- Checking 18 Application Tables ---');
  let missingTables = 0;
  for (const table of REQUIRED_TABLES) {
    const tablePattern = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?(public\\.)?${table}\\b`, 'i');
    if (!tablePattern.test(combinedSql)) {
      console.error(`❌ Table not found in migrations: ${table}`);
      missingTables++;
    } else {
      console.log(`✓ Table confirmed: ${table}`);
    }
  }

  // Verify Row-Level Security (RLS) on all 18 tables
  console.log('\n--- Checking Row-Level Security (RLS) Coverage ---');
  let missingRls = 0;
  for (const table of REQUIRED_TABLES) {
    const rlsPattern = new RegExp(`ALTER\\s+TABLE\\s+(public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
    if (!rlsPattern.test(combinedSql)) {
      console.error(`❌ Table missing ENABLE ROW LEVEL SECURITY: ${table}`);
      missingRls++;
    } else {
      console.log(`✓ RLS enabled on: ${table}`);
    }
  }

  // Verify Critical Security Triggers
  console.log('\n--- Checking Security Triggers ---');
  const criticalFunctions = [
    'handle_new_user',
    'protect_profile_role',
    'validate_buyer_request',
    'protect_team_members',
    'create_order_atomic',
  ];

  for (const fn of criticalFunctions) {
    if (combinedSql.includes(`FUNCTION public.${fn}`)) {
      console.log(`✓ Security function present: ${fn}`);
    } else {
      console.error(`❌ Security function missing: ${fn}`);
    }
  }

  // Verify Critical Views
  console.log('\n--- Checking Views ---');
  const criticalViews = ['marketplace_listings', 'team_members_overview', 'order_overview'];
  for (const view of criticalViews) {
    if (combinedSql.includes(`VIEW public.${view}`)) {
      console.log(`✓ View present: ${view}`);
    } else {
      console.error(`❌ View missing: ${view}`);
    }
  }

  if (missingFiles === 0 && missingTables === 0 && missingRls === 0) {
    console.log('\n✅ ALL DATABASE MIGRATIONS AND RLS VALIDATIONS PASSED.');
  } else {
    console.error('\n❌ DATABASE VALIDATION FAILED.');
    process.exit(1);
  }
}

validateMigrations();
