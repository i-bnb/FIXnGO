import { NextRequest, NextResponse } from 'next/server';

interface DemoCredential {
  email: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'SUPER_ADMIN';
  defaultPath: string;
}

const DEMO_ACCOUNTS: Record<string, DemoCredential> = {
  'customer@fixngo.ae': {
    email: 'customer@fixngo.ae',
    role: 'CUSTOMER',
    defaultPath: '/app',
  },
  'tech@fixngo.ae': {
    email: 'tech@fixngo.ae',
    role: 'TECHNICIAN',
    defaultPath: '/tech',
  },
  'admin@fixngo.ae': {
    email: 'admin@fixngo.ae',
    role: 'SUPER_ADMIN',
    defaultPath: '/admin',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, portal } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. First try forwarding to Nest backend API if reachable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    try {
      const apiRes = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, portal }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        const role = data.user?.primaryRole || data.user?.roles?.[0] || 'CUSTOMER';
        
        let sessionRole = 'CUSTOMER';
        if (['SUPER_ADMIN', 'ACCOUNTANT', 'DISPATCHER', 'OPERATIONS_MANAGER', 'STOREKEEPER', 'OPS_MANAGER'].includes(role)) {
          sessionRole = 'SUPER_ADMIN';
        } else if (role === 'TECHNICIAN' || role === 'TECHNICIAN_HELPER') {
          sessionRole = 'TECHNICIAN';
        }

        const response = NextResponse.json({
          success: true,
          user: data.user,
          accessToken: data.accessToken,
          sessionRole,
        });

        response.cookies.set('fixngo_session', sessionRole, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: false,
          sameSite: 'lax',
        });

        return response;
      }
    } catch {
      // Backend API offline or unreachable — proceed to local / demo validation
    }

    // 2. Demo credentials check
    const demo = DEMO_ACCOUNTS[normalizedEmail];
    const isDemoPassword = password === 'FixnGo2026!' || password === 'DemoPassword123!';

    if (demo && isDemoPassword) {
      // Check portal compatibility if specified
      if (portal === 'customer' && demo.role !== 'CUSTOMER') {
        return NextResponse.json(
          { success: false, message: 'This account does not have access to the Customer Portal.' },
          { status: 403 }
        );
      }
      if (portal === 'technician' && demo.role !== 'TECHNICIAN') {
        return NextResponse.json(
          { success: false, message: 'This account does not have access to the Technician Portal.' },
          { status: 403 }
        );
      }
      if (portal === 'admin' && demo.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { success: false, message: 'This account does not have access to the Admin Portal.' },
          { status: 403 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: {
          email: demo.email,
          fullName: demo.role === 'SUPER_ADMIN' ? 'System Administrator' : demo.role === 'TECHNICIAN' ? 'Field Technician' : 'Customer Account',
          role: demo.role,
        },
        sessionRole: demo.role,
      });

      response.cookies.set('fixngo_session', demo.role, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password. Please verify your credentials or use the demo credentials below.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
