/**
 * Unified API Response Types and Helpers
 *
 * Standardized response format for all API routes
 */

/**
 * Generic API response
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

/**
 * API error response
 */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Stats for list responses (conversions, etc)
 */
export interface StatsMeta {
  total: number;
  valid: number;
  pending: number;
  rejected: number;
  fraud: number;
  totalPayout?: number;
}

/**
 * Union type for API responses
 */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

/**
 * Create a success response
 */
export function success<T>(
  data: T,
  options?: {
    message?: string;
    pagination?: PaginationMeta;
  }
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.pagination && { pagination: options.pagination }),
  };
}

/**
 * Create an error response
 */
export function error(message: string, code?: string, details?: Record<string, string[]>): ApiError {
  return {
    success: false,
    error: message,
    ...(code && { code }),
    ...(details && { details }),
  };
}

/**
 * Create pagination metadata
 */
export function paginate(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Create a paginated success response
 */
export function paginatedSuccess<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): ApiResponse<T[]> {
  return success(data, {
    message,
    pagination: paginate(page, limit, total),
  });
}

/**
 * Create a list response with stats
 */
export function listSuccess<T>(
  data: T[],
  stats: StatsMeta,
  pagination?: PaginationMeta,
  message?: string
): ApiResponse<T[]> & { stats: StatsMeta } {
  return {
    success: true,
    data,
    stats,
    ...(message && { message }),
    ...(pagination && { pagination }),
  };
}

/**
 * HTTP status codes for API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

/**
 * Create response with proper HTTP status
 */
export function created<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, unknown>>(
  body: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing: (keyof T)[] } {
  const missing = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Error codes for client handling
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
