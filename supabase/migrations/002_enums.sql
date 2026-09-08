-- ============================================================
-- 002_enums.sql
-- All PostgreSQL enum types for the AgriTech platform
-- ============================================================

-- Platform roles
CREATE TYPE public.user_role AS ENUM ('FARMER', 'BUYER', 'ADMIN');

-- Profile status
CREATE TYPE public.profile_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- KYC
CREATE TYPE public.kyc_status_type AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- Buyer business type
CREATE TYPE public.buyer_type AS ENUM ('TRADER', 'WHOLESALER', 'RETAILER', 'PROCESSOR', 'DIRECT_CONSUMER');

-- Products
CREATE TYPE public.crop_category AS ENUM ('Vegetables', 'Fruits', 'Grains', 'Pulses', 'Oilseeds', 'Spices', 'Cash Crops');
CREATE TYPE public.crop_unit AS ENUM ('kg', 'quintal', 'ton', 'crate', 'bag');
CREATE TYPE public.quality_grade AS ENUM ('Grade A', 'Grade B', 'Standard', 'Organic');
CREATE TYPE public.product_status AS ENUM ('ACTIVE', 'DRAFT', 'PAUSED', 'SOLD_OUT', 'EXPIRED', 'CANCELLED');

-- Buyer requests
CREATE TYPE public.request_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COUNTER_OFFERED', 'EXPIRED', 'CANCELLED');

-- Orders
CREATE TYPE public.order_status AS ENUM ('PLACED', 'CONFIRMED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTED');
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'HELD_IN_ESCROW', 'RELEASED', 'REFUNDED', 'FAILED');

-- Escrow
CREATE TYPE public.escrow_transaction_type AS ENUM ('HOLD', 'RELEASE', 'REFUND', 'DISPUTE_HOLD');
CREATE TYPE public.escrow_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Logistics
CREATE TYPE public.vehicle_type AS ENUM ('MINI_TRUCK', 'LCV', 'HEAVY_TRUCK', 'COLD_STORAGE', 'TEMPO', 'OTHER');
CREATE TYPE public.logistics_status AS ENUM ('REQUESTED', 'CONFIRMED', 'PICKUP_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- Notifications
CREATE TYPE public.notification_type AS ENUM ('ORDER_UPDATE', 'BUYER_REQUEST', 'COUNTER_OFFER', 'MANDI_ALERT', 'PAYMENT', 'ESCROW', 'DISPUTE', 'SYSTEM', 'KYC');

-- Disputes
CREATE TYPE public.dispute_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- Mandi sources
CREATE TYPE public.mandi_source AS ENUM ('APMC_LIVE_FEED', 'AGMARKNET', 'MANDI_VERIFIED_AGENT');

-- Team roles (internal)
CREATE TYPE public.team_role AS ENUM ('TEAM_LEAD', 'BACKEND', 'FRONTEND', 'DATABASE', 'AI_ML', 'QA');
