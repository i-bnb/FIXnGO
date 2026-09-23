'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal FIXnGO Root Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#F8F9FA' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#FEF3C7', color: '#D97706', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
              !
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0C2233', margin: '0 0 10px' }}>
              Critical Application Error
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5', margin: '0 0 24px' }}>
              An unexpected critical error occurred at the root level of FIXnGO. You can attempt to refresh the application state below.
            </p>
            {error.digest && (
              <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8', margin: '0 0 20px' }}>
                Digest: {error.digest}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{
                  background: '#C2410C',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload Application
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  background: '#F1F5F9',
                  color: '#0F172A',
                  border: '1px solid #CBD5E1',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
