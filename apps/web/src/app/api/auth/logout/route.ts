import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Session cleared and logged out successfully',
  });

  // Explicitly clear session cookie on the server
  response.cookies.set('fixngo_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
