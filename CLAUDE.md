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
- **Supabase** - Database & Auth (optional)
- **Midtrans/Xendit** - Payments (optional)

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Auth routes
│   ├── (main)/                 # Protected app routes
│   │   ├── admin/             # Admin portal (8 pages)
│   │   ├── advertiser/         # Advertiser portal (12 pages)
│   │   └── partner/           # Partner portal (8 pages)
│   ├── api/                    # API routes (14 endpoints)
│   ├── for-advertisers/        # Marketing pages
│   ├── for-partners/
│   ├── how-it-works/
│   ├── programs/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # 16 reusable components
│   ├── layout/               # Sidebar, Header
│   └── tracking/             # Tracking pixel
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── auth.ts               # Auth service
│   ├── api.ts                # API client
│   ├── utils.ts              # Utilities
│   └── services/
│       ├── email.ts          # Email service (Resend)
│       ├── webhook.ts        # Webhook delivery
│       └── payments.ts        # Payment integration
├── hooks/                     # Custom hooks
│   └── index.ts              # useData, usePrograms, etc.
├── stores/                   # Global state
│   └── index.ts              # UI store, App store
└── middleware.ts             # Route protection
```

## Database Schema

PostgreSQL via Supabase with 12 tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles |
| `advertisers` | Advertiser profiles |
| `partners` | Partner profiles |
| `programs` | Acquisition programs |
| `program_channels` | Channel configs |
| `conversions` | Conversion tracking |
| `payouts` | Partner payouts |
| `payment_methods` | Partner bank/ewallet |
| `media_partners` | Media inventory |
| `webhooks` | Webhook configs |
| `webhook_deliveries` | Delivery logs |
| `notifications` | User notifications |

## API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth` | GET, POST | Login, register, logout, session |
| `/api/advertisers` | GET, POST | List/create advertisers |
| `/api/partners` | GET, POST | List/create partners |
| `/api/partners/[id]` | GET, PUT, DELETE | Single partner CRUD |
| `/api/programs` | GET, POST | List/create programs |
| `/api/programs/[id]` | GET, PUT, DELETE | Single program CRUD |
| `/api/conversions` | GET, POST | List/create conversions |
| `/api/conversions/[id]` | GET, PUT | Validate/reject |
| `/api/payouts` | GET, POST | List/create payouts |
| `/api/notifications` | GET, POST | User notifications |
| `/api/analytics` | GET | Dashboard stats |
| `/api/media` | GET | Media partners catalog |
| `/api/webhooks` | GET, POST, DELETE | Webhook management |

## Services

### Email (Resend)
- Welcome emails
- Conversion notifications
- Payout confirmations
- 10+ email templates

### Webhook
- Event-driven delivery
- Retry with backoff
- Delivery logging
- Signature verification

### Payment (Midtrans/Xendit)
- Advertiser deposits
- Partner payouts
- Bank transfer, eWallets
- QRIS support

### Tracking Pixel
- Fingerprint tracking
- UTM attribution
- Multi-device detection
- Real-time conversion

## Key Types

```typescript
// User & Auth
UserRole: 'advertiser' | 'partner' | 'admin'

// Advertiser
Advertiser: { company_name, industry, total_spend }

// Partner
PartnerType: 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community'
Partner: { partner_name, partner_type, niche, audience_size, quality_score }

// Program
Objective: 'app_install' | 'registration' | 'lead_form' | 'kyc' | 'purchase' | 'review_rating'
PayoutModel: 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid'

// Conversion
Status: 'pending' | 'valid' | 'rejected' | 'fraud'
FraudSignal: 'duplicate_ip' | 'duplicate_device' | 'suspicious_velocity' | etc.
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0066FF` | Buttons, links |
| Sidebar BG | `#0a1628` | Navigation |
| Success | `#22C55E` | Valid |
| Warning | `#F59E0B` | Pending |
| Danger | `#EF4444` | Fraud |

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Payments (optional)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
XENDIT_SECRET_KEY=

# Email (optional)
RESEND_API_KEY=
```

## Development

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Adding New Components

Use Radix UI primitives:
```bash
npm install @radix-ui/react-dialog
```

Components follow `cn()` utility pattern for class merging.

## Available Scripts

Demo mode works without any env vars. Production requires Supabase setup.

## Mock Data

Located in `src/lib/mock-data.ts`:
- 10 Advertisers
- 10 Partners  
- 10 Programs
- 100+ Media Inventory
- Sample Conversions
- Sample Payouts

## Demo Users

| Email | Role | Company |
|-------|------|---------|
| sarah@tunaiku.com | Advertiser | Tunaiku |
| budi@jakselnews.com | Partner | JakselNews Media |
| admin@cuanpintar.com | Admin | CuanPintar |
