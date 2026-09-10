# AgriTech
> **Smart B2B Agricultural Marketplace**
> Directly, Digitally, Transparently connecting farmers, wholesale sellers, and commercial buyers.

---

## 1. Overview

**AgriTech** is a specialized B2B marketplace platform built for the Indian agricultural ecosystem. The platform eliminates opaque middlemen markups, unverified weighbridge discrepancies, and payment delays by connecting crop producers (farmers), commercial aggregators (sellers), and wholesale purchasers (buyers) directly. The system integrates real-time APMC mandi price discovery, farm-gate logistics quotation, and a non-custodial milestone-based escrow workflow.

---

## 2. Features

- **Direct Producer-to-Buyer Trading**: Eliminates multi-tier commissions through direct listing and negotiation.
- **Role-Tailored Portals**: Dedicated workspaces for Farmers, Wholesale Sellers, Commercial Buyers, and Platform Administrators.
- **Real-Time APMC Mandi Intelligence**: Live price discovery, modal trend analytics, and price prediction across Indian agricultural mandis.
- **Farm-Gate Logistics Engine**: Tiered freight rate calculation and transport booking supporting Mini Trucks, LCVs, Heavy Haulers, and Cold-Chain Reefers.
- **RFQ & Counter-Offer Negotiation**: Interactive quote request and price counter-offer workflows with quantity and payment terms negotiation.
- **Non-Custodial Milestone Escrow**: Automated transaction progression (`PENDING` → `HELD_IN_ESCROW` → `DISPATCHED` → `DELIVERED` → `RELEASED`).
- **Doorstep Inspection Protection**: Buyers inspect produce quality and moisture levels upon delivery before funds release.
- **Immutable Audit Logging**: Comprehensive, append-only security logs for administrative oversight and dispute resolution.

---

## 3. Architecture

AgriTech employs a decoupled, production-hardened cloud architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│                 Vercel Production Frontend                  │
│               React 19 + TypeScript + Vite                  │
│             https://agri-tech-five.vercel.app               │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTPS REST                   │ Supabase JS (RLS)
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    Render Trusted Backend    │ │     Supabase Cloud         │
│    Node.js + Express + TS    │ │  PostgreSQL 15 (with RLS)  │
│    • HMAC Webhook Validation │ │  • 30 Sequential Migrations│
│    • Financial Order Locking │ │  • Auth & User Management  │
│    • Concurrency Protection  │ │  • Append-Only Audit Trail │
│    • Idempotency Engine      │ │  • Storage Buckets         │
│    • Logistics Rate Matrix   │ └────────────────────────────┘
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Razorpay Sandbox Gateway    │
│  (Disabled for Demo Mode)    │
└──────────────────────────────┘
```

For detailed system workflows and state machines, see [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md).

---

## 4. Technology Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6, React Router 7, Tailwind CSS v4, Lucide React
- **Backend**: Node.js 22 LTS, Express 4.21, TypeScript, Tsx
- **Database & Auth**: Supabase PostgreSQL 15, Supabase GoTrue Auth, Storage
- **Security & Middleware**: PostgreSQL Row Level Security (RLS), Idempotency Middleware, Rate Limiting, Request Logger
- **Hosting & Infrastructure**: Vercel (Frontend), Render (Backend), Supabase Cloud (Data & Storage)

---

## 5. Roles

The platform enforces strict role-based access control across four distinct roles:

| Role | Scope | Key Capabilities | Route Guard |
| :--- | :--- | :--- | :--- |
| **FARMER** | Direct Crop Producer | Publishes farm batches, tracks mandi rates, reviews RFQs, schedules logistics | `/farmer/*` |
| **SELLER** | Wholesale Merchant / Aggregator | Manages commercial inventory lots, bulk dispatches, multi-origin logistics | `/seller/*` |
| **BUYER** | Commercial Purchaser | Discovers catalog, issues RFQs, places escrow orders, inspects delivery | `/buyer/*` |
| **ADMIN** | Platform Operations | KYC approval, dispute arbitration, audit log review, team management | `/admin/*` |

---

## 6. Project Structure

```text
AgriTech/
├── backend/                  # Privileged Express backend
│   └── src/
│       ├── config/           # Supabase client and feature configuration
│       ├── middleware/       # Auth, rate limiting, idempotency, logging, errors
│       ├── modules/          # Business logic: orders, logistics, escrow, payments
│       ├── utils/            # Shared server utilities
│       ├── app.ts            # Express application factory & route wiring
│       └── server.ts         # Server startup & port binding
├── docs/                     # Technical documentation
│   ├── architecture/         # System architecture & state machine diagrams
│   ├── development/          # Local setup & provisioning guide
│   ├── security/             # RLS policies & attack surface analysis
│   └── DEPLOYMENT_OPERATIONS.md # Deployment & disaster recovery runbook
├── scripts/                  # Automated verification & provisioning test suites
│   ├── provision-team.ts     # Team account provisioning & synchronization
│   ├── run-attack-tests.ts   # Security attack vector test suite
│   ├── run-security-audit.ts # Secret scan and bundle audit
│   ├── test-backend-api.ts   # Backend API & endpoint tests
│   ├── test-concurrency-hardened.ts # High-concurrency checkout stress tests
│   ├── test-direct-security-rpc.ts  # Direct RPC security suite
│   ├── test-e2e-workflow-matrix.ts  # E2E workflow matrix tests
│   ├── test-golive-audit.ts  # Go-live acceptance audit
│   ├── test-real-team-accounts.ts   # Team account validation
│   ├── test-release-final-validation.ts # Final release verification
│   ├── test-role-migration-security.ts  # 4-role isolation tests
│   ├── test-staging-acceptance.ts   # Staging acceptance tests
│   ├── validate-database-schema.ts  # Migration & schema validator
│   └── verify-all.ts         # Master verification runner
├── src/                      # React 19 frontend application
│   ├── auth/                 # AuthProvider, ProtectedRoute, RoleRoute, useAuth
│   ├── components/           # Reusable UI components (brand, common)
│   ├── context/              # AppContext state management
│   ├── layouts/              # AppLayout, AuthLayout
│   ├── lib/                  # Supabase client initialization
│   ├── pages/                # Authentication pages & Team Management
│   ├── routes/               # AppRoutes and role route definitions
│   ├── services/             # Client API and Supabase query services
│   ├── types.ts              # Core TypeScript interface definitions
│   ├── views/                # Role dashboards (farmer, seller, buyer, admin, public)
│   ├── index.css             # Base styles & Tailwind theme
│   └── main.tsx              # Application root entrypoint
├── supabase/                 # Supabase configuration & migrations
│   ├── config.toml           # Supabase project configuration
│   └── migrations/           # 30 sequential SQL migrations (001 to 030)
├── .env.example              # Environment variable template
├── package.json              # Project dependencies & scripts
├── render.yaml               # Backend Render deployment blueprint
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Frontend Vercel routing configuration
└── vite.config.ts            # Vite build configuration
```

---

## 7. Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yash0xx/AgriTech.git
   cd AgriTech
   ```
2. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
4. **Start development servers**:
   ```bash
   # Terminal 1: Frontend (http://localhost:3050)
   npm run dev

   # Terminal 2: Backend (http://localhost:5001)
   npm start
   ```

For comprehensive instructions, see [docs/development/LOCAL_SETUP.md](docs/development/LOCAL_SETUP.md).

---

## 8. Environment Variables

All configurable variables are templated in `.env.example`:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_APP_TITLE` | Frontend | Application browser tab title |
| `VITE_API_BASE_URL` | Frontend | Deployed or local Express backend API URL |
| `VITE_SUPABASE_URL` | Frontend & Backend | Supabase project instance URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase public anonymous API key |
| `PORT` | Backend | HTTP server listening port (Default: 5001) |
| `ALLOWED_ORIGINS` | Backend | Comma-separated CORS allowed origin URLs |
| `SUPABASE_SERVICE_ROLE_KEY`| Backend | Privileged service-role key for backend operations |
| `RAZORPAY_KEY_ID` | Backend | Razorpay sandbox key ID |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay sandbox key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Razorpay webhook verification secret |
| `DEFAULT_TEAM_PASSWORD` | CI/CD | Temporary password used during local provisioning |

---

## 9. Database / Supabase

The database consists of **30 forward-only sequential migrations** located in `supabase/migrations/`:

- `001_extensions.sql` — PostgreSQL extensions (`uuid-ossp`, `pgcrypto`)
- `002_enums.sql` — 12 platform domain enums
- `003_profiles.sql` — Base user profiles with role constraints
- `004_farmer_profiles.sql` — Producer profile extensions & land records
- `005_buyer_profiles.sql` — Commercial purchaser profile extensions
- `006_products.sql` — Product listings with stock & pricing constraints
- `007_product_images.sql` — Multi-image storage associations
- `008_mandi_prices.sql` — Real-time APMC price intelligence
- `009_buyer_requests.sql` — RFQ & counter-offer records
- `010_request_counters.sql` — Counter-offer negotiation thread tracking
- `011_orders.sql` — Master order records with financial tracking
- `012_order_items.sql` — Line items linked to orders and catalog
- `013_order_milestones.sql` — Milestone lifecycle event tracking
- `014_escrow_transactions.sql` — Escrow fund states and transaction logs
- `015_logistics_bookings.sql` — Freight transport and vehicle dispatch
- `016_notifications.sql` — System and transactional alerts
- `017_disputes.sql` — Quality and delivery dispute resolution records
- `018_kyc_records.sql` — Identity and agricultural certificate records
- `019_audit_logs.sql` — Append-only audit trail
- `020_team_members.sql` — Engineering team roles and directory
- `021_functions_triggers.sql` — Atomic order creation and security triggers
- `022_rls_policies.sql` — Row Level Security policies across all tables
- `023_views.sql` — Secure analytic and reporting database views
- `024_indexes.sql` — Query performance indexes
- `025_seed.sql` — Initial seed data for products and mandis
- `026_idempotency_records.sql` — Idempotency storage table
- `027_storage_policies.sql` — Supabase Storage RLS policies
- `028_add_seller_role.sql` — 4th platform role (`SELLER`) migration
- `029_security_advisor_view_hardening.sql` — Security Advisor view hardening
- `030_security_advisor_warning_hardening.sql` — Security Advisor warning hardening

---

## 10. Authentication

- **Provider**: Supabase GoTrue Auth.
- **Supported Workflows**: Email/Password Sign In, Registration, Password Reset, and Change Password.
- **Route Protection**: `<ProtectedRoute>` and `<RoleRoute>` guards enforce authentication and authorization prior to rendering any dashboard view.
- **Role Immutability**: Protected by database triggers preventing client-side role modification.

---

## 11. Payment Status

- **Status**: Razorpay gateway implementation and payment provider interfaces are **prepared, architected, and tested**.
- **Demo Mode**: For the current evaluation demo, **LIVE PAYMENTS ARE DISABLED** via `FEATURES.ENABLE_LIVE_PAYMENTS` (`backend/src/config/features.ts`).
- **Simulated Escrow**: Transactions operate through non-custodial milestone escrow states (`HELD_IN_ESCROW` → `RELEASED`) to demonstrate end-to-end purchasing, delivery inspection, and fund release without real monetary charges.

---

## 12. Testing

AgriTech includes a complete 14-suite automated verification matrix:

```bash
# Execute master verification runner
npm run verify
```

Individual test suites:
- `npm run test:security` — Scans bundles and source files for leaked secrets.
- `npm run test:api` — Validates backend API routes, guards, and rate limits.
- `npm run test:staging` — Runs end-to-end acceptance tests against the Supabase staging database.
- `npm run lint` — Typechecks both frontend and backend (`tsc --noEmit`).
- `npm run build` — Builds the production Vite bundle.

---

## 13. Deployment

- **Frontend**: Deployed on **Vercel** at `https://agri-tech-five.vercel.app`.
  - Automatic builds triggered from the repository.
  - SPA routing handled via `vercel.json` rewrites.
- **Backend**: Configured for deployment on **Render** using `render.yaml`.
- **Database**: Hosted on **Supabase Cloud** with automated point-in-time recovery and SSL enforcement.

For deployment operations and disaster recovery procedures, see [docs/DEPLOYMENT_OPERATIONS.md](docs/DEPLOYMENT_OPERATIONS.md).

---

## 14. Security

- **Row Level Security (RLS)**: Enforced across all tables with role-scoped policies.
- **Append-Only Audit Logs**: Modifying or deleting audit entries is prohibited at the database engine level.
- **Rate Limiting & Idempotency**: Protects order creation and logistics booking against duplicate requests and brute-force abuse.
- **HMAC Verification**: Webhooks are cryptographically validated using HMAC SHA-256 signatures.
- **Zero Secrets Committed**: Verified by continuous automated security audits.

For full security policy documentation, see [docs/security/SECURITY.md](docs/security/SECURITY.md).

---

## 15. Demo Accounts

The following verified team accounts are configured for platform demonstration:

| Member | Email | Platform Role | Team Focus |
| :--- | :--- | :--- | :--- |
| **Om Nalawade** | `om.nalawade.aids.25@vpkbiet.org` | `ADMIN` | Architecture Oversight & Administration |
| **Date Atharv** | `dateathrav@gmail.com` | `FARMER` | Crop Publishing & Escrow Workflows |
| **Yash Lokhande** | `yashlokhande082@gmail.com` | `SELLER` | Wholesale Inventory & Bulk Dispatches |
| **Shravani Bhosale** | `shravani2.bhosale.comp.25@vpkbiet.org` | `FARMER` | Database Schemas & Audit Logging |
| **Anuj Deshpande** | `anuj.deshpande.comp.25@vpkbiet.org` | `BUYER` | Market Price Models & Procurement |
| **Prajwal Khomane** | `prajwal.khomane.aids.25@vpkbiet.org` | `BUYER` | Security Auditing & QA Benchmarks |

*Note: In accordance with security best practices, passwords are not stored in source code or documentation.*

---

## 16. Future Improvements

- Integration of live payment gateway credentials once production regulatory clearances are obtained.
- Real-time IoT weighbridge integration at APMC collection centers.
- AI-driven multi-spectral computer vision for automatic crop grading from smartphone photos.
- Offline-first progressive web app (PWA) capabilities for rural areas with intermittent connectivity.
- Direct integration with open agricultural logistics aggregators across all Indian states.
