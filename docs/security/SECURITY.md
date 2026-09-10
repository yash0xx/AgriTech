# AgriTech — Security Architecture & Hardening

## 1. Overview & Threat Model

AgriTech handles multi-party transactions between agricultural producers, wholesale sellers, commercial buyers, and platform administrators. The security architecture adheres to defense-in-depth principles across database, server, and client boundaries:

1. **Zero Client Trust**: The backend and database never trust client-supplied roles, prices, or payment state assertions.
2. **Row-Level Security (RLS)**: Every database table has RLS enabled with explicit policies.
3. **Immutability of Audit Trails**: `audit_logs` is append-only (INSERT and SELECT only; UPDATE and DELETE are blocked).
4. **Non-Custodial Escrow Security**: Direct client manipulation of escrow states is prohibited by RLS and database triggers.

---

## 2. Row Level Security (RLS) Policies

All 20 platform tables enforce RLS:

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Own profile or Admin | Trigger on Auth signup | Own profile (role immutable) | Admin only |
| `products` | Public active listings | Farmer / Seller own | Farmer / Seller own | Farmer / Seller own |
| `orders` | Buyer or Seller involved | Backend / Atomic RPC | Involved party (status rules)| Blocked |
| `escrow_transactions`| Involved party or Admin | Backend / Admin only | Backend / Admin only | Blocked |
| `audit_logs` | Admin only | Authenticated system | Blocked | Blocked |
| `kyc_records` | Owner or Admin | Owner | Admin review only | Blocked |
| `team_members` | Authenticated | Admin only | Admin only | Admin only |

---

## 3. Database Functions & Triggers

- **`protect_profile_role()`**: Prevents authenticated users from self-escalating their `platform_role`. Only service-role or database triggers can modify role assignments.
- **`protect_team_members()`**: Restricts creation and modification of internal engineering team memberships to platform administrators.
- **`validate_buyer_request()`**: Prevents self-purchase fraud by verifying that a buyer cannot issue quote requests or place orders against their own listings.
- **`create_order_atomic()`**: Hardened with PostgreSQL `SECURITY DEFINER`, `SET search_path = ''`, and `SELECT ... FOR UPDATE` row locks to prevent stock race conditions.

---

## 4. Backend API & Endpoint Security

- **Authentication Middleware (`requireAuth`)**: Validates Supabase JWTs bearer tokens via Supabase Auth client. Attaches user context to incoming requests.
- **Role Authorization Middleware (`requireRole`)**: Rejects requests where the verified user does not hold the required `platform_role`.
- **Rate Limiting (`rateLimiter.ts`)**:
  - Order checkout limiter: 20 requests per 15-minute window per client.
  - Admin privileged endpoints: 15 requests per 15-minute window.
  - General API: 40 requests per 15-minute window.
- **Idempotency Protection (`idempotency.ts`)**:
  - Requires `Idempotency-Key` header on critical mutating operations (`/api/orders/create`, `/api/logistics/book`).
  - Caches request hash and responses across dual-tier in-memory and database records.
- **CORS Hardening**:
  - Rejects unknown origins in production environments.
  - Restricts access to approved frontend deployments (`https://agri-tech-five.vercel.app`).

---

## 5. Webhook & Signature Verification

- **HMAC SHA-256 Signature Validation**:
  - Incoming Razorpay webhooks require `x-razorpay-signature` headers.
  - Replay attacks and forged payloads are rejected prior to any order state change.
- **No Client Payment Spoofing**:
  - Payment status transitions to `HELD_IN_ESCROW` only when verified server-side through the payment webhook or authorized backend service-role invocation.

---

## 6. Secret Management & Git Hygiene

- No secrets, API keys, service-role keys, or credentials are committed to source control.
- `.env`, `.env.local`, and `backend/.env` are strictly excluded in `.gitignore`.
- `.env.example` provides template placeholder keys only.
- Continuous CI security audits scan production bundles and source files for leaked credentials.

---

## 7. Security Testing & Verification Matrix

The platform includes automated security attack suites in `scripts/`:
- `scripts/run-attack-tests.ts`: Validates that 17 distinct attack vectors (SQL injection, privilege escalation, self-purchase, audit tampering, escrow bypass) are blocked.
- `scripts/run-security-audit.ts`: Verifies zero secret leaks in the production build and source files.
- `scripts/test-role-migration-security.ts`: Verifies cross-role isolation across ADMIN, FARMER, SELLER, and BUYER.
- `scripts/test-direct-security-rpc.ts`: Validates that Security Advisor remediation functions are protected against unauthorized direct execution.
