/**
 * CuanPintar - Zod Validation Schemas
 * Phase 0.1: Input Validation Layer
 *
 * All API inputs MUST be validated against these schemas before processing.
 * Compatible with Zod v4
 */

import { z } from 'zod';

// Helper to create enum with custom error message (Zod v4 compatible)
const createEnum = <T extends readonly string[]>(values: T, message: string) => {
  return z.enum(values, { message });
};

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .max(128, 'Password maksimal 128 karakter'),
});

export const registerSchema = z.object({
  email: z
    .string({ message: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf besar')
    .regex(/[a-z]/, 'Harus ada huruf kecil')
    .regex(/[0-9]/, 'Harus ada angka')
    .regex(/[^A-Za-z0-9]/, 'Harus ada karakter spesial'),
  name: z
    .string({ message: 'Nama wajib diisi' })
    .min(2, 'Nama minimal 2 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  role: createEnum(['advertiser', 'partner'], 'Role harus advertiser atau partner'),
  company_name: z.string().max(255).optional(),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid (contoh: 081234567890)')
    .optional()
    .or(z.literal('')),
});

export const resetPasswordRequestSchema = z.object({
  email: z
    .string({ message: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string({ message: 'Token wajib diisi' }).min(1, 'Token wajib diisi'),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf besar')
    .regex(/[a-z]/, 'Harus ada huruf kecil')
    .regex(/[0-9]/, 'Harus ada angka')
    .regex(/[^A-Za-z0-9]/, 'Harus ada karakter spesial'),
});

export const verifyEmailSchema = z.object({
  token: z.string({ message: 'Token wajib diisi' }).min(1, 'Token wajib diisi'),
});

export const changePasswordSchema = z.object({
  current_password: z.string({ message: 'Password saat ini wajib diisi' }).min(1, 'Password saat ini wajib diisi'),
  new_password: z
    .string({ message: 'Password baru wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf besar')
    .regex(/[a-z]/, 'Harus ada huruf kecil')
    .regex(/[0-9]/, 'Harus ada angka')
    .regex(/[^A-Za-z0-9]/, 'Harus ada karakter spesial'),
});

// =============================================================================
// 2FA SCHEMAS
// =============================================================================

export const setup2FASchema = z.object({
  type: createEnum(['totp', 'sms'], 'Tipe 2FA harus totp atau sms'),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).optional(),
});

export const verify2FASchema = z.object({
  code: z.string({ message: 'Kode wajib diisi' }).min(6, 'Kode minimal 6 karakter').max(6, 'Kode maksimal 6 karakter'),
  setup_token: z.string().optional(),
});

export const disable2FASchema = z.object({
  password: z.string({ message: 'Password wajib diisi' }).min(1, 'Password wajib diisi'),
  code: z.string({ message: 'Kode wajib diisi' }).min(6, 'Kode minimal 6 karakter').max(6, 'Kode maksimal 6 karakter'),
});

// =============================================================================
// USER/PROFILE SCHEMAS
// =============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  company_name: z.string().max(255).optional().nullable(),
  phone: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid')
    .optional()
    .nullable(),
  avatar_url: z.string().url().optional().nullable(),
});

export const updateUserStatusSchema = z.object({
  user_id: z.string({ message: 'ID user wajib diisi' }).uuid('ID user tidak valid'),
  status: createEnum(['active', 'suspended', 'pending'], 'Status harus active, suspended, atau pending'),
});

// =============================================================================
// PROGRAM SCHEMAS
// =============================================================================

const channelTypes = ['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency'] as const;

export const createProgramSchema = z.object({
  name: z.string({ message: 'Nama program wajib diisi' }).min(3, 'Nama program minimal 3 karakter').max(255),
  advertiser_id: z.string({ message: 'ID advertiser wajib diisi' }).uuid('ID advertiser tidak valid'),
  payout_model: createEnum(['CPL', 'CPA', 'CPI', 'CPS', 'hybrid'], 'Model payout harus CPL, CPA, CPI, CPS, atau hybrid'),
  payout_amount: z.number({ message: 'Payout amount wajib diisi' }).positive('Payout amount harus positif'),
  payout_currency: z.string().length(3).default('IDR'),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().nullable(),
  channel_allocation: z
    .array(
      z.object({
        channel_type: z.enum(channelTypes),
        allocated_budget: z.number().nonnegative(),
        payout_per_conversion: z.number().nonnegative().optional(),
      })
    )
    .optional(),
  hybrid_config: z
    .object({
      base_payout: z.number().nonnegative(),
      revenue_share_percent: z.number().min(0).max(100).optional(),
    })
    .optional(),
  attribution_window_days: z.number().int().min(1).max(90).default(7),
  conversion_goal: z.string().max(255).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional().nullable(),
  status: createEnum(['draft', 'active', 'paused', 'ended'], 'Status tidak valid').default('draft'),
  caps: z
    .object({
      daily: z.number().int().nonnegative().optional(),
      monthly: z.number().int().nonnegative().optional(),
      total: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export const updateProgramSchema = createProgramSchema.partial().extend({
  id: z.string({ message: 'ID program wajib diisi' }).uuid('ID program tidak valid'),
});

export const programFiltersSchema = z.object({
  status: createEnum(['draft', 'active', 'paused', 'ended'], 'Status tidak valid').optional(),
  advertiser_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: createEnum(['created_at', 'name', 'payout_amount'], 'Sort by tidak valid').default('created_at'),
  sort_order: createEnum(['asc', 'desc'], 'Sort order tidak valid').default('desc'),
});

// =============================================================================
// CONVERSION SCHEMAS
// =============================================================================

const conversionTypes = ['lead', 'signup', 'purchase', 'install', 'registration', 'review_rating', 'event_attendance'] as const;

export const createConversionSchema = z.object({
  program_id: z.string({ message: 'ID program wajib diisi' }).uuid('ID program tidak valid'),
  partner_id: z.string({ message: 'ID partner wajib diisi' }).uuid('ID partner tidak valid'),
  channel_type: z.enum(channelTypes).optional(),
  conversion_type: createEnum(conversionTypes, 'Tipe conversion tidak valid'),
  user_identifier: z.string({ message: 'User identifier wajib diisi' }).min(1).max(255, 'User identifier maksimal 255 karakter'),
  user_data: z.record(z.string(), z.unknown()).optional(),
  ip_address: z.string().optional(), // Simplified - validate format if needed
  fingerprint: z.string().optional(),
  source_url: z.string().url().optional().nullable(),
  utms: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_term: z.string().optional(),
      utm_content: z.string().optional(),
    })
    .optional(),
  device_type: createEnum(['desktop', 'mobile', 'tablet'], 'Device type tidak valid').optional(),
  device_id: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  referrer: z.string().optional(),
});

export const validateConversionSchema = z.object({
  status: createEnum(['valid', 'rejected', 'fraud'], 'Status harus valid, rejected, atau fraud'),
  notes: z.string().max(500).optional(),
  fraud_signals: z.array(z.string()).optional(),
  quality_score: z.number().int().min(0).max(100).optional(),
});

export const conversionFiltersSchema = z.object({
  program_id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  advertiser_id: z.string().uuid().optional(),
  status: createEnum(['pending', 'valid', 'rejected', 'fraud'], 'Status tidak valid').optional(),
  conversion_type: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// TRACKING SCHEMAS
// =============================================================================

export const trackClickSchema = z.object({
  program_id: z.string({ message: 'ID program wajib diisi' }).uuid('ID program tidak valid'),
  partner_id: z.string({ message: 'ID partner wajib diisi' }).uuid('ID partner tidak valid'),
  channel: z.string().optional(),
  fingerprint: z.string().optional(),
  source_url: z.string().optional(),
  utms: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_term: z.string().optional(),
      utm_content: z.string().optional(),
    })
    .optional(),
  referrer: z.string().optional(),
  device_type: createEnum(['desktop', 'mobile', 'tablet'], 'Device type tidak valid').optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
});

export const trackConversionSchema = createConversionSchema;

export const s2sConversionSchema = z.object({
  event_id: z.string().optional(),
  api_key: z.string({ message: 'API key wajib diisi' }).min(1, 'API key wajib diisi'),
  conversion: createConversionSchema,
  timestamp: z.string().datetime().optional(),
});

// =============================================================================
// PAYOUT SCHEMAS
// =============================================================================

export const createPayoutRequestSchema = z.object({
  partner_id: z.string({ message: 'ID partner wajib diisi' }).uuid('ID partner tidak valid'),
  amount: z.number({ message: 'Amount wajib diisi' }).positive('Amount harus positif').max(100000000, 'Maksimal penarikan 100 juta'),
  payment_method_id: z.string({ message: 'ID metode pembayaran wajib diisi' }).uuid('ID metode pembayaran tidak valid'),
  notes: z.string().max(500).optional(),
});

export const updatePayoutSchema = z.object({
  payout_id: z.string({ message: 'ID payout wajib diisi' }).uuid('ID payout tidak valid'),
  action: createEnum(['approve', 'process', 'reject', 'fail'], 'Action tidak valid'),
  notes: z.string().max(500).optional(),
  admin_notes: z.string().max(1000).optional(),
  transaction_id: z.string().max(255).optional(),
});

export const payoutFiltersSchema = z.object({
  partner_id: z.string().uuid().optional(),
  status: createEnum(['pending', 'approved', 'processing', 'paid', 'failed', 'rejected'], 'Status tidak valid').optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// PAYMENT METHOD SCHEMAS
// =============================================================================

const paymentTypes = ['bank_transfer', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay'] as const;

export const createPaymentMethodSchema = z.object({
  type: createEnum(paymentTypes, 'Tipe payment method tidak valid'),
  bank_name: z.string().max(100).optional(),
  bank_code: z.string().max(20).optional(),
  account_number: z.string().max(100).optional(),
  account_holder: z.string({ message: 'Nama pemilik wajib diisi' }).max(255),
  ewallet_number: z.string().max(50).optional(),
  is_default: z.boolean().default(false),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.extend({
  id: z.string({ message: 'ID payment method wajib diisi' }).uuid('ID payment method tidak valid'),
});

// =============================================================================
// ADVERTISER SCHEMAS
// =============================================================================

export const createAdvertiserSchema = z.object({
  user_id: z.string({ message: 'ID user wajib diisi' }).uuid('ID user tidak valid'),
  company_name: z.string({ message: 'Nama perusahaan wajib diisi' }).min(2).max(255),
  website: z.string().url().optional().nullable(),
  industry: z.string().max(100).optional(),
  npwp_number: z.string().max(20).optional(),
  tax_address: z.string().optional(),
  billing_address: z
    .object({
      street: z.string(),
      city: z.string(),
      postal_code: z.string(),
      province: z.string().optional(),
      country: z.string().default('Indonesia'),
    })
    .optional(),
});

export const updateAdvertiserSchema = createAdvertiserSchema.partial().extend({
  id: z.string({ message: 'ID advertiser wajib diisi' }).uuid('ID advertiser tidak valid'),
});

export const advertiserTopupSchema = z.object({
  advertiser_id: z.string({ message: 'ID advertiser wajib diisi' }).uuid('ID advertiser tidak valid'),
  amount: z.number({ message: 'Amount wajib diisi' }).positive('Amount harus positif').max(1000000000, 'Maksimal topup 1 milyar'),
  payment_method: z.string().max(50).optional(),
  bank_transfer: z
    .object({
      bank_code: z.string(),
      account_number: z.string(),
    })
    .optional(),
});

// =============================================================================
// PARTNER SCHEMAS
// =============================================================================

const partnerTypes = ['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency'] as const;

export const createPartnerSchema = z.object({
  user_id: z.string({ message: 'ID user wajib diisi' }).uuid('ID user tidak valid'),
  partner_type: createEnum(partnerTypes, 'Tipe partner tidak valid'),
  company_name: z.string().max(255).optional(),
  website: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional(),
  categories: z.array(z.string()).optional(),
  reach: z.string().max(100).optional(),
  instagram: z.string().max(100).optional(),
  tiktok: z.string().max(100).optional(),
  youtube: z.string().max(100).optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial().extend({
  id: z.string({ message: 'ID partner wajib diisi' }).uuid('ID partner tidak valid'),
  status: createEnum(['active', 'pending', 'suspended'], 'Status tidak valid').optional(),
});

export const partnerFiltersSchema = z.object({
  partner_type: z.string().optional(),
  status: createEnum(['active', 'pending', 'suspended'], 'Status tidak valid').optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// =============================================================================
// WALLET SCHEMAS (Phase 2)
// =============================================================================

export const walletTopupSchema = z.object({
  wallet_id: z.string({ message: 'ID wallet wajib diisi' }).uuid('ID wallet tidak valid'),
  amount: z.number({ message: 'Amount wajib diisi' }).positive('Amount harus positif').max(1000000000),
  payment_method: z.string({ message: 'Payment method wajib diisi' }).max(50),
  idempotency_key: z.string({ message: 'Idempotency key wajib diisi' }).min(1).max(100),
});

export const walletWithdrawSchema = z.object({
  wallet_id: z.string({ message: 'ID wallet wajib diisi' }).uuid('ID wallet tidak valid'),
  amount: z.number({ message: 'Amount wajib diisi' }).positive('Amount harus positif'),
  payment_method_id: z.string({ message: 'ID payment method wajib diisi' }).uuid('ID payment method tidak valid'),
  idempotency_key: z.string({ message: 'Idempotency key wajib diisi' }).min(1).max(100),
});

export const walletTransferSchema = z.object({
  from_wallet_id: z.string({ message: 'ID wallet asal wajib diisi' }).uuid('ID wallet asal tidak valid'),
  to_wallet_id: z.string({ message: 'ID wallet tujuan wajib diisi' }).uuid('ID wallet tujuan tidak valid'),
  amount: z.number({ message: 'Amount wajib diisi' }).positive('Amount harus positif'),
  idempotency_key: z.string({ message: 'Idempotency key wajib diisi' }).min(1).max(100),
});

// =============================================================================
// INVOICE SCHEMAS (Phase 2)
// =============================================================================

export const createInvoiceSchema = z.object({
  advertiser_id: z.string({ message: 'ID advertiser wajib diisi' }).uuid('ID advertiser tidak valid'),
  period_start: z.string({ message: 'Period start wajib diisi' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
  period_end: z.string({ message: 'Period end wajib diisi' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
  billing_address: z
    .object({
      street: z.string(),
      city: z.string(),
      postal_code: z.string(),
      province: z.string().optional(),
      country: z.string().default('Indonesia'),
    })
    .optional(),
  notes: z.string().max(1000).optional(),
  line_items: z
    .array(
      z.object({
        description: z.string({ message: 'Deskripsi wajib diisi' }).min(1).max(500),
        quantity: z.number().int().positive().default(1),
        unit_price: z.number({ message: 'Unit price wajib diisi' }).positive(),
      })
    )
    .min(1, 'Minimal 1 line item'),
});

export const updateInvoiceSchema = z.object({
  invoice_id: z.string({ message: 'ID invoice wajib diisi' }).uuid('ID invoice tidak valid'),
  status: createEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'], 'Status tidak valid').optional(),
  notes: z.string().max(1000).optional(),
  payment_reference: z.string().max(255).optional(),
});

// =============================================================================
// REFUND SCHEMAS (Phase 2)
// =============================================================================

export const createRefundSchema = z.object({
  advertiser_id: z.string({ message: 'ID advertiser wajib diisi' }).uuid('ID advertiser tidak valid'),
  invoice_id: z.string().uuid('ID invoice tidak valid').optional(),
  amount: z.number({ message: 'Amount wajib diisi' }).positive('Amount harus positif'),
  reason: z.string({ message: 'Alasan wajib diisi' }).min(10, 'Alasan minimal 10 karakter').max(500),
  reference_type: z.string().optional(),
  reference_id: z.string().uuid().optional(),
});

export const processRefundSchema = z.object({
  refund_id: z.string({ message: 'ID refund wajib diisi' }).uuid('ID refund tidak valid'),
  action: createEnum(['approve', 'reject'], 'Action tidak valid'),
  notes: z.string().max(500).optional(),
});

// =============================================================================
// SUPPORT TICKET SCHEMAS (Phase 4)
// =============================================================================

const ticketCategories = ['technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other'] as const;
const ticketStatuses = ['open', 'pending', 'in_progress', 'resolved', 'closed'] as const;
const ticketPriorities = ['low', 'medium', 'high', 'urgent'] as const;

export const createTicketSchema = z.object({
  category: createEnum(ticketCategories, 'Kategori tidak valid'),
  priority: createEnum(ticketPriorities, 'Priority tidak valid').default('medium'),
  subject: z.string({ message: 'Subjek wajib diisi' }).min(5, 'Subjek minimal 5 karakter').max(255),
  message: z.string({ message: 'Pesan wajib diisi' }).min(20, 'Pesan minimal 20 karakter'),
});

export const replyTicketSchema = z.object({
  ticket_id: z.string({ message: 'ID ticket wajib diisi' }).uuid('ID ticket tidak valid'),
  message: z.string({ message: 'Pesan tidak boleh kosong' }).min(1),
  is_internal: z.boolean().default(false),
});

export const updateTicketSchema = z.object({
  ticket_id: z.string({ message: 'ID ticket wajib diisi' }).uuid('ID ticket tidak valid'),
  status: createEnum(ticketStatuses, 'Status tidak valid').optional(),
  priority: createEnum(ticketPriorities, 'Priority tidak valid').optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

// =============================================================================
// ANALYTICS SCHEMAS (Phase 5)
// =============================================================================

export const analyticsFiltersSchema = z.object({
  date_from: z.string({ message: 'Date from wajib diisi' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
  date_to: z.string({ message: 'Date to wajib diisi' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
  entity_type: createEnum(['program', 'partner', 'advertiser', 'platform'], 'Entity type tidak valid').optional(),
  entity_id: z.string().uuid().optional(),
  group_by: createEnum(['day', 'week', 'month'], 'Group by tidak valid').default('day'),
});

export const cohortAnalysisSchema = z.object({
  program_id: z.string().uuid().optional(),
  date_from: z.string({ message: 'Date from wajib diisi' }).regex(/^\d{4}-\d{2}-\d{2}$/),
  date_to: z.string({ message: 'Date to wajib diisi' }).regex(/^\d{4}-\d{2}-\d{2}$/),
  cohort_interval: createEnum(['day', 'week', 'month'], 'Interval tidak valid').default('week'),
});

export const scheduledReportSchema = z.object({
  name: z.string({ message: 'Nama wajib diisi' }).min(3).max(255),
  report_type: createEnum(['summary', 'detailed', 'conversion', 'financial', 'partner_performance'], 'Report type tidak valid'),
  schedule: createEnum(['daily', 'weekly', 'monthly'], 'Schedule tidak valid'),
  recipients: z.array(z.string().email()).min(1, 'Minimal 1 email recipient'),
  filters: z
    .object({
      entity_ids: z.array(z.string().uuid()).optional(),
      date_range: z.string().optional(),
    })
    .optional(),
  is_active: z.boolean().default(true),
});

// =============================================================================
// WEBHOOK SCHEMAS
// =============================================================================

export const createWebhookSchema = z.object({
  name: z.string({ message: 'Nama wajib diisi' }).min(1).max(255),
  url: z.string({ message: 'URL wajib diisi' }).url('URL webhook tidak valid'),
  events: z.array(z.string()).min(1, 'Minimal 1 event'),
  secret: z.string().min(16, 'Secret minimal 16 karakter').optional(),
  is_active: z.boolean().default(true),
});

export const updateWebhookSchema = createWebhookSchema.partial().extend({
  id: z.string({ message: 'ID webhook wajib diisi' }).uuid('ID webhook tidak valid'),
});

// =============================================================================
// API KEY SCHEMAS (Phase 3)
// =============================================================================

export const createApiKeySchema = z.object({
  name: z.string({ message: 'Nama wajib diisi' }).min(3).max(255),
  permissions: z.array(z.string()).default(['track:write']),
  rate_limit: z.number().int().positive().default(10000),
  expires_at: z.string().datetime().optional(),
});

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type CreateConversionInput = z.infer<typeof createConversionSchema>;
export type CreatePayoutInput = z.infer<typeof createPayoutRequestSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
