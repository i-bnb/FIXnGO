/**
 * CORS Origin Parsing and Validation Utility
 * Supports comma-separated origin lists and Vercel preview deployments (https://*-<team>.vercel.app)
 */

export function parseCorsOrigins(corsEnv?: string): string[] {
  const defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];

  if (!corsEnv || !corsEnv.trim()) {
    return defaults;
  }

  const parsed = corsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : defaults;
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, Postman)
  if (!origin) {
    return true;
  }

  // Always allow in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Check exact match in configured origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Vercel preview deployment URLs:
  // e.g. https://fixngo-git-feature-myteam.vercel.app or https://my-branch-preview.vercel.app
  const vercelPreviewRegex = /^https:\/\/[a-zA-Z0-9_\-.]+\.vercel\.app$/;
  if (vercelPreviewRegex.test(origin)) {
    return true;
  }

  return false;
}
