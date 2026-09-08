-- ============================================================
-- 025_seed.sql
-- Seed reference data: Mandi APMC Prices & Agricultural Produce
-- ============================================================

-- Note on Team Members and Users (per Section 4):
-- Real user accounts and passwords must NEVER be hardcoded into migrations or SQL scripts.
-- Use the secure provisioning script `scripts/provision-team.ts` with environment
-- placeholders (TEAM_MEMBER_1_EMAIL through TEAM_MEMBER_6_EMAIL) to safely provision users
-- via the Supabase Admin API.

-- 1. Seed Verified Mandi Prices (APMC Feeds across key agricultural hubs)
INSERT INTO public.mandi_prices (
  crop_name,
  mandi_name,
  district,
  state,
  min_price,
  max_price,
  modal_price,
  arrivals_quintals,
  price_date,
  source
) VALUES
('Red Onion', 'Lasalgaon APMC', 'Nashik', 'Maharashtra', 1900, 2650, 2450, 12500, CURRENT_DATE, 'APMC_LIVE_FEED'),
('Tomato', 'Pimpalgaon APMC', 'Nashik', 'Maharashtra', 1400, 2200, 1850, 8400, CURRENT_DATE, 'APMC_LIVE_FEED'),
('Wheat (Sharbati)', 'Indore APMC', 'Indore', 'Madhya Pradesh', 2800, 3450, 3150, 4500, CURRENT_DATE, 'AGMARKNET'),
('Soybean', 'Latur APMC', 'Latur', 'Maharashtra', 4200, 4800, 4650, 6200, CURRENT_DATE, 'APMC_LIVE_FEED'),
('Green Chilli', 'Guntur APMC', 'Guntur', 'Andhra Pradesh', 3500, 5200, 4600, 3100, CURRENT_DATE, 'APMC_LIVE_FEED'),
('Basmati Rice', 'Karnal APMC', 'Karnal', 'Haryana', 3800, 4900, 4300, 7800, CURRENT_DATE, 'AGMARKNET')
ON CONFLICT DO NOTHING;
