# AgriTech — System Architecture

## 1. System Overview

AgriTech is a modern B2B Agricultural Marketplace engineered to connect farmers, wholesale sellers/aggregators, and commercial buyers directly. The platform eliminates opaque intermediary markups, unverified weighbridge discrepancies, and payment delays through real-time APMC mandi market intelligence, farm-gate logistics booking, and a non-custodial milestone escrow workflow system.

```text
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Production Frontend                  │
│               React 19 + TypeScript + Vite                  │
│             https://agri-tech-five.vercel.app               │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTPS                        │ Supabase JS
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Render Trusted Backend     │ │     Supabase Cloud         │
│   Node.js + Express + TS     │ │  PostgreSQL 15 (with RLS)  │
│   • HMAC Webhook Validation  │ │  • 30 Sequential Migrations│
│   • Financial Total Calc     │ │  • Auth & User Management  │
│   • Concurrency Protection   │ │  • Row Level Security (RLS)│
│   • Idempotency Engine       │ │  • Append-Only Audit Trail │
│   • Logistics Rate Engine    │ │  • Storage Buckets         │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Razorpay Sandbox Gateway    │
│  • HMAC SHA-256 Signature    │
│  • Webhook Signature Verif.  │
│  (Disabled for Demo Mode)    │
└──────────────────────────────┘
```

---

## 2. Frontend & Backend Responsibilities

### Frontend (Client-Side)
- Built with **React 19**, **TypeScript 5.8**, and **Vite 6**.
- Implements role-based routing (`/farmer/*`, `/seller/*`, `/buyer/*`, `/admin/*`).
- Handles public discovery (`/marketplace`, `/products/:id`, `/market-prices`, `/logistics`).
- Communicates directly with Supabase via `@supabase/supabase-js` using Row Level Security (RLS) for user-scoped data.
- Calls the deployed Express backend for trusted financial, transactional, and logistics calculations.

### Backend (Server-Side)
- Built with **Node.js 22**, **Express 4.21**, and **TypeScript**.
- Acts as a privileged transactional coordinator using `SUPABASE_SERVICE_ROLE_KEY`.
- Enforces:
  - Strict CORS validation (`ALLOWED_ORIGINS`).
  - Request rate limiting (`rateLimiter.ts`).
  - Request idempotency caching via DB & memory (`idempotency.ts`).
  - Structured request logging with request correlation IDs (`logger.ts`).
  - Centralized error handling (`errorHandler.ts`).

---

## 3. Database Architecture & Supabase Role

The database layer consists of **30 forward-only sequential migrations** (`001` through `030`) hosted on Supabase PostgreSQL:

1. **Extensions & Enums**: `uuid-ossp`, `pgcrypto`, and 12 strict platform enums.
2. **Core Profiles**: `profiles`, `farmer_profiles`, `buyer_profiles`, `team_members`.
3. **Catalog & Trading**: `products`, `product_images`, `buyer_requests`, `request_counters`.
4. **Orders & Transactions**: `orders`, `order_items`, `order_milestones`, `escrow_transactions`.
5. **Logistics & Ops**: `logistics_bookings`, `notifications`, `disputes`, `kyc_records`, `audit_logs`.
6. **Integrity & Security**: `idempotency_records`, storage RLS policies, seller role migration, Security Advisor hardening.

---

## 4. Authentication & Authorization Flow

```text
User Input (Email & Password)
        │
        ▼
Supabase Auth (GoTrue) ──► JWT Issued (Access + Refresh Token)
        │
        ▼
Client Profile Resolution ──► Check platform_role in public.profiles
        │
        ▼
Route Guard Evaluation ──► RoleRoute matches allowed roles?
    ├── YES ──► Mount Dashboard View
    └── NO  ──► Redirect to authorized dashboard / login
```

- **Authentication**: Native Supabase Auth (`supabase.auth.signInWithPassword`, `signOut`, `updateUser`).
- **Authorization**: 4 distinct platform roles (`ADMIN`, `FARMER`, `SELLER`, `BUYER`) enforced via:
  - Database triggers preventing role self-escalation (`protect_profile_role`).
  - PostgreSQL Row Level Security (RLS) policies on every table.
  - Client-side `<RoleRoute>` guards in `src/routes/AppRoutes.tsx`.

---

## 5. Order & Escrow Lifecycle State Transitions

```text
[Buyer creates order] ──► PENDING
                            │
              [Advance Escrow Secured]
                            ▼
                     HELD_IN_ESCROW
                            │
                 [Produce Dispatched]
                            ▼
                        DISPATCHED
                            │
                 [Doorstep Delivery]
                            ▼
                        DELIVERED
                            │
           [Buyer Inspection Approval]
           ├── Approved ──► RELEASED (Farmer payout)
           └── Dispute  ──► DISPUTE_HOLD ──► REFUNDED (Admin override)
```

- **Concurrency Safety**: `public.create_order_atomic` uses PostgreSQL `SELECT ... FOR UPDATE` row locking to prevent stock oversubscription under simultaneous buyer checkout attempts.
- **Financial Integrity**: Server-side total calculation ensures quantity multiplied by unit price cannot be forged by client-side modifications.

---

## 6. Logistics & Quote Flow

1. Buyer or Farmer inputs shipment parameters (`pickupLocation`, `deliveryLocation`, `distanceKm`, `weightKg`, `vehicleType`).
2. Backend rate engine calculates tiered freight:
   - Base fare by vehicle class (Mini Truck, LCV, Cold-Chain Reefer, Heavy Truck).
   - Per-km rate with minimum charge guarantees.
3. Logistics booking is linked to the order and tracked through milestones:
   `REQUESTED → CONFIRMED → VEHICLE_ASSIGNED → IN_TRANSIT → DELIVERED`.

---

## 7. Notification Flow

- Event-triggered notifications for order status changes, buyer RFQ counters, and milestone completions.
- Persisted in `public.notifications` with unread state tracking.
- Client notification drawer displays real-time badges and mark-all-read capabilities.

---

## 8. Payment Abstraction Architecture

- `IPaymentProvider` interface defines contract:
  - `createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>`
  - `verifyPaymentSignature(orderId, paymentId, signature): Promise<boolean>`
  - `verifyWebhook(payload, signatureHeader): Promise<VerifyWebhookResult>`
  - `refundPayment(paymentId, amount, reason): Promise<{ refundId, status }>`
- `RazorpayProvider` implements this abstraction using HMAC SHA-256.
- In demo mode, `FEATURES.ENABLE_LIVE_PAYMENTS` defaults to `false`. Payments are simulated through milestone escrow state updates to allow full end-to-end testing without real currency transactions.
