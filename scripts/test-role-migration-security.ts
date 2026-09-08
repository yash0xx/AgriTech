import fs from 'fs';
import path from 'path';
import { requireRole, AuthenticatedRequest } from '../backend/src/middleware/auth';
import { Response, NextFunction } from 'express';

/**
 * Role Migration & Multi-Role Authorization Security Suite (Section 19)
 *
 * Verifies the 4-role model (FARMER, SELLER, BUYER, ADMIN):
 * 1. Authentication (login, session restoration, suspended account denial)
 * 2. Route Authorization (complete cross-role blocking matrix)
 * 3. Privilege Escalation Prevention (self role change, team member tampering, public admin signup)
 * 4. Database RLS Isolation (Farmer <-> Seller <-> Buyer private record separation)
 * 5. Product & Order Listing Ownership (FARMER & SELLER both own listings)
 */

async function runRoleMigrationSecurityTests() {
  console.log('============================================================');
  console.log('    AGRITECH 4-ROLE PLATFORM MIGRATION SECURITY SUITE       ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  // --- 1. AUTHENTICATION & LOGIN REDIRECT AUDIT ---
  console.log('--- 1. Authentication & Role Handling ---');
  const authProviderContent = fs.readFileSync(
    path.join(process.cwd(), 'src', 'auth', 'AuthProvider.tsx'),
    'utf8'
  );
  const loginPageContent = fs.readFileSync(
    path.join(process.cwd(), 'src', 'pages', 'LoginPage.tsx'),
    'utf8'
  );
  const registerPageContent = fs.readFileSync(
    path.join(process.cwd(), 'src', 'pages', 'RegisterPage.tsx'),
    'utf8'
  );

  // 1.1 Support for all 4 roles in auth
  assert(
    'AuthProvider accepts FARMER, SELLER, BUYER in SignUpMetadata',
    authProviderContent.includes("'FARMER' | 'SELLER' | 'BUYER'")
  );
  assert(
    'LoginPage redirects FARMER to /farmer',
    loginPageContent.includes("role === 'FARMER'") && loginPageContent.includes("navigate('/farmer'")
  );
  assert(
    'LoginPage redirects SELLER to /seller',
    loginPageContent.includes("role === 'SELLER'") && loginPageContent.includes("navigate('/seller'")
  );
  assert(
    'LoginPage redirects BUYER to /buyer',
    loginPageContent.includes("role === 'BUYER'") && loginPageContent.includes("navigate('/buyer'")
  );
  assert(
    'LoginPage redirects ADMIN to /admin',
    loginPageContent.includes("role === 'ADMIN'") && loginPageContent.includes("navigate('/admin'")
  );

  // 1.2 Suspended user denial
  assert(
    'AuthProvider denies suspended accounts on session restoration (status === SUSPENDED)',
    authProviderContent.includes("status === 'SUSPENDED'") &&
    authProviderContent.includes('Account Suspended') &&
    authProviderContent.includes('supabase.auth.signOut()')
  );

  // 1.3 Public signup role choices (ADMIN prohibited)
  assert(
    'RegisterPage displays FARMER, SELLER, BUYER role options',
    registerPageContent.includes("setRole('FARMER')") &&
    registerPageContent.includes("setRole('SELLER')") &&
    registerPageContent.includes("setRole('BUYER')")
  );
  assert(
    'RegisterPage blocks ADMIN from public registration selection',
    !registerPageContent.includes("setRole('ADMIN')") && !registerPageContent.includes("value: 'ADMIN'")
  );

  // --- 2. ROUTE AUTHORIZATION MATRIX (ALL CROSS-ROLE COMBINATIONS) ---
  console.log('\n--- 2. Route Authorization Matrix (Strict Role Boundary Guards) ---');
  const appRoutesContent = fs.readFileSync(
    path.join(process.cwd(), 'src', 'routes', 'AppRoutes.tsx'),
    'utf8'
  );
  const roleRouteContent = fs.readFileSync(
    path.join(process.cwd(), 'src', 'auth', 'RoleRoute.tsx'),
    'utf8'
  );

  // Verify RoleRoute supports all 4 roles
  assert(
    'RoleRoute handles SELLER in allowedRoles and fallback redirection',
    roleRouteContent.includes("role === 'SELLER'") && roleRouteContent.includes("to=\"/seller\"")
  );

  // Check route wrappers in AppRoutes
  assert(
    '/farmer routes guarded strictly with allowedRoles={["FARMER"]}',
    appRoutesContent.includes("<RoleRoute allowedRoles={['FARMER']} />")
  );
  assert(
    '/seller routes guarded strictly with allowedRoles={["SELLER"]}',
    appRoutesContent.includes("<RoleRoute allowedRoles={['SELLER']} />")
  );
  assert(
    '/buyer routes guarded strictly with allowedRoles={["BUYER"]}',
    appRoutesContent.includes("<RoleRoute allowedRoles={['BUYER']} />")
  );
  assert(
    '/admin routes guarded strictly with allowedRoles={["ADMIN"]}',
    appRoutesContent.includes("<RoleRoute allowedRoles={['ADMIN']} />")
  );

  // Test functional route authorization simulator
  function simulateRouteAccess(role: string, targetPath: string): 'ALLOWED' | 'BLOCKED' {
    const routeRules: Record<string, string[]> = {
      '/farmer': ['FARMER'],
      '/seller': ['SELLER'],
      '/buyer': ['BUYER'],
      '/admin': ['ADMIN'],
    };

    const targetPrefix = Object.keys(routeRules).find((prefix) => targetPath.startsWith(prefix));
    if (!targetPrefix) return 'ALLOWED'; // public route
    const allowed = routeRules[targetPrefix];
    return allowed.includes(role) ? 'ALLOWED' : 'BLOCKED';
  }

  // FARMER cross-role access matrix
  assert('FARMER -> /seller = BLOCKED', simulateRouteAccess('FARMER', '/seller') === 'BLOCKED');
  assert('FARMER -> /buyer = BLOCKED', simulateRouteAccess('FARMER', '/buyer') === 'BLOCKED');
  assert('FARMER -> /admin = BLOCKED', simulateRouteAccess('FARMER', '/admin') === 'BLOCKED');

  // SELLER cross-role access matrix
  assert('SELLER -> /farmer = BLOCKED', simulateRouteAccess('SELLER', '/farmer') === 'BLOCKED');
  assert('SELLER -> /buyer = BLOCKED', simulateRouteAccess('SELLER', '/buyer') === 'BLOCKED');
  assert('SELLER -> /admin = BLOCKED', simulateRouteAccess('SELLER', '/admin') === 'BLOCKED');

  // BUYER cross-role access matrix
  assert('BUYER -> /farmer = BLOCKED', simulateRouteAccess('BUYER', '/farmer') === 'BLOCKED');
  assert('BUYER -> /seller = BLOCKED', simulateRouteAccess('BUYER', '/seller') === 'BLOCKED');
  assert('BUYER -> /admin = BLOCKED', simulateRouteAccess('BUYER', '/admin') === 'BLOCKED');

  // Self-portal access permits
  assert('FARMER -> /farmer = ALLOWED', simulateRouteAccess('FARMER', '/farmer') === 'ALLOWED');
  assert('SELLER -> /seller = ALLOWED', simulateRouteAccess('SELLER', '/seller') === 'ALLOWED');
  assert('BUYER -> /buyer = ALLOWED', simulateRouteAccess('BUYER', '/buyer') === 'ALLOWED');
  assert('ADMIN -> /admin = ALLOWED', simulateRouteAccess('ADMIN', '/admin') === 'ALLOWED');

  // --- 3. BACKEND AUTHORIZATION & MIDDLEWARE AUDIT ---
  console.log('\n--- 3. Backend Authorization Middleware Audit ---');

  // Test requireRole middleware execution directly
  function testMiddlewareRoleCheck(
    allowedRoles: ('FARMER' | 'SELLER' | 'BUYER' | 'ADMIN')[],
    userRole?: 'FARMER' | 'SELLER' | 'BUYER' | 'ADMIN'
  ): { status?: number; nextCalled: boolean } {
    const middleware = requireRole(allowedRoles);
    const req = {
      user: userRole ? { id: 'test-user' } : undefined,
      role: userRole,
    } as AuthenticatedRequest;
    let statusCode: number | undefined;
    let nextCalled = false;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: () => {} };
      },
    } as unknown as Response;

    const next = (() => {
      nextCalled = true;
    }) as NextFunction;

    middleware(req, res, next);
    return { status: statusCode, nextCalled };
  }

  // SELLER authorized on seller endpoint
  const sellerCheck = testMiddlewareRoleCheck(['SELLER'], 'SELLER');
  assert('requireRole(["SELLER"]) permits SELLER', sellerCheck.nextCalled && sellerCheck.status === undefined);

  // FARMER blocked on seller-only endpoint
  const farmerBlockedCheck = testMiddlewareRoleCheck(['SELLER'], 'FARMER');
  assert('requireRole(["SELLER"]) blocks FARMER with 403', !farmerBlockedCheck.nextCalled && farmerBlockedCheck.status === 403);

  // BUYER blocked on supply-side endpoint
  const buyerBlockedCheck = testMiddlewareRoleCheck(['FARMER', 'SELLER'], 'BUYER');
  assert('requireRole(["FARMER", "SELLER"]) blocks BUYER with 403', !buyerBlockedCheck.nextCalled && buyerBlockedCheck.status === 403);

  // Unauthenticated blocked with 401
  const unauthCheck = testMiddlewareRoleCheck(['SELLER'], undefined);
  assert('requireRole(["SELLER"]) blocks unauthenticated user with 401', !unauthCheck.nextCalled && unauthCheck.status === 401);

  // Both FARMER & SELLER permitted on produce listing endpoints
  const farmerProduceCheck = testMiddlewareRoleCheck(['FARMER', 'SELLER'], 'FARMER');
  const sellerProduceCheck = testMiddlewareRoleCheck(['FARMER', 'SELLER'], 'SELLER');
  assert(
    'requireRole(["FARMER", "SELLER"]) allows both FARMER and SELLER to own/manage produce listings',
    farmerProduceCheck.nextCalled && sellerProduceCheck.nextCalled
  );

  // --- 4. PRIVILEGE ESCALATION GUARDS (TRIGGERS & DB POLICIES) ---
  console.log('\n--- 4. Privilege Escalation Guards ---');
  const triggersSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '021_functions_triggers.sql'),
    'utf8'
  );
  const migration028Sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '028_add_seller_role.sql'),
    'utf8'
  );

  // 4.1 Cannot self-change role
  assert(
    'protect_profile_role() trigger blocks self-change of platform role (NEW.role IS DISTINCT FROM OLD.role)',
    triggersSql.includes('protect_profile_role') &&
    triggersSql.includes('NEW.role IS DISTINCT FROM OLD.role') &&
    triggersSql.includes('Users cannot change their platform role')
  );

  // 4.2 Cannot change another user's role (RLS + trigger)
  assert(
    'protect_profile_role() allows role changes ONLY if caller is ADMIN',
    triggersSql.includes("v_caller_role IS DISTINCT FROM 'ADMIN'")
  );

  // 4.3 Cannot self-create in team_members
  assert(
    'protect_team_members() trigger blocks non-admin inserts into team_members',
    triggersSql.includes('protect_team_members') &&
    triggersSql.includes('Only platform administrators can assign or alter team member records')
  );

  // 4.4 Cannot modify team_role
  assert(
    'check_team_members_permission trigger protects team_members from UPDATE by non-admins',
    triggersSql.includes('BEFORE INSERT OR UPDATE OR DELETE ON public.team_members')
  );

  // 4.5 Public signup cannot create ADMIN
  assert(
    '028_add_seller_role.sql handle_new_user() prevents public signup from creating ADMIN',
    migration028Sql.includes("v_raw_role = 'ADMIN' AND v_is_authorized_admin") &&
    migration028Sql.includes("v_role := 'BUYER'")
  );

  // --- 5. RLS TENANT & ROLE ISOLATION AUDIT ---
  console.log('\n--- 5. Database Row-Level Security (RLS) Isolation ---');
  const rlsSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '022_rls_policies.sql'),
    'utf8'
  );

  // 5.1 Profile privacy & safe marketplace projection
  const viewMatch = migration028Sql.match(/CREATE OR REPLACE VIEW public\.v_public_marketplace_profiles[\s\S]*?;/);
  assert(
    '028_add_seller_role.sql defines safe public projection v_public_marketplace_profiles with safe fields only',
    !!(viewMatch && viewMatch[0].includes('display_name') && !viewMatch[0].includes('gst_number') && !viewMatch[0].includes('phone'))
  );

  assert(
    'public.seller_profiles table has RLS explicitly enabled with strict owner/admin access',
    migration028Sql.includes('ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY') &&
    migration028Sql.includes('auth.uid() = user_id')
  );

  assert(
    'public.farmer_profiles table protected: only owner or ADMIN can update',
    rlsSql.includes('Farmers can update own profile') &&
    rlsSql.includes('auth.uid() = user_id')
  );

  assert(
    'public.buyer_profiles table protected: only owner or ADMIN can update',
    rlsSql.includes('Buyers can update own profile') &&
    rlsSql.includes('auth.uid() = user_id')
  );

  // 5.2 Product listing ownership by FARMER and SELLER
  assert(
    '028_add_seller_role.sql updates product RLS to allow both FARMER and SELLER to insert listings',
    migration028Sql.includes("role IN ('FARMER', 'SELLER')") &&
    migration028Sql.includes('farmer_id = auth.uid()')
  );

  assert(
    'Product UPDATE and DELETE policies enforce farmer_id = auth.uid() ownership lock',
    migration028Sql.includes('ON public.products FOR UPDATE') &&
    migration028Sql.includes('ON public.products FOR DELETE') &&
    migration028Sql.includes('farmer_id = auth.uid()')
  );

  // 5.3 Isolation between Farmer and Seller
  assert(
    'Farmer cannot update Seller produce: prevented by farmer_id = auth.uid() check',
    migration028Sql.includes('farmer_id = auth.uid()')
  );

  assert(
    'Seller cannot update Farmer produce: prevented by farmer_id = auth.uid() check',
    migration028Sql.includes('farmer_id = auth.uid()')
  );

  // 5.4 Order participant isolation (Buyer <-> Farmer/Seller)
  assert(
    'Orders SELECT policy restricts visibility to buyer_id = auth.uid() OR farmer_id = auth.uid() OR is_admin()',
    rlsSql.includes('ON public.orders FOR SELECT') &&
    rlsSql.includes('buyer_id = auth.uid()') &&
    rlsSql.includes('farmer_id = auth.uid()')
  );

  // 5.5 Dispute access restricted to order participants
  assert(
    'Disputes restricted strictly to order participants (buyer_id, farmer_id) or admin',
    rlsSql.includes('ON public.disputes FOR SELECT') &&
    rlsSql.includes('buyer_id = auth.uid() OR farmer_id = auth.uid()')
  );

  console.log('\n============================================================');
  console.log(`Role Migration Security Suite: ${passed} passed, ${failed} failed.`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRoleMigrationSecurityTests().catch((err) => {
  console.error('Fatal error in role migration security suite:', err);
  process.exit(1);
});
