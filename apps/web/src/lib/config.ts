/**
 * Configuration and URL Resolution Utility for FIXnGO Frontend
 * Strictly enforces: No localhost fallbacks in production builds.
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  return '';
}

export function getSocketUrl(): string {
  const envSocket = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_WS_URL;
  if (envSocket && envSocket.trim()) {
    return envSocket.trim().replace(/\/$/, '');
  }

  return '';
}

export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();
