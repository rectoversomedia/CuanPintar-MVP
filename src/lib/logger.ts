/**
 * Structured Logging Utility
 * Production-ready logging with levels, contexts, and formatting
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  requestId?: string;
  userId?: string;
  duration?: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// Current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Minimum log level to output
const minLevel = isDevelopment ? 'debug' : 'info';

/**
 * Format a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context, error, requestId, userId, duration } = entry;

  const parts: string[] = [];

  // Timestamp
  parts.push(`[${timestamp}]`);

  // Level with color
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m',    // cyan
    info: '\x1b[32m',     // green
    warn: '\x1b[33m',     // yellow
    error: '\x1b[31m',    // red
    fatal: '\x1b[35m',    // magenta
  };
  const reset = '\x1b[0m';
  parts.push(`${levelColors[level]}${level.toUpperCase().padEnd(5)}${reset}`);

  // Request ID if present
  if (requestId) {
    parts.push(`[${requestId}]`);
  }

  // User ID if present
  if (userId) {
    parts.push(`[${userId}]`);
  }

  // Message
  parts.push(message);

  // Duration
  if (duration !== undefined) {
    parts.push(`(${duration}ms)`);
  }

  // Context
  if (context && Object.keys(context).length > 0) {
    parts.push(JSON.stringify(context));
  }

  // Error
  if (error) {
    if (error.stack) {
      parts.push(`\n${error.stack}`);
    } else {
      parts.push(`${error.name || 'Error'}: ${error.message}`);
    }
  }

  return parts.join(' ');
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  options: {
    context?: LogContext;
    error?: Error;
    requestId?: string;
    userId?: string;
    duration?: number;
  } = {}
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: options.context,
    requestId: options.requestId,
    userId: options.userId,
    duration: options.duration,
    error: options.error
      ? {
          message: options.error.message,
          stack: options.error.stack,
          name: options.error.name,
        }
      : undefined,
  };
}

/**
 * Output a log entry
 */
function outputLog(entry: LogEntry): void {
  // Check minimum level
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[minLevel]) {
    return;
  }

  const formatted = formatLogEntry(entry);

  switch (entry.level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
    case 'fatal':
      console.error(formatted);
      break;
  }

  // In production, also send to external logger (e.g., Sentry, Datadog)
  if (isProduction && (entry.level === 'error' || entry.level === 'fatal')) {
    // Could send to error tracking service here
    sendToErrorTracker(entry);
  }
}

/**
 * Send error to external tracker (placeholder for Sentry, Datadog, etc.)
 */
function sendToErrorTracker(entry: LogEntry): void {
  // This would integrate with Sentry, Datadog, or other error tracking
  // Example: Sentry.captureException(entry.error, { extra: entry.context });
  if (typeof window === 'undefined') {
    // Server-side: could use stderr or a log aggregation service
    // For now, we just log to console in production
  }
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private context: LogContext;
  private requestId?: string;
  private userId?: string;

  constructor(defaultContext: LogContext = {}) {
    this.context = defaultContext;
  }

  /**
   * Add request context
   */
  withRequest(requestId: string): Logger {
    this.requestId = requestId;
    return this;
  }

  /**
   * Add user context
   */
  withUser(userId: string): Logger {
    this.userId = userId;
    return this;
  }

  /**
   * Add custom context
   */
  withContext(context: LogContext): Logger {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Time an operation
   */
  async timed<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${name} completed`, { duration, ...context });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${name} failed`, {
        duration,
        error: error instanceof Error ? error.message : String(error),
        ...context,
      });
      throw error;
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    outputLog(createLogEntry('debug', message, { context: { ...this.context, ...context }, requestId: this.requestId, userId: this.userId }));
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    outputLog(createLogEntry('info', message, { context: { ...this.context, ...context }, requestId: this.requestId, userId: this.userId }));
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    outputLog(createLogEntry('warn', message, { context: { ...this.context, ...context }, requestId: this.requestId, userId: this.userId }));
  }

  /**
   * Log error message
   */
  error(message: string, contextOrError?: LogContext | Error, maybeError?: Error): void {
    let context: LogContext | undefined;
    let error: Error | undefined;

    if (contextOrError instanceof Error) {
      error = contextOrError;
      context = maybeError ? { ...this.context } : this.context;
    } else {
      context = { ...this.context, ...contextOrError };
      error = maybeError;
    }

    outputLog(createLogEntry('error', message, { context, requestId: this.requestId, userId: this.userId, error }));
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    outputLog(createLogEntry('fatal', message, { context: { ...this.context, ...context }, requestId: this.requestId, userId: this.userId, error }));
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger({
  service: 'cuanpintar',
  env: process.env.NODE_ENV || 'development',
});

/**
 * Create a child logger with additional context
 */
export function createLogger(context: LogContext): Logger {
  return new Logger(context);
}

/**
 * Request logger middleware for API routes
 */
export function createRequestLogger(requestId: string) {
  return {
    logger: new Logger().withRequest(requestId),
    requestId,
  };
}

/**
 * Audit logging for compliance
 */
export const auditLog = {
  info: (action: string, entity: string, entityId: string, context?: LogContext) => {
    outputLog(createLogEntry('info', `AUDIT: ${action}`, {
      context: {
        audit: true,
        action,
        entity,
        entityId,
        ...context,
      },
    }));
  },
  warn: (action: string, entity: string, entityId: string, reason: string) => {
    outputLog(createLogEntry('warn', `AUDIT: ${action} - ${reason}`, {
      context: {
        audit: true,
        action,
        entity,
        entityId,
        warning: true,
      },
    }));
  },
  error: (action: string, entity: string, entityId: string, error: Error) => {
    outputLog(createLogEntry('error', `AUDIT: ${action}`, {
      context: {
        audit: true,
        action,
        entity,
        entityId,
      },
      error,
    }));
  },
};

export default logger;
