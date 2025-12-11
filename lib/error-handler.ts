/**
 * Global error handling utilities for production readiness
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'משאב לא נמצא') {
    super(message, 404, true)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'אין הרשאה') {
    super(message, 401, true)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'גישה אסורה') {
    super(message, 403, true)
  }
}

/**
 * Log error for monitoring/debugging
 */
export function logError(error: Error | AppError, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error(`[${timestamp}] ERROR:`, error.message)

  if (context) {
    console.error('Context:', JSON.stringify(context, null, 2))
  }

  if (error.stack) {
    console.error('Stack Trace:', error.stack)
  }

  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context })
  // }
}

/**
 * Handle API route errors consistently
 */
export function handleApiError(error: unknown, context?: Record<string, any>) {
  logError(error as Error, context)

  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    }
  }

  // Unknown errors should not expose internals in production
  if (process.env.NODE_ENV === 'production') {
    return {
      error: 'אירעה שגיאה בשרת',
      statusCode: 500,
    }
  }

  // Development: show full error
  return {
    error: error instanceof Error ? error.message : 'שגיאה לא ידועה',
    statusCode: 500,
  }
}

/**
 * Validate environment variables are set
 */
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file against .env.example'
    )
  }

  // Warn about optional but recommended vars
  const recommended = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
  ]

  const missingRecommended = recommended.filter(key =>
    !process.env[key] || process.env[key]?.includes('your_') || process.env[key]?.includes('_here')
  )

  if (missingRecommended.length > 0) {
    console.warn(
      '⚠️  Warning: Missing recommended environment variables:',
      missingRecommended.join(', ')
    )
    console.warn('   Some features may not work without these.')
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch (error) {
    logError(error as Error, { json })
    return fallback
  }
}

/**
 * Retry async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Check if error is operational (safe to show to user)
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}
