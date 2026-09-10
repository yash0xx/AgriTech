import { execSync } from 'child_process';

/**
 * AgriTech Master End-to-End Verification Runner
 * Runs the full verification matrix required by the specification:
 * 1. Database Schema & Migrations Validation (25 files, 18 tables, RLS enabled)
 * 2. Backend API Endpoint & Logic Tests (Auth guards, Logistics calculations, Financial integrity)
 * 3. RLS Security Attack Suite (17 attack vectors blocked)
 * 4. Repository-Wide Security Audit (Zero secret leaks, Zero demo credentials, Zero role escalation)
 * 5. TypeScript Static Type Checking (tsc --noEmit)
 * 6. Production Application Build (vite build)
 */

interface SuiteResult {
  name: string;
  command: string;
  passed: boolean;
  output: string;
}

const SUITES = [
  { name: 'Database Migrations & Schema Validation', command: 'npx tsx scripts/validate-database-schema.ts' },
  { name: 'Real Team Account & Role Validation', command: 'npx tsx scripts/test-real-team-accounts.ts' },
  { name: 'Backend API & Endpoint Guards', command: 'npx tsx scripts/test-backend-api.ts' },
  { name: 'RLS & Security Attack Vector Suite', command: 'npx tsx scripts/run-attack-tests.ts' },
  { name: '4-Role Platform Migration Security Suite', command: 'npx tsx scripts/test-role-migration-security.ts' },
  { name: 'Staging Real-User Acceptance & Webhook Security', command: 'npx tsx scripts/test-staging-acceptance.ts' },
  { name: 'E2E Workflow & Concurrency Matrix', command: 'npx tsx scripts/test-e2e-workflow-matrix.ts' },
  { name: 'Production Hardening & Concurrency Suite', command: 'npx tsx scripts/test-concurrency-hardened.ts' },
  { name: 'Final Go-Live Audit Suite', command: 'npx tsx scripts/test-golive-audit.ts' },
  { name: 'Final Release & Go-Live Validation', command: 'npx tsx scripts/test-release-final-validation.ts' },
  { name: 'Repository-Wide Security Audit', command: 'npx tsx scripts/run-security-audit.ts' },
  { name: 'Direct RPC & Advisor Remediation Security Suite', command: 'npx tsx scripts/test-direct-security-rpc.ts' },
  { name: 'TypeScript Static Type Checking', command: 'npx tsc --noEmit' },
  { name: 'Production Application Build', command: 'npm run build' },
];

async function runAll() {
  console.log('============================================================');
  console.log('         AGRITECH MASTER SYSTEM VERIFICATION MATRIX        ');
  console.log('============================================================\n');

  const results: SuiteResult[] = [];
  let allPassed = true;

  for (const suite of SUITES) {
    process.stdout.write(`Executing: ${suite.name}... `);
    try {
      const output = execSync(suite.command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      console.log('✅ PASS');
      results.push({ name: suite.name, command: suite.command, passed: true, output });
    } catch (err: any) {
      console.log('❌ FAIL');
      allPassed = false;
      results.push({
        name: suite.name,
        command: suite.command,
        passed: false,
        output: err.stdout?.toString() || err.stderr?.toString() || err.message,
      });
    }
  }

  console.log('\n============================================================');
  console.log('                     VERIFICATION SUMMARY                   ');
  console.log('============================================================');
  for (const res of results) {
    console.log(`${res.passed ? '✓' : '✗'} ${res.name}: ${res.passed ? 'PASSED' : 'FAILED'}`);
  }
  console.log('============================================================\n');

  if (!allPassed) {
    console.error('CRITICAL: One or more verification suites failed. Review logs above.');
    process.exit(1);
  } else {
    console.log('🎉 ALL ACCEPTANCE TEST SUITES PASSED CLEANLY.');
  }
}

runAll();
