import fs from 'fs';
import path from 'path';

/**
 * Phase 9 — Repository-Wide Security Audit Suite
 */
async function runSecurityAudit() {
  console.log('====================================================');
  console.log('           PHASE 9 — SECURITY AUDIT SUITE           ');
  console.log('====================================================\n');

  let passedChecks = 0;
  let failedChecks = 0;

  function assert(name: string, condition: boolean, failReason?: string) {
    if (condition) {
      console.log(`✓ PASS: ${name}`);
      passedChecks++;
    } else {
      console.error(`❌ FAIL: ${name}${failReason ? ` -> ${failReason}` : ''}`);
      failedChecks++;
    }
  }

  // 1. Check dist/ bundle for service_role keys or secrets
  console.log('--- 1. Production Bundle Secret Leak Inspection (dist/) ---');
  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    const assetsDir = path.join(distDir, 'assets');
    const assetFiles = fs.readdirSync(assetsDir);
    let bundleText = '';
    for (const file of assetFiles) {
      if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html')) {
        bundleText += fs.readFileSync(path.join(assetsDir, file), 'utf8');
      }
    }

    assert(
      'dist/ bundle contains NO SUPABASE_SERVICE_ROLE_KEY',
      !bundleText.includes('SUPABASE_SERVICE_ROLE_KEY') && !bundleText.includes('service_role'),
      'Found service_role reference in client build!'
    );

    assert(
      'dist/ bundle contains NO legacy admin secret (agritech-admin)',
      !bundleText.includes('agritech-admin-secure'),
      'Found legacy admin key in client build!'
    );

    assert(
      'dist/ bundle contains NO demo quick-fill credentials',
      !bundleText.includes('quick-fill') && !bundleText.includes('demo password'),
      'Found demo credentials in client build!'
    );
  } else {
    assert('dist directory exists', false, 'Run npm run build first');
  }

  // 2. Check frontend source code (src/) for forbidden auth patterns
  console.log('\n--- 2. Frontend Source Code Inspection (src/) ---');
  function scanDir(dir: string, extFilter: string[]): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const p = path.join(dir, item);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        results = results.concat(scanDir(p, extFilter));
      } else if (extFilter.some(ext => p.endsWith(ext))) {
        results.push(p);
      }
    }
    return results;
  }

  const srcFiles = scanDir(path.join(process.cwd(), 'src'), ['.ts', '.tsx']);
  let foundServiceRoleInSrc = false;
  let foundHardcodedAdminKeyInSrc = false;
  let foundQuickFillInSrc = false;
  let foundActiveRoleInSrc = false;

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('SUPABASE_SERVICE_ROLE_KEY')) foundServiceRoleInSrc = true;
    if (content.includes('agritech-admin-secure')) foundHardcodedAdminKeyInSrc = true;
    if (content.includes('quick-fill') || content.includes('quick-login')) foundQuickFillInSrc = true;
    if (content.includes('activeRole') || content.includes('onSwitchRole')) foundActiveRoleInSrc = true;
  }

  assert('No SUPABASE_SERVICE_ROLE_KEY in src/', !foundServiceRoleInSrc);
  assert('No hardcoded admin key in src/', !foundHardcodedAdminKeyInSrc);
  assert('No quick-fill or demo login in src/', !foundQuickFillInSrc);
  assert('No activeRole or role switcher in src/', !foundActiveRoleInSrc);

  // 3. Check environment configuration
  console.log('\n--- 3. Environment File (.env) Inspection ---');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    assert(
      '.env does NOT expose SUPABASE_SERVICE_ROLE_KEY with VITE_ prefix',
      !envContent.includes('VITE_SUPABASE_SERVICE_ROLE_KEY'),
      'VITE_SUPABASE_SERVICE_ROLE_KEY is exposed!'
    );
    assert(
      '.env only configures public VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
      envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')
    );
  }

  // 4. Check Database Migrations for Security Enforcement
  console.log('\n--- 4. Database Security Enforcement Inspection ---');
  const triggersSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '021_functions_triggers.sql'),
    'utf8'
  );
  const rlsSql = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '022_rls_policies.sql'),
    'utf8'
  );

  assert(
    'Trigger handle_new_user() prevents public creation of ADMIN role',
    triggersSql.includes("v_role := 'BUYER'") && triggersSql.includes('v_is_authorized_admin'),
    'Trigger allows unrestricted public admin assignment!'
  );

  assert(
    'Trigger protect_profile_role() blocks self-escalation of platform role',
    triggersSql.includes('protect_profile_role') && triggersSql.includes('Users cannot change their platform role'),
    'Self-escalation trigger is missing or insecure!'
  );

  assert(
    'Trigger protect_team_members() prevents normal users from adding self to team',
    triggersSql.includes('protect_team_members') && triggersSql.includes('Only platform administrators can assign or alter team member records'),
    'Team member self-provisioning trigger missing!'
  );

  assert(
    'Trigger validate_buyer_request() prevents buyers from requesting own product',
    triggersSql.includes('validate_buyer_request') && triggersSql.includes('A buyer cannot request their own product'),
    'Self-purchase prevention missing!'
  );

  assert(
    'RLS policy explicitly restricts audit_logs modification (append-only)',
    rlsSql.includes('Authenticated users can create audit log entries') &&
    !rlsSql.includes('ON public.audit_logs FOR UPDATE') &&
    !rlsSql.includes('ON public.audit_logs FOR DELETE'),
    'Audit logs have update or delete policies!'
  );

  assert(
    'RLS policies block normal client sessions from releasing/refunding escrow directly',
    rlsSql.includes('Only admins can insert or update escrow transactions') && rlsSql.includes('public.is_admin()'),
    'Normal users can modify escrow state!'
  );

  console.log(`\n====================================================`);
  console.log(`Audit Results: ${passedChecks} checks passed, ${failedChecks} checks failed.`);
  console.log(`====================================================\n`);

  if (failedChecks > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
