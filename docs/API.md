# API Documentation

## Authentication

All protected API endpoints require authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable message"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

---

## Auth API

### POST /api/auth

Authentication endpoint supporting multiple actions.

**Actions:**
- `login` - User login
- `register` - User registration
- `logout` - User logout
- `reset-password-request` - Request password reset
- `reset-password-confirm` - Confirm password reset
- `refresh` - Refresh session

**Login Request:**
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "partner",
      "name": "John Doe"
    },
    "session": {
      "access_token": "...",
      "refresh_token": "..."
    }
  }
}
```

---

## Programs API

### GET /api/programs

List programs (advertisers see own, admins see all).

**Query Parameters:**
- `status` - Filter by status (draft, active, paused, ended)
- `industry` - Filter by industry
- `search` - Search by name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Tunaiku Loan Program",
      "brand_name": "Tunaiku",
      "industry": "Finance",
      "budget": 50000000,
      "payout_model": "cpa",
      "partner_payout": 75000,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/programs

Create a new program (advertisers/admins only).

**Request:**
```json
{
  "name": "New Program",
  "brand_name": "Brand Name",
  "industry": "Finance",
  "description": "Program description...",
  "budget": 10000000,
  "payout_model": "cpa",
  "partner_payout": 50000,
  "channels": ["social_media", "content"],
  "start_date": "2024-01-15T00:00:00Z",
  "end_date": "2024-06-15T00:00:00Z"
}
```

---

## Partners API

### GET /api/partners

List partners (admins only).

### POST /api/partners

Register as a partner.

**Request:**
```json
{
  "partner_name": "My Media",
  "partner_type": "media",
  "niche": "Finance",
  "location": "Jakarta",
  "audience_size": 100000
}
```

---

## Links API

### GET /api/links

List tracking links for current partner.

**Query Parameters:**
- `program_id` - Filter by program
- `status` - active, inactive, expired
- `search` - Search by title/code
- `page`, `limit` - Pagination

### POST /api/links

Create a tracking link.

**Request:**
```json
{
  "program_id": "uuid",
  "channel_type": "social_media",
  "title": "Instagram Link",
  "utm_source": "instagram",
  "utm_medium": "social",
  "utm_campaign": "jan2024"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "unique_code": "abc12345",
    "short_url": "https://cuanpintar.com/r/abc12345",
    "tracking_url": "https://cuanpintar.com/track/...",
    "total_clicks": 0,
    "total_conversions": 0
  }
}
```

---

## Conversions API

### GET /api/conversions

List conversions.

**Query Parameters:**
- `status` - pending, valid, rejected, fraud
- `program_id` - Filter by program
- `partner_id` - Filter by partner
- `page`, `limit` - Pagination

### POST /api/conversions

Record a conversion (with fraud check).

**Request:**
```json
{
  "program_id": "uuid",
  "partner_id": "uuid",
  "channel_type": "social_media",
  "conversion_type": "signup",
  "user_identifier": "user@example.com",
  "fingerprint": "device-fingerprint",
  "utms": {
    "source": "instagram",
    "medium": "social"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "fraud_score": 15
  },
  "fraudCheck": {
    "score": 15,
    "recommendation": "approve",
    "blocked": false
  }
}
```

---

## Payouts API

### GET /api/payouts

List payouts.

### POST /api/payouts

Request a payout.

**Request:**
```json
{
  "amount": 500000,
  "payment_method_id": "pm_uuid"
}
```

### PATCH /api/payouts

Update payout status (admin only).

**Request:**
```json
{
  "payout_id": "uuid",
  "action": "approve",
  "notes": "Approved for processing"
}
```

**Actions:**
- `approve` - Approve and start processing
- `process` - Mark as paid
- `reject` - Reject payout
- `fail` - Mark as failed

---

## Tracking API

### POST /api/track/click

Record a click.

**Request:**
```json
{
  "partner_id": "uuid",
  "program_id": "uuid",
  "fingerprint": "device-fp",
  "utm_source": "instagram",
  "utm_medium": "social"
}
```

### POST /api/track/conversion

Record a conversion (S2S).

**Request:**
```json
{
  "program_id": "uuid",
  "partner_id": "uuid",
  "event_id": "external-event-id",
  "conversion_type": "signup",
  "email": "user@email.com",
  "amount": 150000,
  "api_key": "partner-api-key",
  "signature": "hmac-signature",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## Webhooks API

### POST /api/webhooks

Receive incoming webhooks (Midtrans/Xendit).

Headers:
- `x-midtrans-signature` - Midtrans signature
- `x-callback-token` - Xendit callback token

### GET /api/webhooks

List webhook logs.

### POST /api/webhooks

Create outgoing webhook.

**Request:**
```json
{
  "name": "My Webhook",
  "url": "https://my-app.com/webhook",
  "events": ["conversion.created", "payout.processed"]
}
```

---

## Admin APIs

All `/api/admin/*` endpoints require admin role.

### GET /api/admin/tickets

List support tickets.

### POST /api/admin/announcements

Create platform announcement.

### GET /api/admin/audit

View audit logs.

### GET/PUT /api/admin/settings

Manage platform settings.

---

## Analytics API

### GET /api/analytics

Dashboard analytics data.

### GET /api/analytics/cohort

Cohort analysis.

### GET /api/analytics/ltv

Lifetime value calculations.

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not authenticated |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Duplicate resource |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |
