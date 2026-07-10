/**
 * OpenAPI JSON Specification Endpoint
 *
 * Provides the OpenAPI 3.0 specification as JSON
 * Used by Swagger UI and external API consumers
 */

import { NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/api-docs';

export const GET = async () => {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};

export const dynamic = 'force-static';
