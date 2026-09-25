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
    email: 'admin@fixngo.ae',
    avatar: 'SF',
    defaultPath: '/admin',
    description: 'Executive & General Manager · Full System Access',
    phone: '+971 50 111 2233',
  },
  ACCOUNTANT: {
    id: 'persona-accountant',
    name: 'Mariam Al-Husseini',
    role: 'ACCOUNTANT',
    email: 'finance@fixngo.ae',
    avatar: 'MH',
    defaultPath: '/admin/finance',
    description: 'Finance Director · P&L, VAT, Tax Invoices & Ledger',
    phone: '+971 50 333 4455',
  },
  DISPATCHER: {
    id: 'persona-dispatcher',
    name: 'Sara Al-Hashimi',
    role: 'DISPATCHER',
    email: 'dispatch@fixngo.ae',
    avatar: 'SH',
    defaultPath: '/admin/dispatch',
    description: 'Operations Dispatcher · Live GPS & Job Assignment',
    phone: '+971 50 555 6677',
  },
  TECHNICIAN: {
    id: 'persona-technician',
    name: 'Tariq Al-Mansoor',
    role: 'TECHNICIAN',
    email: 'tech@fixngo.ae',
    avatar: 'TM',
    defaultPath: '/tech',
    description: 'Lead Field Specialist · Mobile Execution & Jobs',
    phone: '+971 50 777 8899',
  },
  CUSTOMER: {
    id: 'persona-customer',
    name: 'Khalid Al-Mansoor',
    role: 'CUSTOMER',
    email: 'customer@fixngo.ae',
    avatar: 'KM',
    defaultPath: '/app',
    description: 'Client Portal · Service Tracking & Approvals',
    phone: '+971 50 900 3001',
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
