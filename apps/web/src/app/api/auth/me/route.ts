import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('fixngo_session')?.value;
    const authHeader = request.headers.get('authorization');

    // 1. Try backend API if token is present
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    if (authHeader) {
      try {
        const apiRes = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: authHeader },
        });
        if (apiRes.ok) {
          const userData = await apiRes.json();
          return NextResponse.json({ success: true, user: userData });
        }
      } catch {
        // Backend offline or unreachable, fallback to cookie session
      }
    }

    // 2. Resolve user from session cookie
    if (sessionCookie === 'CUSTOMER') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'cust-demo-01',
          fullName: 'Fatima Al Mansoori',
          email: 'customer@fixngo.ae',
          phone: '+971 50 900 3001',
          role: 'CUSTOMER',
        },
      });
    }

    if (sessionCookie === 'TECHNICIAN') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'tech-002',
          fullName: 'Rashid Al-Nuaimi',
          email: 'tech@fixngo.ae',
          phone: '+971 50 777 8899',
          role: 'TECHNICIAN',
        },
      });
    }

    if (sessionCookie === 'SUPER_ADMIN') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin-001',
          fullName: 'Sultan Al-Falasi',
          email: 'admin@fixngo.ae',
          phone: '+971 50 111 2233',
          role: 'SUPER_ADMIN',
        },
      });
    }

    // Unauthenticated
    return NextResponse.json(
      { success: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
