/**
 * Single Source of Truth: ONE STATE MACHINE for Quotes & Work Orders
 *
 * Implements strict transition matrices and role-based permissions.
 * Invalid transitions throw 409 Conflict.
 * Unauthorized transitions throw 403 Forbidden.
 */

import { UserRole } from './enums';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export type WorkOrderStatus =
  | 'NEW'
  | 'QUOTED'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ON_SITE'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'INVOICED'
  | 'PAID'
  | 'CLOSED'
  | 'CANCELLED';

export const ALLOWED_QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export const ALLOWED_WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  NEW: ['QUOTED', 'APPROVED', 'ASSIGNED', 'CANCELLED'],
  QUOTED: ['APPROVED', 'CANCELLED'],
  APPROVED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'ASSIGNED', 'ON_HOLD', 'CANCELLED'],
  EN_ROUTE: ['ON_SITE', 'ASSIGNED', 'CANCELLED'],
  ON_SITE: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'ASSIGNED', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CLOSED'],
  INVOICED: ['PAID', 'CLOSED'],
  PAID: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

export class InvalidStateTransitionError extends Error {
  readonly statusCode = 409;
  constructor(entity: string, from: string, to: string, allowed: string[]) {
    super(
      `Invalid ${entity} transition: Cannot transition from '${from}' to '${to}'. Allowed transitions from '${from}': [${allowed.join(', ')}]`,
    );
    this.name = 'InvalidStateTransitionError';
  }
}

export class UnauthorizedStateTransitionError extends Error {
  readonly statusCode = 403;
  constructor(role: string, entity: string, from: string, to: string) {
    super(
      `Access Denied: Role '${role}' is not authorized to transition ${entity} from '${from}' to '${to}'`,
    );
    this.name = 'UnauthorizedStateTransitionError';
  }
}

/**
 * Validates a Work Order status transition against the state machine and user role.
 */
export function validateWorkOrderTransition(
  fromStatus: string,
  toStatus: string,
  role?: string,
): { valid: true } {
  const from = fromStatus.toUpperCase() as WorkOrderStatus;
  const to = toStatus.toUpperCase() as WorkOrderStatus;

  const allowed = ALLOWED_WORK_ORDER_TRANSITIONS[from];
  if (!allowed) {
    throw new InvalidStateTransitionError('WorkOrder', fromStatus, toStatus, []);
  }

  // Same status is a no-op / allowed for idempotent updates unless terminal
  if (from === to) {
    return { valid: true };
  }

  if (!allowed.includes(to)) {
    throw new InvalidStateTransitionError('WorkOrder', fromStatus, toStatus, allowed);
  }

  // Role validation if role is specified
  if (role) {
    const normRole = role.toUpperCase();
    const isSuperAdmin = normRole === UserRole.SUPER_ADMIN || normRole === 'SUPER_ADMIN';
    const isOps = normRole === UserRole.OPERATIONS_MANAGER || normRole === 'OPERATIONS_MANAGER';
    const isDispatcher = normRole === UserRole.DISPATCHER || normRole === 'DISPATCHER';
    const isTech = normRole === UserRole.TECHNICIAN || normRole === 'TECHNICIAN';
    const isCustomer = normRole === UserRole.CUSTOMER || normRole === 'CUSTOMER';
    const isAccountant = normRole === UserRole.ACCOUNTANT || normRole === 'ACCOUNTANT';

    if (isSuperAdmin) {
      return { valid: true };
    }

    if (isCustomer) {
      // Customer can only cancel prior to work starting
      if (to === 'CANCELLED' && ['NEW', 'QUOTED', 'APPROVED'].includes(from)) {
        return { valid: true };
      }
      throw new UnauthorizedStateTransitionError(role, 'WorkOrder', from, to);
    }

    if (isTech) {
      // Tech can execute on-field steps
      const techAllowedTransitions = [
        { from: 'ASSIGNED', to: 'EN_ROUTE' },
        { from: 'EN_ROUTE', to: 'ON_SITE' },
        { from: 'ON_SITE', to: 'IN_PROGRESS' },
        { from: 'IN_PROGRESS', to: 'ON_HOLD' },
        { from: 'ON_HOLD', to: 'IN_PROGRESS' },
        { from: 'IN_PROGRESS', to: 'COMPLETED' },
      ];
      const match = techAllowedTransitions.some((t) => t.from === from && t.to === to);
      if (!match) {
        throw new UnauthorizedStateTransitionError(role, 'WorkOrder', from, to);
      }
      return { valid: true };
    }

    if (isDispatcher || isOps) {
      // Dispatcher/Ops can assign, reassign, approve, hold, cancel
      const dispatcherForbidden = ['COMPLETED', 'INVOICED', 'PAID'];
      if (dispatcherForbidden.includes(to)) {
        throw new UnauthorizedStateTransitionError(role, 'WorkOrder', from, to);
      }
      return { valid: true };
    }

    if (isAccountant) {
      // Accountant handles billing closures
      if (!['INVOICED', 'PAID', 'CLOSED'].includes(to)) {
        throw new UnauthorizedStateTransitionError(role, 'WorkOrder', from, to);
      }
      return { valid: true };
    }
  }

  return { valid: true };
}

/**
 * Validates a Quote status transition against the state machine and user role.
 */
export function validateQuoteTransition(
  fromStatus: string,
  toStatus: string,
  role?: string,
): { valid: true } {
  const from = fromStatus.toUpperCase() as QuoteStatus;
  const to = toStatus.toUpperCase() as QuoteStatus;

  const allowed = ALLOWED_QUOTE_TRANSITIONS[from];
  if (!allowed) {
    throw new InvalidStateTransitionError('Quotation', fromStatus, toStatus, []);
  }

  if (from === to) {
    return { valid: true };
  }

  if (!allowed.includes(to)) {
    throw new InvalidStateTransitionError('Quotation', fromStatus, toStatus, allowed);
  }

  if (role) {
    const normRole = role.toUpperCase();
    const isSuperAdmin = normRole === UserRole.SUPER_ADMIN || normRole === 'SUPER_ADMIN';
    const isCustomer = normRole === UserRole.CUSTOMER || normRole === 'CUSTOMER';
    const isOps = normRole === UserRole.OPERATIONS_MANAGER || normRole === 'OPERATIONS_MANAGER';
    const isAccountant = normRole === UserRole.ACCOUNTANT || normRole === 'ACCOUNTANT';

    if (isSuperAdmin) {
      return { valid: true };
    }

    if (isCustomer) {
      // Customer can approve or reject a SENT quote
      if (from === 'SENT' && (to === 'APPROVED' || to === 'REJECTED')) {
        return { valid: true };
      }
      throw new UnauthorizedStateTransitionError(role, 'Quotation', from, to);
    }

    if (normRole === 'TECHNICIAN' || normRole === UserRole.TECHNICIAN) {
      // Technicians cannot approve, reject or send customer quotations
      throw new UnauthorizedStateTransitionError(role, 'Quotation', from, to);
    }

    if (isOps || isAccountant) {
      // Can send draft or cancel quote
      if (['SENT', 'CANCELLED', 'EXPIRED'].includes(to)) {
        return { valid: true };
      }
    }
  }

  return { valid: true };
}
