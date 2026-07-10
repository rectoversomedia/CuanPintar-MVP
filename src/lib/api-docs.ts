/**
 * CuanPintar OpenAPI 3.0 Specification
 * Customer Acquisition Operating System API Documentation
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CuanPintar API',
    description: `
## Customer Acquisition Operating System

CuanPintar API provides programmatic access to CuanPintar's customer acquisition platform.

### Authentication
All API endpoints require authentication via Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_api_key>
\`\`\`

### Rate Limiting
- Auth endpoints: 5 requests per minute
- Read endpoints: 60 requests per minute
- Write endpoints: 30 requests per minute

### Response Format
All responses follow this format:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
\`\`\`

### Error Codes
- \`400\` - Bad Request (validation error)
- \`401\` - Unauthorized (invalid/missing token)
- \`403\` - Forbidden (insufficient permissions)
- \`429\` - Too Many Requests (rate limited)
- \`500\` - Internal Server Error
    `.trim(),
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'api@cuanpintar.com',
      url: 'https://cuanpintar.com/support',
    },
    license: {
      name: 'Proprietary',
      url: 'https://cuanpintar.com/terms',
    },
  },
  servers: [
    {
      url: 'https://api.cuanpintar.com/v1',
      description: 'Production',
    },
    {
      url: 'https://api-staging.cuanpintar.com/v1',
      description: 'Staging',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Programs', description: 'Program management for advertisers' },
    { name: 'Conversions', description: 'Conversion tracking & validation' },
    { name: 'Partners', description: 'Partner management' },
    { name: 'Advertisers', description: 'Advertiser management' },
    { name: 'Payouts', description: 'Partner payout operations' },
    { name: 'Analytics', description: 'Analytics & reporting' },
    { name: 'Media', description: 'Media partner inventory' },
    { name: 'Webhooks', description: 'Webhook configuration' },
    { name: 'Tracking', description: 'Click & conversion tracking' },
  ],
  paths: {
    // Auth Endpoints
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email/password',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: {
                email: 'user@example.com',
                password: 'SecurePass123!',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
          '429': { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user account',
        operationId: 'register',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Registration successful' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current session',
        operationId: 'logout',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Logout successful' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        operationId: 'resetPassword',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Reset email sent' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        operationId: 'getCurrentUser',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    // Programs Endpoints
    '/api/programs': {
      get: {
        tags: ['Programs'],
        summary: 'List all programs',
        operationId: 'listPrograms',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['draft', 'active', 'paused', 'ended'] },
          },
          {
            name: 'advertiser_id',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'industry',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'List of programs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Program' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Programs'],
        summary: 'Create new program',
        operationId: 'createProgram',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProgramRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Program created' },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/programs/{id}': {
      get: {
        tags: ['Programs'],
        summary: 'Get program by ID',
        operationId: 'getProgram',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/ProgramId' },
        ],
        responses: {
          '200': { description: 'Program details' },
          '404': { description: 'Program not found' },
        },
      },
      put: {
        tags: ['Programs'],
        summary: 'Update program',
        operationId: 'updateProgram',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/ProgramId' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProgramRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Program updated' },
          '404': { description: 'Program not found' },
        },
      },
      delete: {
        tags: ['Programs'],
        summary: 'Delete program',
        operationId: 'deleteProgram',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/ProgramId' },
        ],
        responses: {
          '200': { description: 'Program deleted' },
          '404': { description: 'Program not found' },
        },
      },
    },
    // Conversions Endpoints
    '/api/conversions': {
      get: {
        tags: ['Conversions'],
        summary: 'List conversions',
        operationId: 'listConversions',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'valid', 'rejected', 'fraud'] },
          },
          {
            name: 'program_id',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'partner_id',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'List of conversions' },
        },
      },
      post: {
        tags: ['Conversions'],
        summary: 'Record new conversion',
        operationId: 'createConversion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConversionRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Conversion recorded' },
        },
      },
    },
    '/api/conversions/{id}': {
      get: {
        tags: ['Conversions'],
        summary: 'Get conversion by ID',
        operationId: 'getConversion',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/ConversionId' },
        ],
        responses: {
          '200': { description: 'Conversion details' },
          '404': { description: 'Conversion not found' },
        },
      },
      put: {
        tags: ['Conversions'],
        summary: 'Validate/reject conversion',
        operationId: 'updateConversion',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/ConversionId' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidateConversionRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Conversion updated' },
          '404': { description: 'Conversion not found' },
        },
      },
    },
    // Partners Endpoints
    '/api/partners': {
      get: {
        tags: ['Partners'],
        summary: 'List partners',
        operationId: 'listPartners',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'partner_type',
            in: 'query',
            schema: { type: 'string', enum: ['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency'] },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'pending', 'suspended'] },
          },
        ],
        responses: {
          '200': { description: 'List of partners' },
        },
      },
      post: {
        tags: ['Partners'],
        summary: 'Register new partner',
        operationId: 'createPartner',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePartnerRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Partner registered' },
        },
      },
    },
    '/api/partners/{id}': {
      get: {
        tags: ['Partners'],
        summary: 'Get partner by ID',
        operationId: 'getPartner',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PartnerId' },
        ],
        responses: {
          '200': { description: 'Partner details' },
          '404': { description: 'Partner not found' },
        },
      },
      put: {
        tags: ['Partners'],
        summary: 'Update partner',
        operationId: 'updatePartner',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PartnerId' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePartnerRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Partner updated' },
        },
      },
    },
    // Advertisers Endpoints
    '/api/advertisers': {
      get: {
        tags: ['Advertisers'],
        summary: 'List advertisers',
        operationId: 'listAdvertisers',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          '200': { description: 'List of advertisers' },
        },
      },
      post: {
        tags: ['Advertisers'],
        summary: 'Create advertiser',
        operationId: 'createAdvertiser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAdvertiserRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Advertiser created' },
        },
      },
    },
    // Payouts Endpoints
    '/api/payouts': {
      get: {
        tags: ['Payouts'],
        summary: 'List payouts',
        operationId: 'listPayouts',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['pending', 'approved', 'processing', 'paid', 'failed', 'rejected'] },
          },
        ],
        responses: {
          '200': { description: 'List of payouts' },
        },
      },
      post: {
        tags: ['Payouts'],
        summary: 'Request payout',
        operationId: 'createPayout',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePayoutRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Payout requested' },
        },
      },
    },
    // Analytics Endpoints
    '/api/analytics': {
      get: {
        tags: ['Analytics'],
        summary: 'Get platform analytics',
        operationId: 'getAnalytics',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'date_from',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'date_to',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'entity_type',
            in: 'query',
            schema: { type: 'string', enum: ['program', 'partner', 'advertiser', 'platform'] },
          },
        ],
        responses: {
          '200': { description: 'Analytics data' },
        },
      },
    },
    '/api/analytics/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'Get dashboard stats',
        operationId: 'getDashboard',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Dashboard statistics' },
        },
      },
    },
    '/api/analytics/cohort': {
      get: {
        tags: ['Analytics'],
        summary: 'Get cohort analysis',
        operationId: 'getCohortAnalysis',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'date_from',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'date_to',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          '200': { description: 'Cohort analysis data' },
        },
      },
    },
    // Media Endpoints
    '/api/media': {
      get: {
        tags: ['Media'],
        summary: 'List media partners inventory',
        operationId: 'listMedia',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'region',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', default: 'active' },
          },
        ],
        responses: {
          '200': { description: 'Media inventory' },
        },
      },
    },
    // Webhooks Endpoints
    '/api/webhooks': {
      get: {
        tags: ['Webhooks'],
        summary: 'List webhooks',
        operationId: 'listWebhooks',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of webhooks' },
        },
      },
      post: {
        tags: ['Webhooks'],
        summary: 'Create webhook',
        operationId: 'createWebhook',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateWebhookRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Webhook created' },
        },
      },
    },
    // Tracking Endpoints
    '/api/track/click': {
      post: {
        tags: ['Tracking'],
        summary: 'Track click event',
        operationId: 'trackClick',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrackClickRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Click tracked' },
        },
      },
    },
    '/api/track/conversion': {
      post: {
        tags: ['Tracking'],
        summary: 'Track conversion event',
        operationId: 'trackConversion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TrackConversionRequest' },
            },
          },
        },
        responses: {
          '200': { description: 'Conversion tracked' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/auth/login',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for server-to-server integration',
      },
    },
    schemas: {
      // Auth Schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: 'User email address' },
          password: { type: 'string', format: 'password', minLength: 8, description: 'User password' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              session: {
                type: 'object',
                properties: {
                  access_token: { type: 'string' },
                  refresh_token: { type: 'string' },
                },
              },
            },
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 8 },
          name: { type: 'string', minLength: 2, maxLength: 255 },
          role: { type: 'string', enum: ['advertiser', 'partner'] },
          company_name: { type: 'string', maxLength: 255 },
          phone: { type: 'string', pattern: '^(\\+62|62|0)[0-9]{9,12}$' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['advertiser', 'partner', 'admin'] },
          company_name: { type: 'string' },
          avatar: { type: 'string', format: 'uri' },
          phone: { type: 'string' },
          status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      // Program Schemas
      Program: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          advertiser_id: { type: 'string' },
          advertiser_name: { type: 'string' },
          name: { type: 'string' },
          brand_name: { type: 'string' },
          industry: { type: 'string' },
          description: { type: 'string' },
          objectives: { type: 'array', items: { type: 'string' } },
          budget: { type: 'number' },
          payout_model: { type: 'string', enum: ['CPL', 'CPA', 'CPI', 'CPS', 'hybrid'] },
          payout_amount: { type: 'number' },
          target_volume: { type: 'integer' },
          status: { type: 'string', enum: ['draft', 'active', 'paused', 'ended'] },
          channels: { type: 'array', items: { $ref: '#/components/schemas/Channel' } },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateProgramRequest: {
        type: 'object',
        required: ['name', 'advertiser_id', 'payout_model', 'payout_amount'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 255 },
          advertiser_id: { type: 'string', format: 'uuid' },
          advertiser_name: { type: 'string' },
          brand_name: { type: 'string' },
          industry: { type: 'string' },
          description: { type: 'string', maxLength: 1000 },
          objectives: { type: 'array', items: { type: 'string' } },
          budget: { type: 'number', minimum: 0 },
          payout_model: { type: 'string', enum: ['CPL', 'CPA', 'CPI', 'CPS', 'hybrid'] },
          payout_amount: { type: 'number', minimum: 0 },
          target_volume: { type: 'integer', minimum: 0 },
          channels: { type: 'array', items: { $ref: '#/components/schemas/Channel' } },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
        },
      },
      UpdateProgramRequest: {
        allOf: [
          { $ref: '#/components/schemas/CreateProgramRequest' },
          {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              status: { type: 'string', enum: ['draft', 'active', 'paused', 'ended'] },
            },
          },
        ],
      },
      Channel: {
        type: 'object',
        properties: {
          channel_type: { type: 'string', enum: ['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency'] },
          allocated_budget: { type: 'number' },
          estimated_volume: { type: 'integer' },
          quality_score: { type: 'number', minimum: 0, maximum: 100 },
          fraud_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
      // Conversion Schemas
      Conversion: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          program_id: { type: 'string' },
          program_name: { type: 'string' },
          partner_id: { type: 'string' },
          partner_name: { type: 'string' },
          channel_type: { type: 'string' },
          conversion_type: { type: 'string' },
          user_identifier: { type: 'string' },
          ip_address: { type: 'string' },
          device_id: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'valid', 'rejected', 'fraud'] },
          payout_amount: { type: 'number' },
          quality_score: { type: 'number', minimum: 0, maximum: 100 },
          fraud_signals: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateConversionRequest: {
        type: 'object',
        required: ['program_id', 'partner_id', 'user_identifier'],
        properties: {
          program_id: { type: 'string', format: 'uuid' },
          partner_id: { type: 'string', format: 'uuid' },
          channel_type: { type: 'string' },
          conversion_type: { type: 'string' },
          user_identifier: { type: 'string' },
          ip_address: { type: 'string' },
          device_id: { type: 'string' },
          fingerprint: { type: 'string' },
          utms: { $ref: '#/components/schemas/UTMs' },
        },
      },
      ValidateConversionRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['valid', 'rejected', 'fraud'] },
          notes: { type: 'string', maxLength: 500 },
          fraud_signals: { type: 'array', items: { type: 'string' } },
          quality_score: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
      // Partner Schemas
      Partner: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          partner_name: { type: 'string' },
          partner_type: { type: 'string', enum: ['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency'] },
          niche: { type: 'string' },
          location: { type: 'string' },
          audience_size: { type: 'integer' },
          quality_score: { type: 'number', minimum: 0, maximum: 100 },
          status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreatePartnerRequest: {
        type: 'object',
        required: ['user_id', 'partner_type'],
        properties: {
          user_id: { type: 'string', format: 'uuid' },
          partner_type: { type: 'string', enum: ['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency'] },
          company_name: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          description: { type: 'string', maxLength: 1000 },
          categories: { type: 'array', items: { type: 'string' } },
          reach: { type: 'string' },
        },
      },
      UpdatePartnerRequest: {
        allOf: [
          { $ref: '#/components/schemas/CreatePartnerRequest' },
          {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
            },
          },
        ],
      },
      // Advertiser Schemas
      Advertiser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          company_name: { type: 'string' },
          industry: { type: 'string' },
          website: { type: 'string', format: 'uri' },
          status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
          total_spend: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateAdvertiserRequest: {
        type: 'object',
        required: ['user_id', 'company_name'],
        properties: {
          user_id: { type: 'string', format: 'uuid' },
          company_name: { type: 'string', minLength: 2, maxLength: 255 },
          website: { type: 'string', format: 'uri' },
          industry: { type: 'string', maxLength: 100 },
          npwp_number: { type: 'string', maxLength: 20 },
        },
      },
      // Payout Schemas
      Payout: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          partner_id: { type: 'string' },
          partner_name: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'approved', 'processing', 'paid', 'failed', 'rejected'] },
          payment_method: { type: 'string' },
          bank_account: { type: 'string' },
          approved_conversions: { type: 'integer' },
          paid_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreatePayoutRequest: {
        type: 'object',
        required: ['partner_id', 'amount', 'payment_method_id'],
        properties: {
          partner_id: { type: 'string', format: 'uuid' },
          amount: { type: 'number', minimum: 1000, maximum: 100000000 },
          payment_method_id: { type: 'string', format: 'uuid' },
          notes: { type: 'string', maxLength: 500 },
        },
      },
      // Webhook Schemas
      Webhook: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          events: { type: 'array', items: { type: 'string' } },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateWebhookRequest: {
        type: 'object',
        required: ['name', 'url', 'events'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          url: { type: 'string', format: 'uri' },
          events: { type: 'array', items: { type: 'string' }, minItems: 1 },
          secret: { type: 'string', minLength: 16 },
          is_active: { type: 'boolean', default: true },
        },
      },
      // Tracking Schemas
      TrackClickRequest: {
        type: 'object',
        required: ['program_id', 'partner_id'],
        properties: {
          program_id: { type: 'string', format: 'uuid' },
          partner_id: { type: 'string', format: 'uuid' },
          channel: { type: 'string' },
          fingerprint: { type: 'string' },
          source_url: { type: 'string', format: 'uri' },
          utms: { $ref: '#/components/schemas/UTMs' },
          referrer: { type: 'string' },
          device_type: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
          browser: { type: 'string' },
          os: { type: 'string' },
        },
      },
      TrackConversionRequest: {
        allOf: [
          { $ref: '#/components/schemas/CreateConversionRequest' },
          {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      UTMs: {
        type: 'object',
        properties: {
          utm_source: { type: 'string' },
          utm_medium: { type: 'string' },
          utm_campaign: { type: 'string' },
          utm_term: { type: 'string' },
          utm_content: { type: 'string' },
        },
      },
      // Utility Schemas
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    parameters: {
      Page: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', default: 1, minimum: 1 },
        description: 'Page number for pagination',
      },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
        description: 'Number of items per page',
      },
      ProgramId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Program ID',
      },
      ConversionId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Conversion ID',
      },
      PartnerId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Partner ID',
      },
    },
  },
};

export default openApiSpec;
