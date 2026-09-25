import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.error('[CLIENT CRASH REPORT]', {
      timestamp: new Date().toISOString(),
      page: body?.page,
      userRole: body?.userRole,
      message: body?.message,
      stack: body?.stack,
      digest: body?.digest,
    });
    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('[CLIENT CRASH REPORT HANDLER FAILED]', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
