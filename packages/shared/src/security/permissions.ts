/**
 * ==============================================================================
 * CENTRAL PERMISSION MATRIX & ACCESS CONTROL SPECIFICATION
 * ==============================================================================
 * Aligns with OWASP ASVS Level 2 & UAE PDPL Federal Decree-Law No. 45 of 2021.
 * Governs Least-Privilege Role-Based Access Control (RBAC) and IDOR ownership gates.
 */

export type RoleCategory = 'customer' | 'technician' | 'admin';

export type SecurityRole =
  // 1. Customer
  | 'customer'
  // 2. Technician (Lead vs. Helper)
  | 'technician_in_charge'
  | 'technician_helper'
  // 3. Admin Sub-Roles
  | 'super_admin'
  | 'ops_manager'
  | 'accountant'
  | 'storekeeper'
  | 'dispatcher';

export type PermissionAction =
  // Work Orders & Field Operations
  | 'work_orders:create'
  | 'work_orders:read_own'
  | 'work_orders:read_assigned'
  | 'work_orders:read_all'
  | 'work_orders:assign'
  | 'work_orders:status_transition'
  | 'work_orders:signoff'
  | 'work_orders:delete'
  // Invoices & Billing
  | 'invoices:read_own'
  | 'invoices:read_all'
  | 'invoices:create'
  | 'invoices:void'
  // Payments & Financial Ledger
  | 'payments:pay_own'
  | 'payments:view_all'
  | 'payments:process_refund'
  | 'finance:view_pnl'
  | 'finance:view_receivables'
  | 'finance:view_profitability'
  | 'finance:post_journal'
  // Inventory & Warehouse
  | 'inventory:view_all'
  | 'inventory:view_van_stock'
  | 'inventory:consume_van_stock'
  | 'inventory:adjust_warehouse'
  | 'inventory:approve_po'
  // Heavy Equipment & Manpower
  | 'equipment:manage'
  | 'equipment:view'
  | 'manpower:manage'
  | 'manpower:view'
  // Telematics & GPS Tracking
  | 'telematics:view_fleet'
  | 'telematics:update_own_location'
  | 'telematics:view_active_job_tech'
  // System, Audit & Administration
  | 'audit_logs:view'
  | 'roles:manage'
  | 'data:export'
  | 'assistant:ask_operations'
  | 'assistant:ask_finance';

/**
 * Static Role-to-Permissions Mapping Matrix
 */
export const ROLE_PERMISSIONS: Record<SecurityRole, readonly PermissionAction[]> = {
  // 1. Customer
  customer: [
    'work_orders:create',
    'work_orders:read_own',
    'work_orders:signoff',
    'invoices:read_own',
    'payments:pay_own',
    'telematics:view_active_job_tech',
  ],

  // 2. Technicians
  technician_helper: [
    'work_orders:read_assigned',
    'inventory:view_van_stock',
    'telematics:update_own_location',
  ],

  technician_in_charge: [
    'work_orders:read_assigned',
    'work_orders:status_transition',
    'work_orders:signoff',
    'inventory:view_van_stock',
    'inventory:consume_van_stock',
    'telematics:update_own_location',
  ],

  // 3. Admin Sub-Roles
  dispatcher: [
    'work_orders:create',
    'work_orders:read_all',
    'work_orders:assign',
    'work_orders:status_transition',
    'inventory:view_all',
    'equipment:view',
    'manpower:view',
    'telematics:view_fleet',
    'assistant:ask_operations',
  ],

  storekeeper: [
    'work_orders:read_all',
    'inventory:view_all',
    'inventory:view_van_stock',
    'inventory:adjust_warehouse',
    'inventory:approve_po',
    'assistant:ask_operations',
  ],

  accountant: [
    'work_orders:read_all',
    'invoices:read_all',
    'invoices:create',
    'invoices:void',
    'payments:view_all',
    'payments:process_refund',
    'finance:view_pnl',
    'finance:view_receivables',
    'finance:view_profitability',
    'finance:post_journal',
    'inventory:view_all',
    'data:export',
    'assistant:ask_operations',
    'assistant:ask_finance',
  ],

  ops_manager: [
    'work_orders:create',
    'work_orders:read_all',
    'work_orders:assign',
    'work_orders:status_transition',
    'invoices:read_all',
    'inventory:view_all',
    'inventory:approve_po',
    'equipment:manage',
    'equipment:view',
    'manpower:manage',
    'manpower:view',
    'telematics:view_fleet',
    'data:export',
    'assistant:ask_operations',
  ],

  super_admin: [
    // All permissions granted
    'work_orders:create',
    'work_orders:read_own',
    'work_orders:read_assigned',
    'work_orders:read_all',
    'work_orders:assign',
    'work_orders:status_transition',
    'work_orders:signoff',
    'work_orders:delete',
    'invoices:read_own',
    'invoices:read_all',
    'invoices:create',
    'invoices:void',
    'payments:pay_own',
    'payments:view_all',
    'payments:process_refund',
    'finance:view_pnl',
    'finance:view_receivables',
    'finance:view_profitability',
    'finance:post_journal',
    'inventory:view_all',
    'inventory:view_van_stock',
    'inventory:consume_van_stock',
    'inventory:adjust_warehouse',
    'inventory:approve_po',
    'equipment:manage',
    'equipment:view',
    'manpower:manage',
    'manpower:view',
    'telematics:view_fleet',
    'telematics:update_own_location',
    'telematics:view_active_job_tech',
    'audit_logs:view',
    'roles:manage',
    'data:export',
    'assistant:ask_operations',
    'assistant:ask_finance',
  ],
};

/**
 * Checks whether a given role holds a specific permission action.
 */
export function hasPermission(role: SecurityRole, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) {
    return false;
  }
  return permissions.includes(action);
}

/**
 * IDOR Defense: Verifies whether an authenticated caller can view/modify a Work Order.
 */
export function canAccessWorkOrder(
  role: SecurityRole,
  userId: string,
  workOrder: { customerId?: string; assignedTechnicianId?: string; helperId?: string }
): boolean {
  if (role === 'super_admin' || role === 'ops_manager' || role === 'dispatcher' || role === 'accountant' || role === 'storekeeper') {
    return true;
  }
  if (role === 'customer') {
    return workOrder.customerId === userId;
  }
  if (role === 'technician_in_charge') {
    return workOrder.assignedTechnicianId === userId;
  }
  if (role === 'technician_helper') {
    return workOrder.helperId === userId;
  }
  return false;
}

/**
 * IDOR Defense: Verifies whether an authenticated caller can view/modify an Invoice.
 */
export function canAccessInvoice(
  role: SecurityRole,
  userId: string,
  invoice: { customerId?: string }
): boolean {
  if (role === 'super_admin' || role === 'accountant' || role === 'ops_manager') {
    return true;
  }
  if (role === 'customer') {
    return invoice.customerId === userId;
  }
  return false;
}

/**
 * Location Privacy Defense (OWASP / UAE PDPL):
 * Customers may ONLY track technician GPS coordinates while the technician is actively EN_ROUTE or ON_SITE for their job.
 */
export function canTrackTechnicianLocation(
  role: SecurityRole,
  userId: string,
  technicianId: string,
  activeContext?: {
    isTechnicianOnDuty: boolean;
    jobStatus?: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    jobCustomerId?: string;
    assignedTechnicianId?: string;
  }
): boolean {
  if (role === 'super_admin' || role === 'ops_manager' || role === 'dispatcher') {
    return true;
  }

  if (role === 'customer') {
    if (!activeContext) return false;
    const isJobActive = activeContext.jobStatus === 'EN_ROUTE' || activeContext.jobStatus === 'ARRIVED' || activeContext.jobStatus === 'IN_PROGRESS';
    return (
      isJobActive &&
      activeContext.jobCustomerId === userId &&
      activeContext.assignedTechnicianId === technicianId
    );
  }

  if (role === 'technician_in_charge' || role === 'technician_helper') {
    return userId === technicianId;
  }

  return false;
}
