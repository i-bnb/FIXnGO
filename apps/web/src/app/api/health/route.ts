import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FIXnGO Unified Web & Operations',
    timestamp: new Date().toISOString(),
  });
}
