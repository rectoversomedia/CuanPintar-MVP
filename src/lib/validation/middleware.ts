/**
 * CuanPintar - Validation Middleware
 * Phase 0.1: Request validation middleware using Zod
 *
 * Compatible with Zod v4 (uses `issues` instead of `errors`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export interface ValidationResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Format Zod issues into field/message pairs
 */
function formatIssues(issues: readonly ZodIssue[]): Array<{ field: string; message: string }> {
  return issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(
  schema: ZodSchema<T>,
  request: NextRequest
): ValidationResult {
  try {
    const body = request.clone().json();
    const validated = schema.parse(body);
    return { success: true, data: validated as Record<string, unknown> };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatIssues(error.issues) };
    }
    return {
      success: false,
      errors: [{ field: 'body', message: 'Invalid request body' }],
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  schema: ZodSchema<T>,
  request: NextRequest
): ValidationResult {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });
    const validated = schema.parse(queryObj);
    return { success: true, data: validated as Record<string, unknown> };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatIssues(error.issues) };
    }
    return {
      success: false,
      errors: [{ field: 'query', message: 'Invalid query parameters' }],
    };
  }
}

/**
 * Validate route parameters (dynamic segments)
 */
export function validateParams<T>(
  schema: ZodSchema<T>,
  params: Record<string, string | string[] | undefined>
): ValidationResult {
  try {
    const validated = schema.parse(params);
    return { success: true, data: validated as Record<string, unknown> };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: formatIssues(error.issues) };
    }
    return {
      success: false,
      errors: [{ field: 'params', message: 'Invalid route parameters' }],
    };
  }
}

/**
 * Create a Next.js route handler wrapper that validates request
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (data: T, request: NextRequest) => Promise<NextResponse>,
  validationType: 'body' | 'query' = 'body'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result =
      validationType === 'query'
        ? validateQuery(schema, request)
        : validateBody(schema, request);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.errors,
        },
        { status: 400 }
      );
    }

    return handler(result.data as T, request);
  };
}

/**
 * Format Zod error messages for API response (Zod v4 compatible)
 */
export function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return formatIssues(error.issues);
}

/**
 * Create a standardized API error response
 */
export function validationErrorResponse(
  errors: Array<{ field: string; message: string }>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors,
    },
    { status: 400 }
  );
}

/**
 * Common validation patterns
 */
export const validationPatterns = {
  // UUID
  uuid: (field: string) => ({
    field,
    validate: (value: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value);
    },
    message: `${field} must be a valid UUID`,
  }),

  // Indonesian phone number
  phone: (value: string) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(value);
  },

  // Indonesian NPWP
  npwp: (value: string) => {
    const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
    return npwpRegex.test(value);
  },

  // Password strength for Indonesian context
  passwordStrength: (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecial && isLongEnough,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecial,
      isLongEnough,
    };
  },
};
