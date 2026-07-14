# CuanPintar MVP - Technical Documentation

## Overview

CuanPintar is a Customer Acquisition Operating System (CAOS) for the Indonesian market, built with Next.js 15, Supabase, and TypeScript.

## Architecture

### Tech Stack

| Layer | Technology |
|------|------------|
| Framework | Next.js 15.1.0 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Radix UI, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Custom JWT |
| Cache | Upstash Redis |
| Email | Resend |

### Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (main)/           # Protected dashboard pages
│   │   ├── admin/        # Admin dashboard
│   │   ├── advertiser/   # Advertiser dashboard
│   │   └── partner/       # Partner dashboard
│   ├── api/              # API routes
│   └── r/[code]/         # Short URL redirects
├── components/
│   ├── ui/               # Radix UI components
│   ├── layout/            # Layout components
│   └── features/          # Feature components
├── lib/
│   ├── auth/             # Authentication
│   ├── security/         # Security utilities
│   ├── tracking/         # Tracking & fraud detection
│   ├── analytics/        # Analytics & ML
│   ├── services/         # External services
│   └── validation/       # Zod schemas
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

## Features

### 1. Multi-Tenant System

Three user roles with different dashboards:
- **Admin**: Platform management, fraud review, payouts
- **Advertiser**: Campaign management, analytics
- **Partner**: Program discovery, link management, earnings

### 2. Tracking System

#### Click Tracking
```typescript
POST /api/track/click
{
  program_id: string
  partner_id: string
  fingerprint: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
```

#### Conversion Tracking
```typescript
POST /api/track/conversion
{
  program_id: string
  partner_id: string
  conversion_type: 'signup' | 'purchase' | 'lead'
  fingerprint?: string
  email?: string
  amount?: number
}
```

### 3. Fraud Detection

Multiple detection layers:
- IP blocklist checking
- Device fingerprint analysis
- Velocity detection (clicks/hour)
- Email domain validation
- Geo-location anomaly detection
- Behavioral pattern analysis (rule-based heuristics)

### 4. Attribution Models

Supported models:
- First-click
- Last-click
- Linear
- Time-decay
- Position-based

## API Reference

### Authentication

All protected endpoints require authentication via:
- Bearer token in Authorization header
- Session cookie

### API Response Format

```typescript
// Success
{
  success: true
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error
{
  success: false
  error: string
  message?: string
}
```

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/* | 5 | 15 min |
| /api/track/click | 200 | 1 min |
| /api/track/conversion | 50 | 1 min |
| /api/* (general) | 100 | 1 min |

## Database Schema

### Core Tables

- `users` - User accounts
- `advertisers` - Advertiser profiles
- `partners` - Partner profiles
- `programs` - Campaign programs
- `conversions` - Conversion events
- `tracking_links` - Tracking URLs
- `payouts` - Partner payouts

### Security Tables

- `fraud_blocklist` - Blocked IPs/emails/devices
- `fraud_scores` - Per-conversion fraud evaluation
- `user_behavior_profiles` - Behavioral patterns
- `anomaly_logs` - Detected anomalies

### Analytics Tables

- `clicks` - Click events
- `link_daily_stats` - Aggregated stats
- `attribution_touchpoints` - Multi-touch data

## Security

### Implemented

- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (Redis-based)
- ✅ CSRF protection
- ✅ Input validation (Zod)
- ✅ Fraud detection (20+ signals)
- ✅ Geo-location anomaly detection
- ✅ ML-based behavioral analysis (rule-based heuristics)
- ✅ Webhook signature verification

### Required Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
JWT_SECRET=
CSRF_SECRET=

# Payment Providers
MIDTRANS_SERVER_KEY=
XENDIT_API_KEY=
XENDIT_CALLBACK_TOKEN=

# Webhooks
S2S_WEBHOOK_SECRET=
WEBHOOK_SECRET=
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Deployment

1. Set up Supabase project
2. Run migrations: `supabase db push`
3. Set environment variables
4. Deploy to Vercel/Netlify

```bash
npm run build
npm start
```

## License

Private - All rights reserved
