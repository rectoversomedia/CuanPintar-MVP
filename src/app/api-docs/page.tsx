/**
 * OpenAPI/Swagger Documentation Page
 *
 * Provides interactive API documentation using Swagger UI
 */

'use client';

import { useEffect, useState } from 'react';
import { openApiSpec } from '@/lib/api-docs';

export default function ApiDocsPage() {
  const [SwaggerUIComponent, setSwaggerUIComponent] = useState<React.ComponentType<SwaggerUIProps> | null>(null);
  const [SwaggerUIstyles, setSwaggerUIstyles] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSwaggerUI = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const swaggerUi = await import('swagger-ui-react');
        setSwaggerUIComponent(() => swaggerUi.default);

        // Load Swagger UI CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
        document.head.appendChild(link);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Swagger UI:', err);
        setError('Failed to load API documentation');
        setIsLoading(false);
      }
    };

    loadSwaggerUI();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Documentation</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please ensure you have an active internet connection.
          </p>
        </div>
      </div>
    );
  }

  if (!SwaggerUIComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Unable to load documentation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CuanPintar API</h1>
                <p className="text-sm text-gray-500">Version 1.0.0 • Customer Acquisition OS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                OpenAPI 3.0
              </span>
              <a
                href="/api-docs.json"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Download Spec
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <SwaggerUIComponent
        spec={openApiSpec}
        docExpansion="list"
        defaultModelsExpandDepth={-1}
        deepLinking={true}
        presets={[
          (await import('swagger-ui-react')).default presets.apisPreset,
        ]}
      />
    </div>
  );
}

interface SwaggerUIProps {
  spec?: Record<string, unknown>;
  docExpansion?: string;
  defaultModelsExpandDepth?: number;
  deepLinking?: boolean;
  presets?: unknown[];
}
