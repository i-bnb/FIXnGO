export type DemoRole = 'SUPER_ADMIN' | 'ACCOUNTANT' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';

export interface DemoPersona {
  id: string;
  name: string;
  role: DemoRole;
  email: string;
  avatar: string;
  defaultPath: string;
  description: string;
  phone: string;
}

export const DEMO_PERSONAS: Record<DemoRole, DemoPersona> = {
  SUPER_ADMIN: {
    id: 'persona-admin',
    name: 'Sultan Al-Falasi',
    role: 'SUPER_ADMIN',
    email: 'test@i-bnb.com',
    avatar: 'SF',
    defaultPath: '/admin',
    description: 'Executive & General Manager · Full System Access',
    phone: 'xxxxxxxxx',
  },
  ACCOUNTANT: {
    id: 'persona-accountant',
    name: 'Mariam Al-Husseini',
    role: 'ACCOUNTANT',
    email: 'test@i-bnb.com',
    avatar: 'MH',
    defaultPath: '/admin/finance',
    description: 'Finance Director · P&L, VAT, Tax Invoices & Ledger',
    phone: 'xxxxxxxxx',
  },
  DISPATCHER: {
    id: 'persona-dispatcher',
    name: 'Sara Al-Hashimi',
    role: 'DISPATCHER',
    email: 'test@i-bnb.com',
    avatar: 'SH',
    defaultPath: '/admin/dispatch',
    description: 'Operations Dispatcher · Live GPS & Job Assignment',
    phone: 'xxxxxxxxx',
  },
  TECHNICIAN: {
    id: 'persona-technician',
    name: 'Tariq Al-Mansoor',
    role: 'TECHNICIAN',
    email: 'test@i-bnb.com',
    avatar: 'TM',
    defaultPath: '/tech',
    description: 'Lead Field Specialist · Mobile Execution & Jobs',
    phone: 'xxxxxxxxx',
  },
  CUSTOMER: {
    id: 'persona-customer',
    name: 'Khalid Al-Mansoor',
    role: 'CUSTOMER',
    email: 'test@i-bnb.com',
    avatar: 'KM',
    defaultPath: '/app',
    description: 'Client Portal · Service Tracking & Approvals',
    phone: 'xxxxxxxxx',
  },
};

export const SESSION_COOKIE_NAME = 'fixngo_session';

export function getClientSession(): DemoPersona | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + SESSION_COOKIE_NAME + '=([^;]+)'));
  if (!match) return null;
  try {
    const role = decodeURIComponent(match[2]) as DemoRole;
    return DEMO_PERSONAS[role] || null;
  } catch {
    return null;
  }
}

export function setClientSession(role: DemoRole): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearClientSession(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
