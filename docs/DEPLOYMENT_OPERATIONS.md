# AgriTech B2B Marketplace - Deployment & Operations Guide

## 1. Database Architecture & Migration Strategy

The AgriTech PostgreSQL database schema is governed by forward-only SQL migrations located in `supabase/migrations/`:

| Migration Range | Subsystem / Capability | Security & Constraints |
|---|---|---|
| `001` - `002` | Extensions (`uuid-ossp`, `pgcrypto`) & Custom Enums | Strict typing (`user_role`, `order_status`, `escrow_status`, `team_role`) |
| `003` - `010` | Profiles, Team Members, KYC Records, Products, Categories | Row Level Security (RLS) enabled on all tables; FK relationships |
| `011` - `017` | Orders, Order Items, Milestones, Logistics, Mandi Prices, Disputes, Counter Offers | Strict cascade and foreign key constraints; server-side financial validations |
| `018` - `020` | Audit Logs, Notifications, System Settings | Immutable append-only audit trail; notification delivery |
| `021` - `024` | Triggers, Atomic RPC Functions, RLS Policies, Aggregation Views | `create_order_atomic` PostgreSQL function, `SELECT FOR UPDATE` locking |
| `025` | Production Baseline Seed (No hardcoded passwords) | Admin & confirmed team member profile seeding |
| `026` - `027` | Idempotency Storage & Storage Bucket Access Policies | TTL index for 24h idempotency keys; Private KYC storage policies |
| `028` | SELLER Platform Role, `seller_profiles` Table & Public Projection | Added `SELLER` to `user_role` enum; RLS for dual produce listing ownership (`FARMER` & `SELLER`); safe public marketplace projection `v_public_marketplace_profiles` |

### Migration Rules:
1. **Never edit an applied migration**: Once a migration has run against staging/production, changes must be introduced via a new sequentially numbered migration file (e.g., `028_*.sql`).
2. **Deterministic execution**: All migration files are idempotent where applicable (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
3. **Database Reset Strategy**:
   - **Local / CI**: Run migrations sequentially or use `supabase db reset` for a clean slate during automated testing.
   - **Production**: **NEVER run destructive resets or `db reset` against staging or production databases**. Apply new migrations using CI/CD pipelines (`supabase db push` or migration runner with migration lock).

---

## 2. Supabase Backup & Recovery Protocol

### Automated Point-In-Time Recovery (PITR) & Backups
- **Continuous WAL Archiving**: Managed by Supabase on Pro/Enterprise tiers.
- **Physical Backups**: Daily snapshots retained for 7 to 30 days depending on plan tier.
- **Disaster Recovery Steps**:
  1. Identify the target timestamp prior to data corruption or hardware fault.
  2. Initiate PITR restore from the Supabase Project Settings > Backups dashboard.
  3. Verify RLS policies, views, and functions remain intact.
  4. Perform post-recovery smoke tests (`npx tsx scripts/validate-database-schema.ts`).

---

## 3. Environment Separation & Secret Hygiene

| Environment | Purpose | Database | Allowed Frontend Origins |
|---|---|---|---|
| **Development** | Local feature work & unit tests | Local Docker / Dev Supabase project | `http://localhost:3050`, `http://localhost:3000` |
| **Staging** | End-to-end integration & pre-launch validation | Dedicated staging Supabase project | `https://staging.agritech.internal` |
| **Production** | Live commercial B2B operations | Dedicated production Supabase project | Strict whitelist configured in `ALLOWED_ORIGINS` |

### Key Isolation Principles:
- **`VITE_SUPABASE_ANON_KEY`**: Exposed only to frontend clients. Strictly guarded by Row Level Security (RLS) on all 19 database tables.
- **`SUPABASE_SERVICE_ROLE_KEY`**: Backend-only. Must NEVER be bundled into frontend source, build artifacts, or client network requests.
- **Zero Committed Passwords**: No user passwords, production database connection strings, or service tokens may ever be committed to git. All credentials are provided at runtime via environment variables or secret vaults.

---

## 4. Production CORS & Network Hardening

- In production (`NODE_ENV === 'production'`), Express enforces an exact origin match against `ALLOWED_ORIGINS`.
- Wildcard `*` origins with credentials (`Access-Control-Allow-Credentials: true`) are explicitly rejected.
- All client-to-backend and backend-to-Supabase communications must use TLS 1.3 / HTTPS.

---

## 5. Localhost & URL Audit Classification

A repository-wide audit confirms that **zero production endpoints contain hardcoded localhost URLs**:
- `README.md`: Developer guide examples only.
- `.env.example`: Safe local template documentation (`VITE_API_BASE_URL="http://localhost:5000/api"`).
- `backend/src/app.ts`: Development-only fallback CORS condition (`!isProd && origin.includes('localhost')`).
- `scripts/*.ts`: Ephemeral test harnesses used exclusively during CI/CD verification runs.
- Production runtime endpoints derive targets strictly from `process.env.SUPABASE_URL` and `import.meta.env.VITE_API_BASE_URL`.
