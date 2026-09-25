'use client';

import { clearClientSession } from './session';

export async function performLogout(locale: string = 'en') {
  try {
    // 1. Invalidate session cookie via server route
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.warn('Server logout request failed:', error);
  }

  // 2. Clear client document cookie
  clearClientSession();

  // 3. Clear browser storage and cached application states
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.removeItem('fixngo_offline_queue');
      localStorage.removeItem('fixngo_active_job');
      localStorage.removeItem('fixngo_user_session');
    }
  } catch (error) {
    console.warn('Storage clearance warning:', error);
  }

  // 4. Disconnect active real-time socket connections
  if (typeof window !== 'undefined' && (window as any).__fixngo_socket) {
    try {
      (window as any).__fixngo_socket.disconnect();
      delete (window as any).__fixngo_socket;
    } catch (e) {
      console.warn('Socket disconnect failed:', e);
    }
  }

  // 5. Cancel active GPS geolocation telemetry tracking
  if (typeof window !== 'undefined' && (window as any).__fixngo_gps_watch_id) {
    try {
      navigator.geolocation?.clearWatch((window as any).__fixngo_gps_watch_id);
      delete (window as any).__fixngo_gps_watch_id;
    } catch (e) {
      console.warn('GPS watch cancellation failed:', e);
    }
  }

  // 6. Hard redirect to home page to purge React component and cache states
  if (typeof window !== 'undefined') {
    window.location.href = `/${locale}`;
  }
}
