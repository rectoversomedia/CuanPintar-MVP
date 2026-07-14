# CuanPintar MVP - Deployment Guide

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/rectoversomedia/CuanPintar-MVP.git
cd CuanPintar-MVP

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run database migrations (see Database Setup section)

# 5. Start development
npm run dev
```

Visit http://localhost:3000

---

## Demo Accounts

All demo accounts use password: `demo123`

| Role | Email | Company |
|------|-------|---------|
| Admin | admin@cuanpintar.com | CuanPintar |
| Advertiser | sarah@tunaiku.com | Tunaiku |
| Partner | media@kompas.com | Kompas Media |

---

## Database Setup (Supabase)

### Option 1: SQL Editor (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run the migrations in order:

```sql
-- First, run the consolidated schema
-- Copy contents from: supabase/migrations/00_consolidated_schema.sql

-- Then, run the seed data
-- Copy contents from: supabase/migrations/00_seed_data.sql
```

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref vediyxsldxfptctwnnqh

# Push migrations
supabase db push
```

### Option 3: Automatic Setup Script

```bash
# Run the setup wizard
chmod +x setup.sh
./setup.sh
```

---

## Environment Variables

Create `.env.local` with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://vediyxsldxfptctwnnqh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Optional: Payments
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

Get Supabase keys from:
https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/settings/api

---

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Using Vercel CLI
npm i -g vercel
vercel
```

### Docker

```bash
# Build image
docker build -t cuanpintar-mvp .

# Run container
docker run -p 3000:3000 --env-file .env.local cuanpintar-mvp
```

### Docker Compose (with Supabase)

```bash
docker-compose up -d
```

---

## Database Schema Overview

### Core Tables
- `users` - User accounts with roles (admin/advertiser/partner)
- `advertisers` - Advertiser profiles
- `partners` - Partner profiles with quality scores
- `programs` - Acquisition programs
- `program_channels` - Program channel configurations
- `conversions` - Tracked conversions
- `payouts` - Partner payout records

### Tracking Tables
- `clicks` - Click tracking
- `attribution_touchpoints` - Multi-touch attribution
- `device_graph` - Cross-device matching
- `api_keys` - S2S tracking API keys
- `fraud_rules` - Configurable fraud rules
- `fraud_blocklist` - Blocklisted IPs/devices

### Admin Tables
- `support_tickets` - Support ticket system
- `kyc_documents` - Identity verification
- `audit_logs` - Immutable audit trail
- `announcements` - Platform announcements

---

## API Endpoints

### Authentication
- `POST /api/auth` - Login, register, logout
- `GET /api/auth` - Get current user

### Resources
- `GET/POST /api/programs` - List/create programs
- `GET/PATCH/DELETE /api/programs/[id]` - Program CRUD
- `GET/POST /api/conversions` - List/track conversions
- `GET/POST /api/partners` - List partners
- `GET/POST /api/payouts` - Payout management

### Analytics
- `GET /api/analytics` - Dashboard stats
- `GET /api/analytics/cohort` - Cohort analysis
- `GET /api/analytics/ltv` - Lifetime value

### Admin
- `GET /api/admin/audit` - Audit logs
- `GET /api/admin/kyc` - KYC management
- `GET /api/admin/tickets` - Support tickets

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npx playwright test
```

---

## Troubleshooting

### "Database not configured"
- Make sure `.env.local` exists with Supabase credentials
- Check that Supabase project is accessible

### "Invalid credentials" with demo accounts
- Use password: `demo123`
- Make sure seed data was run

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 15 + React 19 + TypeScript + Tailwind CSS 4       │
│  - Radix UI primitives                                       │
│  - Framer Motion animations                                  │
│  - Recharts for charts                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                      BACKEND                                 │
│  Next.js API Routes (Serverless)                            │
│  - Auth middleware (JWT/CSRF/Rate limiting)                 │
│  - Fraud detection engine                                    │
│  - Attribution tracking                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ PostgreSQL Client
┌─────────────────────▼───────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                     │
│  - Real-time subscriptions                                   │
│  - Row Level Security                                       │
│  - Auth                                                     │
│  - Storage                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Support

- GitHub Issues: https://github.com/rectoversomedia/CuanPintar-MVP/issues
- Documentation: https://github.com/rectoversomedia/CuanPintar-MVP#readme

---

## License

Proprietary - Recto Vero Media
