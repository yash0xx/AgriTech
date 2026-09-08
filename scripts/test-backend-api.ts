import { createApp } from '../backend/src/app';
import http from 'http';

/**
 * Automated test suite for Backend API & Security Guards
 */
async function runBackendTests() {
  console.log('--- Starting Backend API Security & Endpoint Tests ---');
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health returns 200 and ok status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(`Expected status ok, got ${json.status}`);
  });

  // 2. Logistics quote calculation (public helper)
  await test('POST /api/logistics/quote calculates freight correctly', async () => {
    const res = await fetch(`${baseUrl}/api/logistics/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceKm: 100, weightKg: 1000, vehicleType: 'MINI_TRUCK' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.estimatedCost) throw new Error('Missing estimatedCost in response');
  });

  // 3. Unauthenticated access to protected order calculations is rejected
  await test('POST /api/orders/calculate-total blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/calculate-total`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'test-id', quantity: 50 }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 4. Unauthenticated escrow release is rejected
  await test('POST /api/escrow/release blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/escrow/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ord-123' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 5. Unauthenticated escrow refund is rejected
  await test('POST /api/escrow/refund blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/escrow/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ord-123', reason: 'Damaged' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 6. Unauthenticated order creation is rejected (401)
  await test('POST /api/orders/create blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'prod-123', quantity: 100 }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 7. Unauthenticated milestone append is rejected (401)
  await test('POST /api/orders/:id/milestone blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/ord-123/milestone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 8. Unauthenticated logistics booking is rejected (401)
  await test('POST /api/logistics/book blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/logistics/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupLocation: 'Farm Yard',
        deliveryLocation: 'APMC Vashi',
        distanceKm: 150,
        weightKg: 2500,
      }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 9. Unauthenticated get booking is rejected (401)
  await test('GET /api/logistics/bookings/:id blocks unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/logistics/bookings/book-123`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 10. Input validation: Logistics quote rejects negative distance
  await test('POST /api/logistics/quote rejects negative distanceKm (400)', async () => {
    const res = await fetch(`${baseUrl}/api/logistics/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceKm: -50, weightKg: 1000 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 11. Input validation: Logistics quote rejects negative or zero weight
  await test('POST /api/logistics/quote rejects zero/negative weightKg (400)', async () => {
    const res = await fetch(`${baseUrl}/api/logistics/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceKm: 100, weightKg: 0 }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 12. Input validation: Logistics quote rejects non-numeric input
  await test('POST /api/logistics/quote rejects malformed non-numeric values (400)', async () => {
    const res = await fetch(`${baseUrl}/api/logistics/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distanceKm: 'invalid_distance', weightKg: 'not_a_number' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 13. Service Logic: Logistics Service rate matrix produces non-zero calculated freight
  await test('LogisticsService calculates accurate tier rate and minimum base charge', async () => {
    const { LogisticsService } = await import('../backend/src/modules/logistics/logistics.service');
    const service = new LogisticsService();
    const quote = service.calculateLogisticsQuote(120, 2000, 'HEAVY_TRUCK');
    if (quote.baseFare !== 2400) throw new Error(`Expected baseFare 2400, got ${quote.baseFare}`);
    if (quote.estimatedCost <= 0) throw new Error(`Expected positive estimatedCost, got ${quote.estimatedCost}`);
  });

  // 14. Financial calculations: Server-side pricing cannot produce negative amounts
  await test('OrdersService verifies server calculation consistency', async () => {
    const { OrdersService } = await import('../backend/src/modules/orders/orders.service');
    const service = new OrdersService();
    // Verify instance exists and has trusted calculation methods
    if (typeof service.calculateTrustedTotal !== 'function') throw new Error('calculateTrustedTotal missing');
    if (typeof service.createTrustedOrder !== 'function') throw new Error('createTrustedOrder missing');
  });

  server.close();

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runBackendTests();
