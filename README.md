# CuanPintar - Customer Acquisition OS for Indonesia

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

**Create Once. Distribute Everywhere.**

CuanPintar is a Customer Acquisition Operating System that connects advertisers with verified acquisition partners through one unified platform. Build one acquisition program and distribute it across 100+ verified media partners, creators, affiliates, sales teams, and communities across Indonesia.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **100+ Media Partners** | Access Indonesia's largest media distribution network |
| **Multi-Channel Distribution** | Distribute to creators, affiliates, sales teams, communities |
| **Partner Marketplace** | Partners discover programs matching their audience |
| **Real-Time Tracking** | Conversion tracking with detailed analytics |
| **Fraud Detection** | Rule-based fraud detection with 20+ signals and quality scoring |
| **Automated Payouts** | Multiple payment methods (Bank Transfer, eWallets) |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (optional, demo mode available)

### Installation

```bash
# Clone the repository
git clone https://github.com/rectoversomedia/CuanPintar-MVP.git
cd CuanPintar-MVP

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo Mode

The app works out-of-the-box with demo mode (mock data). No Supabase setup required!

Navigate to `/login` and select a demo role:

| Role | URL | Description |
|------|-----|-------------|
| **Advertiser** | `/advertiser` | Create and manage acquisition programs |
| **Partner** | `/partner` | Discover programs and earn commissions |
| **Admin** | `/admin` | Manage platform operations |

## 🏗️ Architecture

### Frontend (Next.js 15)
```
src/
├── app/                      # App Router pages
│   ├── (auth)/login/         # Authentication
│   ├── (main)/               # Protected routes
│   │   ├── advertiser/       # Advertiser portal (12 pages)
│   │   ├── partner/           # Partner portal (8 pages)
│   │   └── admin/             # Admin portal (8 pages)
│   └── api/                   # API routes
├── components/
│   ├── ui/                   # Radix UI primitives (16 components)
│   ├── layout/               # Sidebar, Header
│   └── features/             # Feature components
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── auth.ts               # Auth service
│   ├── api.ts                # API client
│   └── services/             # Business services
├── hooks/                    # Custom React hooks
└── stores/                   # Global state management
```

### Backend (Next.js API Routes)
```
/api/
├── auth/                     # Authentication
│   └── route.ts              # Login, register, logout, session
├── advertisers/              # Advertiser management
│   └── route.ts
├── partners/                # Partner management
│   ├── route.ts
│   └── [id]/route.ts
├── programs/                # Program management
│   ├── route.ts
│   └── [id]/route.ts
├── conversions/             # Conversion tracking
│   ├── route.ts
│   └── [id]/route.ts
├── payouts/                # Payout processing
│   └── route.ts
├── notifications/           # User notifications
│   └── route.ts
├── analytics/              # Dashboard statistics
│   └── route.ts
├── media/                  # Media partners catalog
│   └── route.ts
├── webhooks/               # Webhook delivery
│   └── route.ts
└── track/                  # Tracking pixel
    └── [type]/route.ts
```

### Database (PostgreSQL via Supabase)

**Tables:**
| Table | Description |
|-------|-------------|
| `users` | User accounts with roles |
| `advertisers` | Advertiser profiles |
| `partners` | Partner profiles with quality scores |
| `programs` | Acquisition programs |
| `program_channels` | Program channel configurations |
| `conversions` | Tracked conversions |
| `payouts` | Partner payout records |
| `payment_methods` | Partner payment details |
| `media_partners` | Media inventory |
| `webhooks` | Webhook configurations |
| `webhook_deliveries` | Delivery logs |
| `notifications` | User notifications |

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Radix UI primitives |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Payments** | Midtrans, Xendit |
| **Email** | Resend |
| **Hosting** | Vercel |

## 📊 Key Concepts

| Concept | Description |
|---------|-------------|
| **Program** | Core product unit for acquisition campaigns |
| **Partner Types** | Media, Creator, Affiliate, Sales, Mission, Community |
| **Conversion** | Tracked user action (install, registration, purchase) |
| **Quality Score** | 0-100% metric for partner/program quality |
| **Fraud Risk** | Low/Medium/High indicator |

## 🎨 Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#6366F1` | Buttons, links, accent (Indigo) |
| Secondary | `#8B5CF6` | Gradients, highlights (Purple) |
| Accent | `#F43F5E` | Call-to-action (Rose) |
| Sidebar | `#0F172A` | Navigation background (Dark Slate) |
| Success | `#10B981` | Valid conversions (Green) |
| Warning | `#F59E0B` | Pending items (Amber) |
| Danger | `#EF4444` | Fraud, rejected (Red) |

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Payments (optional)
MIDTRANS_SERVER_KEY=xxx
MIDTRANS_CLIENT_KEY=xxx

# Email (optional)
RESEND_API_KEY=xxx
```

## 📱 Services

### Webhook Service
Automatic notifications for:
- Conversion events (created, validated, rejected, fraud)
- Payout events (created, approved, paid, failed)
- Partner events (registered, approved, suspended)
- Program events (created, activated, paused, completed)

### Email Service
Transactional emails:
- Welcome emails (advertiser/partner)
- Conversion notifications
- Payout confirmations
- Program updates

### Payment Service
- Midtrans integration (advertiser deposits)
- Xendit integration (partner payouts)
- Multiple payment methods (Bank Transfer, GoPay, OVO, DANA, LinkAja)

### Tracking Pixel
JavaScript library for conversion tracking:
```html
<script src="/js/pixel.js" data-program="prog_123"></script>
```

Features:
- Fingerprint-based attribution
- UTM parameter tracking
- Multi-device detection
- Real-time conversion recording

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

### Database Setup

1. Create Supabase project
2. Run migrations:
   ```bash
   # Using Supabase CLI
   supabase db push
   ```
3. Configure `.env.local` with Supabase credentials

## 📋 Sample Data

The app includes demo data for:
- 10 Advertisers (Tunaiku, Prudential, XL Axiata, etc.)
- 10 Partners (Media networks, creators, affiliates)
- 10 Programs (Various campaign types)
- 100+ Media Partners (Generated)
- Sample conversions and payouts

## 🔜 Roadmap

- [ ] Multi-tenant architecture
- [ ] Mobile app (React Native)
- [ ] Advanced fraud detection with ML (future)
- [ ] A/B testing for programs
- [ ] API keys for partners
- [ ] White-label solutions

## 📄 License

Proprietary - All rights reserved by Recto Vero Media

## 👥 Contact

- **Company**: Recto Vero Media
- **GitHub**: [rectoversomedia](https://github.com/rectoversomedia)
- **Website**: https://cuanpintar.com
