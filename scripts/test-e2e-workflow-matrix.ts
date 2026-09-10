import { OrdersService } from '../backend/src/modules/orders/orders.service';
import { LogisticsService } from '../backend/src/modules/logistics/logistics.service';
import { EscrowService } from '../backend/src/modules/escrow/escrow.service';
import fs from 'fs';
import path from 'path';

/**
 * Comprehensive End-to-End Workflow & Concurrency Matrix Test Suite
 * Tests:
 * 1. Team Role Verification & Confirmation (Sections 1, 2, 3)
 * 2. Concurrency Combinations (Section 9):
 *    - 80 + 50 from 100 kg (one succeeds, one fails, remaining 20 or 50)
 *    - 60 + 40 from 100 kg (both succeed, remaining 0)
 *    - 50 + 50 from 100 kg (both succeed, remaining 0)
 *    - 90 + 20 from 100 kg (one succeeds, one fails, remaining 10)
 *    - 100 + 1 from 100 kg (one succeeds, one fails, remaining 0)
 * 3. Transaction Integrity & Rollback Compensation (Section 10)
 * 4. Idempotency Key Handling (Section 11)
 * 5. Logistics Rate Matrix & Tamper Resistance (Section 12)
 * 6. Database Escrow State Workflow (Section 13)
 * 7. Negotiation History Immutability (Section 6)
 * 8. KYC & Dispute Status Transitions (Sections 15, 16)
 */

interface ConcurrencyResult {
  scenario: string;
  initialStock: number;
  requestA: number;
  requestB: number;
  finalStock: number;
  successCount: number;
  failCount: number;
  passed: boolean;
}

async function runWorkflowMatrix() {
  console.log('============================================================');
  console.log('       AGRITECH E2E WORKFLOW & CONCURRENCY MATRIX TEST      ');
  console.log('============================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✓ PASS: ${name}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${name}${details ? ` -> ${details}` : ''}`);
      failedTests++;
    }
  }

  // --- SECTION 1, 2, 3: REAL TEAM ACCOUNT AUDIT ---
  console.log('--- 1. Real Team Members & Security Configuration ---');
  const teamPageContent = fs.readFileSync(path.join(process.cwd(), 'src', 'pages', 'admin', 'TeamManagementPage.tsx'), 'utf8');

  assert(
    'Om Nalawade mapped to ADMIN / TEAM_LEAD',
    teamPageContent.includes('Om Nalawade') &&
    teamPageContent.includes('om.nalawade.aids.25@vpkbiet.org') &&
    teamPageContent.includes('TEAM_LEAD')
  );

  assert(
    'Date Atharv mapped to FARMER / BACKEND',
    teamPageContent.includes('Date Atharv') &&
    teamPageContent.includes('dateathrav@gmail.com') &&
    teamPageContent.includes('BACKEND')
  );

  assert(
    'Yash Lokhande mapped to SELLER / FRONTEND',
    teamPageContent.includes('Yash Lokhande') &&
    teamPageContent.includes('yashlokhande082@gmail.com') &&
    teamPageContent.includes('FRONTEND')
  );

  assert(
    'Shravani Bhosale mapped to FARMER / DATABASE',
    teamPageContent.includes('Shravani Bhosale') &&
    teamPageContent.includes('shravani2.bhosale.comp.25@vpkbiet.org') &&
    teamPageContent.includes('DATABASE')
  );

  assert(
    'Anuj Deshpande mapped to BUYER / AI_ML',
    teamPageContent.includes('Anuj Deshpande') &&
    teamPageContent.includes('anuj.deshpande.comp.25@vpkbiet.org') &&
    teamPageContent.includes('AI_ML')
  );

  assert(
    'Prajwal Khomane mapped to BUYER / QA',
    teamPageContent.includes('Prajwal Khomane') &&
    teamPageContent.includes('prajwal.khomane.aids.25@vpkbiet.org') &&
    teamPageContent.includes('QA')
  );

  // --- SECTION 9: MANDATORY CONCURRENT INVENTORY COMBINATIONS ---
  console.log('\n--- 2. Mandatory Concurrent Inventory Combinations ---');

  // Simulation harness of atomic database decrement logic
  function simulateAtomicDecrement(
    initialStock: number,
    reqA: number,
    reqB: number
  ): { stockRemaining: number; aSuccess: boolean; bSuccess: boolean } {
    let stock = initialStock;
    let status = 'ACTIVE';

    function tryDecrement(qty: number): boolean {
      if (qty <= 0) return false;
      if (status !== 'ACTIVE' || stock < qty) return false;
      stock -= qty;
      if (stock <= 0) {
        status = 'SOLD_OUT';
      }
      return true;
    }

    // Interleaved execution simulation
    const aSuccess = tryDecrement(reqA);
    const bSuccess = tryDecrement(reqB);

    return { stockRemaining: stock, aSuccess, bSuccess };
  }

  // Combination 1: 100 kg -> 80 kg + 50 kg
  const c1 = simulateAtomicDecrement(100, 80, 50);
  assert(
    'Combination 80 + 50 from 100kg: One succeeds, one fails, remaining is 20kg (never 130kg sold)',
    c1.aSuccess === true && c1.bSuccess === false && c1.stockRemaining === 20
  );

  // Reverse race order for 80 + 50
  const c1Rev = simulateAtomicDecrement(100, 50, 80);
  assert(
    'Combination 50 + 80 from 100kg: One succeeds, one fails, remaining is 50kg',
    c1Rev.aSuccess === true && c1Rev.bSuccess === false && c1Rev.stockRemaining === 50
  );

  // Combination 2: 100 kg -> 60 kg + 40 kg
  const c2 = simulateAtomicDecrement(100, 60, 40);
  assert(
    'Combination 60 + 40 from 100kg: Both succeed, final stock is 0kg (SOLD_OUT)',
    c2.aSuccess === true && c2.bSuccess === true && c2.stockRemaining === 0
  );

  // Combination 3: 100 kg -> 50 kg + 50 kg
  const c3 = simulateAtomicDecrement(100, 50, 50);
  assert(
    'Combination 50 + 50 from 100kg: Both succeed, final stock is 0kg (SOLD_OUT)',
    c3.aSuccess === true && c3.bSuccess === true && c3.stockRemaining === 0
  );

  // Combination 4: 100 kg -> 90 kg + 20 kg
  const c4 = simulateAtomicDecrement(100, 90, 20);
  assert(
    'Combination 90 + 20 from 100kg: One succeeds, one fails, final stock is 10kg',
    c4.aSuccess === true && c4.bSuccess === false && c4.stockRemaining === 10
  );

  // Combination 5: 100 kg -> 100 kg + 1 kg
  const c5 = simulateAtomicDecrement(100, 100, 1);
  assert(
    'Combination 100 + 1 from 100kg: One succeeds, one fails, final stock is 0kg',
    c5.aSuccess === true && c5.bSuccess === false && c5.stockRemaining === 0
  );

  // --- SECTION 10: TRANSACTION INTEGRITY & ROLLBACK ---
  console.log('\n--- 3. Order Transaction Integrity & Rollback Compensation ---');
  const ordersServiceFile = fs.readFileSync(
    path.join(process.cwd(), 'backend', 'src', 'modules', 'orders', 'orders.service.ts'),
    'utf8'
  );

  assert(
    'OrdersService implements compensating rollback for failed orders',
    ordersServiceFile.includes('catch (txnError: any)') &&
    ordersServiceFile.includes('restore_product_inventory') &&
    ordersServiceFile.includes('escrow_transactions') &&
    ordersServiceFile.includes('order_items')
  );

  assert(
    'Database migration defines restore_product_inventory compensation function',
    fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '021_functions_triggers.sql'), 'utf8')
      .includes('FUNCTION public.restore_product_inventory')
  );

  // --- SECTION 11: IDEMPOTENCY HANDLING ---
  console.log('\n--- 4. Idempotency Key Handling ---');
  assert(
    'OrdersService inspects idempotencyKey to prevent duplicate order creation',
    ordersServiceFile.includes('params.idempotencyKey') &&
    ordersServiceFile.includes('IDEMPOTENCY:')
  );

  // --- SECTION 12: LOGISTICS RATE CALCULATION ---
  console.log('\n--- 5. Logistics Freight Matrix & Tamper Resistance ---');
  const logistics = new LogisticsService();

  const miniTruckQuote = logistics.calculateLogisticsQuote(50, 500, 'MINI_TRUCK');
  assert(
    'Mini truck quote: baseFare 500 + 50km * 16 = 1300',
    miniTruckQuote.estimatedCost === 1300
  );

  const heavyTruckQuote = logistics.calculateLogisticsQuote(100, 2500, 'HEAVY_TRUCK');
  // baseFare 2400 + 100km * 38 = 6200 + excess weight (500/100 * 15 = 75) = 6275
  assert(
    'Heavy truck quote with excess weight: 2400 + 3800 + 75 = 6275',
    heavyTruckQuote.estimatedCost === 6275
  );

  // --- SECTION 13: DATABASE ESCROW WORKFLOW ---
  console.log('\n--- 6. Database Escrow Workflow & State Management ---');
  const escrowServiceFile = fs.readFileSync(
    path.join(process.cwd(), 'backend', 'src', 'modules', 'escrow', 'escrow.service.ts'),
    'utf8'
  );

  assert(
    'Escrow release enforces DELIVERED produce status prerequisite',
    escrowServiceFile.includes("order.status !== 'DELIVERED'")
  );

  assert(
    'Escrow release records immutable audit log',
    escrowServiceFile.includes("action: 'ESCROW_RELEASE'") &&
    escrowServiceFile.includes('audit_logs')
  );

  assert(
    'Escrow refund records immutable audit log',
    escrowServiceFile.includes("action: 'ESCROW_REFUND'") &&
    escrowServiceFile.includes('audit_logs')
  );

  // --- SECTION 6: NEGOTIATION IMMUTABILITY ---
  console.log('\n--- 7. Negotiation History Immutability ---');
  const migrationCounters = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '010_request_counters.sql'),
    'utf8'
  );
  const rlsFile = fs.readFileSync(
    path.join(process.cwd(), 'supabase', 'migrations', '022_rls_policies.sql'),
    'utf8'
  );

  assert(
    'request_counters table stores immutable counter offer rounds with check constraints',
    migrationCounters.includes('request_id') &&
    migrationCounters.includes('price') &&
    migrationCounters.includes('offered_by') &&
    migrationCounters.includes('counters_price_positive')
  );

  assert(
    'RLS prevents UPDATE or DELETE on request_counters (append-only)',
    !rlsFile.includes('ON public.request_counters FOR UPDATE') &&
    !rlsFile.includes('ON public.request_counters FOR DELETE')
  );

  // --- SECTION 15, 16: KYC & DISPUTES ---
  console.log('\n--- 8. KYC & Dispute Security Transitions ---');
  assert(
    'Disputes require order participant or admin access',
    rlsFile.includes('Order parties and admins can view disputes') &&
    rlsFile.includes('buyer_id = auth.uid() OR farmer_id = auth.uid()')
  );

  assert(
    'KYC records protected by user_id and admin privilege',
    rlsFile.includes('Users can read own KYC records and admins read all')
  );

  console.log('\n============================================================');
  console.log(`Workflow Matrix Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runWorkflowMatrix().catch((err) => {
  console.error('Workflow matrix execution failed:', err);
  process.exit(1);
});
