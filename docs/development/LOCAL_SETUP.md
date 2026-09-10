# AgriTech — Local Development & Setup Guide

## 1. Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js**: v20.x or v22.x LTS
- **npm**: v10.x or higher
- **Git**: v2.30+
- **Supabase CLI** (optional for local database migrations): `npx supabase`

---

## 2. Clone & Installation

```bash
git clone https://github.com/yash0xx/AgriTech.git
cd AgriTech

# Install frontend and root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

---

## 3. Environment Configuration

Copy the environment template to create your local `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Frontend (Client-Safe)
VITE_APP_TITLE="AgriTech - From Farm to Buyer"
VITE_API_BASE_URL="http://localhost:5001/api"
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend Service Configuration (Server-Side Isolated)
PORT=5001
ALLOWED_ORIGINS=http://localhost:3050,http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay Sandbox (Testing)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Administrative Team Provisioning Password (Local CI/CD Only)
DEFAULT_TEAM_PASSWORD=YourSecureTemporaryPassword
```

---

## 4. Running the Development Servers

### Start Frontend (Vite)
```bash
npm run dev
```
The frontend starts on `http://localhost:3050`.

### Start Backend (Express)
In a separate terminal:
```bash
npm start
```
The backend starts on `http://localhost:5001`.

Verify backend health:
```bash
curl http://localhost:5001/api/health
```

---

## 5. Team Provisioning Workflow

To provision or sync the 6 designated team demo accounts in your Supabase Auth instance:

```bash
npm run provision
```

This script ensures each of the 6 team members has a verified auth record, profile entry, and team roster membership.

---

## 6. Verification & Test Commands

Run the full system verification suite:

```bash
# Run master verification matrix (all 14 test suites)
npm run verify

# Run individual test suites
npm run test:security
npm run test:api
npm run test:staging

# Run TypeScript type check
npm run lint

# Run production build
npm run build
```
