# CuanPintar MVP - Customer Acquisition OS

## Overview

CuanPintar is a Customer Acquisition Operating System built with Next.js 16 that connects Indonesian advertisers with verified acquisition partners through one unified platform.

**Repository**: https://github.com/rectoversomedia/CuanPintar-MVP

## Quick Start

```bash
cd /Users/fajarpahlawan/cuanpintar-mvp
npm install
npm run dev
```

Visit http://localhost:3000

## Demo Access (No Auth Required)

| Portal | URL | Purpose |
|--------|-----|---------|
| Landing | http://localhost:3000 | Marketing site |
| Login | http://localhost:3000/login | Select role demo |
| Advertiser | http://localhost:3000/advertiser | Program & partner management |
| Partner | http://localhost:3000/partner | Discover programs, track earnings |
| Admin | http://localhost:3000/admin | Platform oversight |

## Tech Stack

- **Next.js 16** (App Router) - React 19
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons
- **Recharts** - Charts & visualizations

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/login/       # Demo auth (no real auth)
│   ├── (main)/             # Protected app routes
│   │   ├── admin/          # Admin portal (8 pages)
│   │   ├── advertiser/     # Advertiser portal (12 pages)
│   │   └── partner/        # Partner portal (8 pages)
│   ├── api/                # API routes (5 endpoints)
│   ├── for-advertisers/    # Marketing page
│   ├── for-partners/       # Marketing page
│   ├── how-it-works/       # Marketing page
│   ├── programs/           # Marketplace page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                 # 15 reusable components
│   │   ├── button.tsx, input.tsx, badge.tsx
│   │   ├── card.tsx, table.tsx, dialog.tsx
│   │   ├── tabs.tsx, select.tsx, switch.tsx
│   │   ├── accordion.tsx, avatar.tsx, checkbox.tsx
│   │   ├── dropdown-menu.tsx, label.tsx, progress.tsx
│   ├── layout/             # Sidebar, Header
│   ├── advertiser/         # Dashboard, stats, charts
│   ├── admin/              # Dashboard, tables
│   └── partner/           # Dashboard, program cards
├── lib/
│   ├── mock-data.ts        # 10 advertisers, 10 partners, 10 programs, conversions
│   ├── utils.ts            # cn() helper, formatters
│   └── auth.ts            # Demo auth context
└── types/
    └── index.ts            # 30+ TypeScript interfaces
```

## Key Types

```typescript
// User & Auth
UserRole: 'advertiser' | 'partner' | 'admin'
User: { id, name, email, role, company_name }

// Advertiser
Advertiser: { company_name, industry, total_spend, active_programs }

// Partner
PartnerType: 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community' | 'agency'
Partner: { partner_name, partner_type, niche, audience_size, quality_score, fraud_risk }

// Program
ProgramObjective: 'app_install' | 'registration' | 'lead_form' | 'kyc' | 'purchase' | 'review_rating' | 'event_attendance' | 'survey_completion'
PayoutModel: 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid'
Program: { name, objectives, budget, payout_model, channels, status }

// Conversion
ConversionStatus: 'pending' | 'valid' | 'rejected' | 'fraud'
FraudSignal: 'duplicate_ip' | 'duplicate_device' | 'suspicious_velocity' | etc.

// Analytics
ProgramStats: { total_conversions, valid_conversions, average_cpa, quality_score }
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0066FF` | Buttons, links, accent |
| Sidebar BG | `#0a1628` | Navigation background |
| Content BG | `#FFFFFF` | Main content area |
| Success | `#22C55E` | Valid conversions |
| Warning | `#F59E0B` | Pending items |
| Danger | `#EF4444` | Fraud, rejected |

## Mock Data

Located in `src/lib/mock-data.ts`:

- **10 Advertisers**: Tunaiku, Prudential, XL Axiata, Pegadaian, AstraPay, Bank Saqu, TMRW, IKEA, Pizza Hut, Yamaha
- **10 Partners**: JakselNews Media, Finance Creator Jakarta, Local Media Bandung, Parenting Community, Campus Sales, Affiliate Finance, Mission User Network, Automotive Creator, Muslim Family Media, Lifestyle Creator
- **10 Programs**: Various objectives (app_install, registration, lead_form, purchase, review_rating)
- **100+ Media Inventory**: Generated programmatically
- **10 Conversions**: Sample conversion records with fraud signals
- **5 Payouts**: Sample payout records

## Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Adding New Components

Use Radix UI primitives wrapped with Tailwind CSS:

```bash
# Example: Adding a dialog
npm install @radix-ui/react-dialog
```

Components follow shadcn/ui patterns with `cn()` utility for class merging.

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/programs` | GET/POST | List/create programs |
| `/api/conversions` | GET/POST | List/create conversions |
| `/api/partners` | GET | List partners |
| `/api/payouts` | GET | List payouts |
| `/api/webhooks` | POST | External integrations |
| `/api/track/[type]` | GET | Tracking pixel |

## Environment Variables (Future)

```env
# Database
DATABASE_URL=

# Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Payments
MIDTRANS_SERVER_KEY=
XENDIT_API_KEY=

# Analytics
POSTHOG_API_KEY=
```

## Development Notes

1. **No Real Auth**: Login page is demo-only, no session management
2. **Mock Data**: All data is static JSON, no database required
3. **Single Tenant**: All demo data is hardcoded for MVP
4. **Mobile Responsive**: All pages are responsive (Tailwind)

## Roadmap

- [ ] Supabase authentication
- [ ] PostgreSQL database
- [ ] Real conversion tracking
- [ ] Payment integration (Midtrans/Xendit)
- [ ] Email notifications
- [ ] Multi-tenant support
- [ ] Mobile app (React Native)
