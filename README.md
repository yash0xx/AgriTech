# 🌱 AgriTech — From Farm to Buyer

> **Directly, Digitally, Transparently.**  
> A direct-to-buyer agricultural marketplace connecting Indian farmers, wholesale buyers, and mandis with real-time APMC market intelligence, farm-gate logistics booking, and digital escrow payment safety.

---

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0D6C45.svg)](LICENSE)

---

## 📌 Overview

**AgriTech** eliminates intermediary commissions and unfair weighbridge cuts by creating a direct bridge between agricultural producers and commercial food buyers (supermarkets, food processors, wholesalers, and institutional buyers). 

The platform combines **real-time APMC price benchmarks**, **direct crop batch listings**, **doorstep freight calculation**, and **milestone-based digital escrow** to guarantee transparent pricing for farmers and secure supply lines for buyers.

> ℹ️ **Project Stage:** This repository contains the complete, interactive **Frontend Web Application (UI/UX & Client Logic)**. Backend microservices, authentication providers, and database schemas are scheduled for backend integration.

---

## ✨ Key Features & Portals

### 1. 🌾 Public Marketplace
- **Direct Crop Listings**: High-resolution imagery, harvest dates, shelf-life indicators, quality grades (Grade A / B / Organic), and quantity availability.
- **Dynamic Search & Filters**: Search by crop name, category (Vegetables, Fruits, Grains, Pulses, Spices, Oilseeds), district (Nashik, Pune, Ahmednagar, Satara), and price ranges.
- **Direct Offers & Orders**: Instant buy with escrow deposit or submit custom price offers with counter-negotiation support.

### 2. 📈 Live Mandi Price Intelligence
- **APMC Market Feeds**: Daily benchmark rates across Maharashtra wholesale mandis (Nashik, Pune, Vashi, Lasalgaon, etc.).
- **Price Trend Visuals**: 7-day and 30-day moving averages, arrival quantities in quintals, percentage changes, and price spread analysis.
- **AI Market Insights**: Proactive alerts on seasonal harvest windows, procurement recommendations, and market surge trends.

### 3. 🚚 Farm-Gate AgriLogistics Estimator
- **Instant Freight Calculator**: Route distance and weight-based fare estimator across vehicle tiers (Mini Trucks 1-2T, LCVs 2-4T, Multi-Axle 5-10T, Cold Storage).
- **Transport Booking**: Farm doorstep pickup scheduling with verified drivers and GPS-tracked transit.

### 4. 👨‍🌾 Farmer / Seller Portal
- **Crop Publishing Flow**: Intuitive multi-step listing creator with live APMC benchmark comparison.
- **Listing Management**: Real-time stock status control (Active, Paused, Draft, Sold Out).
- **Offer Negotiation**: Accept, decline, or send counter-offers to wholesale buyer requests.
- **Order Payout Tracker**: Track dispatch milestones and escrow funds release directly to farmer accounts.

### 5. 🛒 Commercial Buyer Portal
- **Procurement Dashboard**: View active dispatches, weighbridge receipts, and quality inspection confirmations.
- **Delivery Confirmation**: Release held escrow payments to farmers upon QC delivery approval.
- **Direct Order History**: Searchable order ledger with invoice references and status timelines.

### 6. 🛡️ Admin Command & Surveillance Console
- **KYC Verification Queue**: Audit Aadhaar details, 7/12 land records, and GSTIN documentation.
- **Escrow Settlement Ledger**: Monitor locked funds, settlement triggers, and dispute flags.
- **Platform Analytics**: Gross Merchandise Value (GMV), active farm-gate batches, and APMC connection health.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Dev Server** | [Vite 6](https://vitejs.dev/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism & Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Typography** | [Public Sans](https://fonts.google.com/specimen/Public+Sans) (Google Fonts) |
| **Animation & Micro-interactions** | CSS3 Transitions, Keyframes, Custom Card-Shadows |

---

## 📂 Project Structure

```
agritech/
├── public/                    # Static public assets
├── src/
│   ├── components/
│   │   ├── brand/             # SVG Logo & brand marks (Desktop, Mobile, Badge)
│   │   └── common/            # Shared UI components
│   │       ├── AIInsightCard.tsx      # AI crop & market recommendations
│   │       ├── AuthModals.tsx         # Multi-role authentication modals
│   │       ├── Footer.tsx             # Global responsive footer
│   │       ├── Header.tsx             # Navbar with role switcher & search
│   │       ├── MobileBottomNav.tsx    # Mobile navigation bar
│   │       ├── NotificationDrawer.tsx # Notification center
│   │       └── Toast.tsx              # Toast alerts & notification toasts
│   ├── data/
│   │   └── mockData.ts        # Comprehensive mock data for crops, mandis, orders, users
│   ├── views/
│   │   ├── admin/             # Operations & KYC dashboard
│   │   ├── buyer/             # Buyer procurement & order tracking views
│   │   ├── farmer/            # Crop management, listing creator, order views
│   │   └── public/            # Landing page, Marketplace, Mandi Rates, Logistics, About
│   ├── App.tsx                # Main view router & central state manager
│   ├── index.css              # Global design tokens, scrollbars, glassmorphism styles
│   ├── main.tsx               # React DOM root mounting
│   └── types.ts               # TypeScript data models and interfaces
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML5 template with SEO & font preconnects
├── package.json               # Project manifest & scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite configuration with Tailwind CSS v4 plugin
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yash0xx/AgriTech.git
   cd AgriTech
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

6. **Type Checking & Lint:**
   ```bash
   npm run lint
   ```

---

## 🗺️ Next Steps & Backend Integration

- [ ] **Backend Services**: Connect REST/GraphQL API endpoints for live crop inventory and mandi scrapers.
- [ ] **Authentication**: Integrate JWT / OAuth2 authentication with Aadhaar & Mobile OTP verification.
- [ ] **Payment & Escrow Gateway**: Integrate UPI / NetBanking payment gateway with automated escrow webhooks.
- [ ] **Real-time Notifications**: WebSockets / SMS notifications for farmer-buyer offer updates.
- [ ] **Multilingual Support**: Marathi, Hindi, and regional language localization.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
