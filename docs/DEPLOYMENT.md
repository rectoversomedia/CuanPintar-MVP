# Deployment Guide

## Prerequisites

1. Node.js 18+
2. Supabase account
3. GitHub account

## 1. Clone and Install

```bash
git clone https://github.com/rectoversomedia/CuanPintar-MVP.git
cd CuanPintar-MVP
npm install
```

## 2. Set Up Supabase

### Create a new Supabase project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <project-ref>

# Push migrations
supabase db push
```

### Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create bucket `uploads` (public)
3. Create bucket `images` (public)

## 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth Secrets (generate strong random strings)
JWT_SECRET=your-very-long-random-string-at-least-32-chars
CSRF_SECRET=your-csrf-secret-different-from-jwt

# Payment Providers (optional for development)
MIDTRANS_SERVER_KEY=your-midtrans-server-key
XENDIT_API_KEY=your-xendit-api-key
XENDIT_CALLBACK_TOKEN=your-xendit-callback-token

# Webhooks
S2S_WEBHOOK_SECRET=your-s2s-secret
WEBHOOK_SECRET=your-outgoing-webhook-secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 4. Generate Secrets

```bash
# Generate JWT_SECRET (at least 32 characters)
openssl rand -base64 32

# Generate CSRF_SECRET
openssl rand -base64 32
```

## 5. Build and Test

```bash
# Type check
npm run typecheck

# Run tests
npm test

# Build
npm run build

# Start dev server
npm run dev
```

## 6. Deploy to Vercel (Recommended)

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: GitHub Integration

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project from GitHub
4. Configure environment variables
5. Deploy

### Vercel Environment Variables

Add in Vercel dashboard:
- All variables from `.env.local`
- `NODE_ENV=production`

## 7. Configure Domain

1. Add custom domain in Vercel
2. Update `NEXT_PUBLIC_APP_URL`
3. Update Supabase allowed origins

## 8. Post-Deployment Checks

### Supabase Dashboard

- [ ] Migrations applied
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] API rate limits configured

### Application

- [ ] Login works
- [ ] Demo mode disabled
- [ ] Email sending configured
- [ ] Webhook endpoints accessible

### Monitoring

- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel Analytics)
- [ ] Uptime monitoring

## Production Checklist

### Security
- [ ] All secrets set (no fallbacks)
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] RLS policies tested

### Performance
- [ ] Image optimization enabled
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Database indexes created

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime checks configured
- [ ] Log aggregation set up

### Backup
- [ ] Database backups enabled
- [ ] Backup schedule verified
- [ ] Recovery tested

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules
npm install
npm run build
```

### Database Connection

Check:
1. Environment variables correct
2. Supabase project is running
3. IP whitelist (if any)

### Auth Issues

1. Check JWT_SECRET matches in all places
2. Verify Supabase anon key
3. Check cookie settings

### Rate Limiting Not Working

Ensure Upstash Redis is configured:
```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Support

For issues, check:
1. Vercel deployment logs
2. Supabase logs
3. Application logs
