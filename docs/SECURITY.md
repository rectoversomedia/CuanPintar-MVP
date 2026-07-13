# Security Guide

## Overview

CuanPintar implements multiple layers of security for protecting user data and preventing fraud.

## Authentication & Authorization

### JWT Tokens

- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry
- Token rotation enabled

### Role-Based Access Control (RBAC)

| Role | Access |
|------|--------|
| Admin | All resources |
| Advertiser | Own programs, conversions, analytics |
| Partner | Own links, conversions, payouts |

## API Security

### Authentication Flow

```
Client → Bearer Token → API Route → Validate → Process
                ↓
         Rate Limiter → 429 if exceeded
                ↓
         CSRF Check → 403 if failed
                ↓
         Auth Middleware → 401 if invalid
```

### Required Headers

For mutating requests:
```
Authorization: Bearer <token>
x-csrf-token: <csrf-token>
Content-Type: application/json
```

## Rate Limiting

### Tiers

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| auth | 5 req | 15 min | Login, register |
| strict | 10 req | 1 min | Password change |
| normal | 100 req | 1 min | General API |
| lenient | 300 req | 1 min | Read operations |
| track | 1000 req | 1 min | Tracking |
| webhook | 500 req | 1 min | Webhooks |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1704067200
Retry-After: 60 (on 429)
```

## Fraud Detection

### Detection Signals

1. **IP-based**
   - Blocklist checking
   - VPN/Proxy detection
   - Datacenter IP flagging
   - Velocity limits

2. **Device-based**
   - Fingerprint analysis
   - Device ID tracking
   - Emulator detection
   - Headless browser detection

3. **Email-based**
   - Disposable email detection
   - Domain blocklist
   - Format validation

4. **Behavioral**
   - Click velocity
   - Conversion velocity
   - Session patterns
   - Time anomalies

### Thresholds

| Signal | Threshold | Action |
|--------|-----------|--------|
| IP conversions/hour | 3 | Flag |
| Device conversions/hour | 2 | Flag |
| Fingerprint conversions/hour | 5 | Flag |
| Partner velocity/hour | 20 | Flag |
| Fraud score ≥ 60 | - | Reject |
| Fraud score ≥ 80 | - | Block |

## Geo-Location

### Detection

- IP geolocation (ip-api.com)
- VPN/Proxy identification
- Tor exit node detection
- Datacenter IP flagging

### Anomaly Types

- Country mismatch
- Timezone inconsistency
- ISP change
- Geographically improbable

## Webhook Security

### Midtrans

Signature: `sha512(order_id + status_code + gross_amount + server_key)`

### Xendit

Callback token verification

### Custom Webhooks

HMAC-SHA256 with timestamp (replay protection)

## Data Protection

### In Transit
- HTTPS enforced
- TLS 1.2+

### At Rest
- Supabase encryption
- Service role key protection

### Row Level Security (RLS)

All tables have RLS enabled:
- Users see own data
- Partners see own data
- Admins see all (with restrictions)

## Security Checklist

### Development
- [ ] Use demo mode
- [ ] No production keys
- [ ] Local testing

### Staging
- [ ] Test credentials
- [ ] Partial data
- [ ] Webhook testing

### Production
- [ ] All secrets configured
- [ ] Fail in production mode
- [ ] Monitoring active
- [ ] Backup configured
