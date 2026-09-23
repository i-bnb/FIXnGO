import { z } from 'zod';

/**
 * Production Environment Configuration Schema
 * Enforces strict fail-fast validation on startup with clear error messages.
 */
export const envSchema = z.object({
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required (Neon pooled PostgreSQL connection string)' })
    .min(1, 'DATABASE_URL cannot be empty'),

  DIRECT_URL: z
    .string({ required_error: 'DIRECT_URL is required (Neon direct PostgreSQL connection string for migrations)' })
    .min(1, 'DIRECT_URL cannot be empty'),

  REDIS_URL: z
    .string({ required_error: 'REDIS_URL is required (Upstash Redis connection string, e.g. rediss://...)' })
    .min(1, 'REDIS_URL cannot be empty'),

  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required for signing authentication tokens' })
    .min(8, 'JWT_SECRET must be at least 8 characters long'),

  JWT_REFRESH_SECRET: z
    .string({ required_error: 'JWT_REFRESH_SECRET is required for signing session refresh tokens' })
    .min(8, 'JWT_REFRESH_SECRET must be at least 8 characters long'),

  CORS_ORIGINS: z
    .string({ required_error: 'CORS_ORIGINS is required (comma-separated allowed origins)' })
    .min(1, 'CORS_ORIGINS cannot be empty'),

  APPWRITE_ENDPOINT: z
    .string({ required_error: 'APPWRITE_ENDPOINT is required (e.g. https://sgp.cloud.appwrite.io/v1)' })
    .min(1, 'APPWRITE_ENDPOINT cannot be empty'),

  APPWRITE_PROJECT_ID: z
    .string({ required_error: 'APPWRITE_PROJECT_ID is required' })
    .min(1, 'APPWRITE_PROJECT_ID cannot be empty'),

  APPWRITE_API_KEY: z
    .string({ required_error: 'APPWRITE_API_KEY is required for Appwrite Cloud storage access' })
    .min(1, 'APPWRITE_API_KEY cannot be empty'),

  APPWRITE_BUCKET_ID: z
    .string({ required_error: 'APPWRITE_BUCKET_ID is required (single bucket, e.g. fixngo-vault)' })
    .min(1, 'APPWRITE_BUCKET_ID cannot be empty'),

  PAYMENT_PROVIDER: z
    .string({ required_error: 'PAYMENT_PROVIDER is required (mock or stripe)' })
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(['mock', 'stripe'], { errorMap: () => ({ message: "PAYMENT_PROVIDER must be 'mock' or 'stripe'" }) })),

  STRIPE_SECRET_KEY: z
    .string({ required_error: 'STRIPE_SECRET_KEY is required' })
    .min(1, 'STRIPE_SECRET_KEY cannot be empty'),

  STRIPE_WEBHOOK_SECRET: z
    .string({ required_error: 'STRIPE_WEBHOOK_SECRET is required' })
    .min(1, 'STRIPE_WEBHOOK_SECRET cannot be empty'),

  GEMINI_API_KEY: z
    .string({ required_error: 'GEMINI_API_KEY is required for Google Gen AI assistant' })
    .min(1, 'GEMINI_API_KEY cannot be empty'),

  GEMINI_MODEL: z
    .string({ required_error: 'GEMINI_MODEL is required (e.g. gemini-3.6-flash)' })
    .min(1, 'GEMINI_MODEL cannot be empty'),

  // Optional variables with defaults
  PORT: z.string().optional().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  JWT_EXPIRES_IN: z.string().optional().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('7d'),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates process.env against envSchema.
 * Automatically resolves common aliases (e.g. CORS_ORIGIN -> CORS_ORIGINS, DIRECT_URL -> DATABASE_URL fallback for local dev).
 * Fails fast with clear, actionable error messages if invalid.
 */
export function validateEnv(env: Record<string, string | undefined> = process.env): ValidatedEnv {
  // Gracefully inherit aliases if primary keys aren't set
  const sanitizedEnv = { ...env };

  if (!sanitizedEnv.CORS_ORIGINS && sanitizedEnv.CORS_ORIGIN) {
    sanitizedEnv.CORS_ORIGINS = sanitizedEnv.CORS_ORIGIN;
  }

  if (!sanitizedEnv.DIRECT_URL && sanitizedEnv.DATABASE_URL) {
    sanitizedEnv.DIRECT_URL = sanitizedEnv.DATABASE_URL;
  }

  const result = envSchema.safeParse(sanitizedEnv);

  if (!result.success) {
    const issues = result.error.issues;
    const formatted = issues
      .map((issue) => `  ❌ [${issue.path.join('.') || 'CONFIG'}]: ${issue.message}`)
      .join('\n');

    const banner = [
      '================================================================================',
      '🚨 CRITICAL STARTUP ERROR: INVALID ENVIRONMENT CONFIGURATION',
      '================================================================================',
      formatted,
      '--------------------------------------------------------------------------------',
      '💡 Resolution: Please check your .env file or hosting environment variables.',
      '   Refer to .env.example or docs/DEPLOY.md for configuration instructions.',
      '================================================================================',
    ].join('\n');

    console.error(`\n${banner}\n`);
    throw new Error(`Environment validation failed with ${issues.length} error(s). Server cannot start.`);
  }

  return result.data;
}
