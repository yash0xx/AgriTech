# 🌱 AgriTech — Direct Farm-to-Buyer B2B Marketplace

> **Directly, Digitally, Transparently.**
> A direct-to-buyer agricultural marketplace connecting Indian farmers, wholesale sellers/aggregators, and commercial buyers with real-time APMC mandi intelligence, farm-gate logistics booking, and a non-custodial milestone escrow workflow system.

---

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL / Supabase](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0D6C45.svg)](LICENSE)

---

## 📌 Architecture & System Overview

AgriTech eliminates intermediary commissions and unfair weighbridge practices by creating a verified direct trading platform between agricultural producers, wholesale aggregators, and commercial buyers (supermarkets, food processors, exporters).

```text
┌─────────────────────────────────────────────────────────────┐
│                   AGRITECH PLATFORM                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    FARMER    │       │    SELLER    │       │    BUYER     │
│   PORTAL     │       │   MERCHANT   │       │ PROCUREMENT  │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              ▼
               ┌──────────────────────────────┐
               │   EXPRESS TRUSTED BACKEND    │
               │   • HMAC Webhook Validator   │
               │   • Logistics Estimator      │
               │   • Idempotency Engine       │
               └──────────────┬───────────────┘
                              ▼
               ┌──────────────────────────────┐
               │     SUPABASE POSTGRESQL      │
               │   • 28 Sequential Migrations │
               │   • RLS on all 20 Tables     │
               │   • Non-Custodial Escrow     │
               │   • Append-Only Audit Trail  │
               └──────────────────────────────┘
```

---

## 👥 Platform Roles & Access Model

The platform enforces strict Row-Level Security (RLS) and client-side guards across 4 distinct roles:

| Platform Role | Scope | Capabilities & Boundaries | Route Guard |
| :--- | :--- | :--- | :--- |
| **FARMER** | Direct Crop Producer | Publishes farm produce batches, tracks APMC mandi rates, receives buyer RFQs, sends counter-offers, schedules farm-gate logistics. | `/farmer/*` |
| **SELLER** | Merchant / Aggregator | Manages commercial agricultural inventory, negotiates wholesale bulk orders, manages multi-origin shipments. | `/seller/*` |
| **BUYER** | Commercial Purchaser | Explores marketplace, issues Requests for Quote (RFQs), negotiates price/quantity terms, places orders backed by non-custodial escrow. | `/buyer/*` |
| **ADMIN** | Platform Operations | KYC document verification, audit log inspection, dispute arbitration, and team management console. | `/admin/*` |

> ℹ️ **Listing Ownership Architecture:** In the database schema, `products.farmer_id` represents the **listing owner ID**. Both **FARMER** and **SELLER** accounts own and manage marketplace listings with strict owner-level RLS policies.

---

## 👥 Engineering Team Roster

| Member | Email | Platform Role | Internal Team Role | Focus Area |
| :--- | :--- | :--- | :--- | :--- |
| **Om Nalawade** | `om.nalawade.aids.25@vpkbiet.org` | `ADMIN` | `TEAM_LEAD` | Architecture oversight, deployment management & admin leadership |
| **Date Atharv** | `dateathrav@gmail.com` | `FARMER` | `BACKEND` | API services, Supabase PostgreSQL functions & escrow workflows |
| **Yash Lokhande** | `yashlokhande082@gmail.com` | `SELLER` | `FRONTEND` | React 19 UI, Seller Portal, responsive UX & state management |
| **Shravani Bhosale** | `shravani2.bhosale.comp.25@vpkbiet.org` | `FARMER` | `DATABASE` | Schema design, indexing, RLS policies, audit logs & migrations |
| **Anuj Deshpande** | `anuj.deshpande.comp.25@vpkbiet.org` | `BUYER` | `AI_ML` | Mandi price prediction models, quality grading CV & buyer matching |
| **Prajwal Khomane** | `Prajwal.khomane.aids.25@vppkbiet.org` | `BUYER` | `QA` | Security auditing, cross-role attack testing & load benchmarks |

---

## 🛡️ Non-Custodial Escrow & Payments

- **Non-Custodial Workflow**: AgriTech operates a milestone-based, non-custodial digital escrow state machine. The platform does not hold customer funds directly; rather, funds are managed through payment gateway holding accounts with cryptographic transition guards:
  ```text
  PENDING → HELD_IN_ESCROW → [DISPATCHED → DELIVERED] → RELEASED
                                                     ↳ DISPUTE_HOLD → REFUNDED
  ```
- **Razorpay Sandbox Status**: Payment intent creation and webhook verification have been fully validated in sandbox mode (`rzp_test_...`) using HMAC SHA-256 signature verification. Replay attacks and tampered payloads are cryptographically rejected.

---

## 🗄️ Database Architecture & Migrations

The database is built on PostgreSQL via Supabase using 28 forward-only sequential migrations located in `supabase/migrations/`:

| Migration | Description |
| :--- | :--- |
| `001_extensions.sql` | `uuid-ossp`, `pgcrypto` cryptographic extensions |
| `002_enums.sql` | 12 platform enums (`user_role`, `order_status`, `payment_status`, etc.) |
| `003_profiles.sql` | `public.profiles` core identity table with RLS |
| `004_farmer_profiles.sql` | Producer farm metadata and land details |
| `005_buyer_profiles.sql` | Commercial buyer business profiles and GSTIN |
| `006_products.sql` | Agricultural produce listings with inventory tracking |
| `007_product_images.sql` | Listing photo gallery with primary image indicators |
| `008_mandi_prices.sql` | APMC historical and live mandi rate feed |
| `009_buyer_requests.sql` | Requests for Quote (RFQs) and initial terms |
| `010_request_counters.sql` | Immutable negotiation counter-offer rounds |
| `011_orders.sql` | Dual-party purchase orders with status tracking |
| `012_order_items.sql` | Itemized line-item order details |
| `013_order_milestones.sql` | Checkpoint tracking (`DISPATCHED`, `IN_TRANSIT`, `DELIVERED`) |
| `014_escrow_transactions.sql`| Non-custodial escrow ledger and state records |
| `015_logistics_bookings.sql`| Freight vehicle booking and transport records |
| `016_notifications.sql` | Role-targeted multi-party alert inbox |
| `017_disputes.sql` | Arbitration and dispute escalation records |
| `018_kyc_records.sql` | Identity verification documentation vault |
| `019_audit_logs.sql` | Immutable append-only platform audit log |
| `020_team_members.sql` | Internal engineering team roles and privileges |
| `021_functions_triggers.sql`| Database triggers (`handle_new_user`, `protect_profile_role`, `create_order_atomic`) |
| `022_rls_policies.sql` | Row-Level Security policies across all tables |
| `023_views.sql` | Aggregated views (`marketplace_listings`, `order_overview`, `team_members_overview`) |
| `024_indexes.sql` | Composite performance and foreign key lookup indexes |
| `025_seed.sql` | Baseline APMC Mandi feeds (Nashik, Lasalgaon, Pimpalgaon, Latur, Guntur, Karnal) |
| `026_idempotency_records.sql`| 24-hour TTL transaction deduplication engine |
| `027_storage_policies.sql`| Storage bucket RLS policies (`product-images` public, `kyc-documents` private) |
| `028_add_seller_role.sql`| SELLER role addition, `seller_profiles`, 4-role triggers & view updates |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Glassmorphism tokens, [Lucide React](https://lucide.dev/) |
| **Backend API** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), TypeScript via `tsx` |
| **Database & Auth**| [Supabase](https://supabase.com/) (PostgreSQL 15+, Supabase Auth, Storage) |
| **Payments** | [Razorpay](https://razorpay.com/) Sandbox (HMAC SHA-256 webhook validation) |

---

## 🚀 Local Setup & Verification

### Prerequisites
- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/yash0xx/AgriTech.git
cd AgriTech
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
# Fill in your Supabase project URL and keys in .env
```

### 4. Development Servers
```bash
# Run Frontend (Port 3050)
npm run dev

# Run Trusted Backend API (Port 5001)
npx tsx backend/src/server.ts
```

### 5. Running the Master Test Suite
AgriTech includes a unified verification matrix covering schema integrity, RLS attack vectors, concurrency, and production build:

```bash
# Run the Master Verification Matrix (13 Suites)
npx tsx scripts/verify-all.ts
```

Individual test suites can be executed independently:
```bash
# Static Type Checking
npx tsc --noEmit

# Production Bundle Build
npm run build

# Database Schema Validation
npx tsx scripts/validate-database-schema.ts

# Real Team Account & Role Validation
npx tsx scripts/test-real-team-accounts.ts

# Backend API & Endpoint Guards
npx tsx scripts/test-backend-api.ts

# RLS Security Attack Suite (17 Vectors)
npx tsx scripts/run-attack-tests.ts

# 4-Role Platform Migration Security
npx tsx scripts/test-role-migration-security.ts

# Staging Acceptance & Webhook Security
npx tsx scripts/test-staging-acceptance.ts

# E2E Workflow & Concurrency Matrix
npx tsx scripts/test-e2e-workflow-matrix.ts

# Production Hardening & Concurrency
npx tsx scripts/test-concurrency-hardened.ts

# Final Go-Live Audit Suite
npx tsx scripts/test-golive-audit.ts

# Repository-Wide Security Audit
npx tsx scripts/run-security-audit.ts
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
