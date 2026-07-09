# CuanPintar - Customer Acquisition OS for Indonesia

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

**Create Once. Distribute Everywhere.**

CuanPintar is a Customer Acquisition Operating System that connects advertisers with verified acquisition partners through one unified platform. Build one acquisition program and distribute it across 100+ verified media partners, creators, affiliates, sales teams, and communities across Indonesia.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **100+ Media Partners** | Access Indonesia's largest media distribution network including national news, finance, lifestyle, and niche verticals |
| **Multi-Channel Distribution** | Distribute programs to creators, affiliates, sales teams, communities, and mission networks |
| **Partner Marketplace** | Partners discover and join programs that match their audience and niche |
| **Real-Time Tracking** | Monitor conversions with detailed analytics and attribution |
| **Fraud Detection** | AI-powered protection for your ad spend with quality scoring |
| **Transparent Payouts** | Clear commission structures and automated partner payouts |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rectoversomedia/CuanPintar-MVP.git
cd CuanPintar-MVP

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Demo Access

Navigate to `/login` and select a demo role:

| Role | URL | Description |
|------|-----|-------------|
| **Advertiser** | `/advertiser` | Create and manage acquisition programs |
| **Partner** | `/partner` | Discover programs and earn commissions |
| **Admin** | `/admin` | Manage platform operations |

## 🏗️ Architecture

```
src/
├── app/
│   ├── (auth)/login/              # Authentication pages
│   ├── (main)/                    # Protected application routes
│   │   ├── admin/                 # Admin portal
│   │   │   ├── advertisers/       # Advertiser management
│   │   │   ├── partners/          # Partner management
│   │   │   ├── programs/          # Program management
│   │   │   ├── media-network/     # Media inventory
│   │   │   ├── conversions/       # Conversion validation
│   │   │   ├── fraud/             # Fraud review queue
│   │   │   └── payouts/           # Payout management
│   │   ├── advertiser/            # Advertiser portal
│   │   │   ├── programs/          # Program CRUD
│   │   │   ├── partners/          # Partner discovery
│   │   │   ├── analytics/         # Analytics dashboard
│   │   │   ├── billing/           # Billing & invoices
│   │   │   └── settings/          # Account settings
│   │   └── partner/              # Partner portal
│   │       ├── programs/          # Joined programs
│   │       ├── earnings/          # Earnings tracking
│   │       ├── payouts/           # Payout history
│   │       └── profile/           # Partner profile
│   ├── api/                       # API routes
│   │   ├── programs/              # Program CRUD
│   │   ├── conversions/           # Conversion tracking
│   │   ├── partners/              # Partner management
│   │   ├── webhooks/              # External integrations
│   │   └── payouts/              # Payout processing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # Radix UI primitives
│   ├── layout/                    # Sidebar, Header
│   ├── advertiser/                # Advertiser-specific components
│   ├── admin/                     # Admin-specific components
│   └── partner/                   # Partner-specific components
├── lib/
│   ├── mock-data.ts               # Demo data
│   ├── utils.ts                   # Utility functions
│   └── auth.ts                    # Authentication helpers
└── types/
    └── index.ts                   # TypeScript definitions
```

## 🎯 Key Concepts

| Concept | Description |
|---------|-------------|
| **Program** | The core product unit for acquisition campaigns (similar to "campaign" but more descriptive) |
| **Partner Types** | Media, Creator, Affiliate, Sales, Mission, Community - different channels for distribution |
| **Conversion** | A tracked user action: app install, registration, lead form, purchase, etc. |
| **Quality Score** | 0-100% metric indicating partner/program quality based on conversion validation |
| **Fraud Risk** | Low/Medium/High indicator for suspicious activity detection |

## 💻 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI primitives |
| Icons | Lucide React |
| Charts | Recharts |
| State | React Hooks + Context |

## 🎨 Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#0066FF` | Accent, buttons, links |
| Sidebar | `#0a1628` | Navigation background |
| Background | `#FFFFFF` | Content area |
| Success | `#22C55E` | Valid conversions |
| Warning | `#F59E0B` | Pending items |
| Danger | `#EF4444` | Fraud, rejected |

### Typography

- **Font**: System font stack (Tailwind default)
- **Headings**: Bold, varying sizes
- **Body**: Regular weight, 14-16px

## 📊 Sample Data

The MVP includes realistic demo data:

**Advertisers (10)**
Tunaiku, Prudential, XL Axiata, Pegadaian, AstraPay, Bank Saqu, TMRW by UOB, IKEA Indonesia, Pizza Hut Indonesia, Yamaha Indonesia

**Partners (150+)**
- Media Networks: 100+ partners including Kompas, Tempo, Detik News, CNN Indonesia
- Creators: 500+ finance, lifestyle, and automotive content creators
- Affiliates: 200+ product and service affiliates
- Sales Teams: 50+ campus and community sales networks
- Communities: 150+ parenting, professional, and interest groups

**Programs (10)**
Various campaign types: App Install + Registration, Lead Forms, Purchases, Reviews & Ratings, Event Attendance

## 🔜 Next Steps

- [ ] Add Supabase/Auth0 authentication
- [ ] Implement PostgreSQL database integration
- [ ] Build conversion tracking pixel (JavaScript)
- [ ] Add WebSocket real-time updates
- [ ] Implement payout automation (Midtrans, Xendit)
- [ ] Build mobile app (React Native)
- [ ] Add email/SMS notifications
- [ ] Implement multi-tenant architecture

## 📄 License

Proprietary - All rights reserved by Recto Vero Media

## 👥 Contributing

This is a proprietary project. Please contact the maintainers for collaboration opportunities.

## 📞 Contact

- **Company**: Recto Vero Media
- **GitHub**: [rectoversomedia](https://github.com/rectoversomedia)
