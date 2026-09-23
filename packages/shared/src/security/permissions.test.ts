import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  hasPermission,
  canAccessWorkOrder,
  canAccessInvoice,
  canTrackTechnicianLocation,
  requireRole,
  requireOwnership,
  requirePermission,
  SecurityRole,
} from './permissions';

describe('Security Architecture & Permission Matrix (OWASP ASVS / UAE PDPL)', () => {
  describe('1. Role-Based Access Control (RBAC) Least Privilege Invariants', () => {
    it('should grant Super Admin unrestricted access across all system capabilities', () => {
      assert.strictEqual(hasPermission('super_admin', 'finance:view_pnl'), true);
      assert.strictEqual(hasPermission('super_admin', 'work_orders:assign'), true);
      assert.strictEqual(hasPermission('super_admin', 'payments:process_refund'), true);
      assert.strictEqual(hasPermission('super_admin', 'roles:manage'), true);
    });

    it('should grant Accountant financial capabilities but restrict operational fleet dispatch', () => {
      assert.strictEqual(hasPermission('accountant', 'finance:view_pnl'), true);
      assert.strictEqual(hasPermission('accountant', 'finance:view_profitability'), true);
      assert.strictEqual(hasPermission('accountant', 'invoices:create'), true);
      assert.strictEqual(hasPermission('accountant', 'payments:process_refund'), true);

      // Forbidden operational actions
      assert.strictEqual(hasPermission('accountant', 'work_orders:assign'), false);
      assert.strictEqual(hasPermission('accountant', 'telematics:view_fleet'), false);
    });

    it('should grant Dispatcher fleet and dispatching capabilities but restrict financial PnL', () => {
      assert.strictEqual(hasPermission('dispatcher', 'work_orders:assign'), true);
      assert.strictEqual(hasPermission('dispatcher', 'work_orders:status_transition'), true);
      assert.strictEqual(hasPermission('dispatcher', 'telematics:view_fleet'), true);

      // Forbidden financial actions
      assert.strictEqual(hasPermission('dispatcher', 'finance:view_pnl'), false);
      assert.strictEqual(hasPermission('dispatcher', 'finance:view_profitability'), false);
      assert.strictEqual(hasPermission('dispatcher', 'payments:process_refund'), false);
    });

    it('should restrict Customer to self-service booking and invoice review', () => {
      assert.strictEqual(hasPermission('customer', 'work_orders:create'), true);
      assert.strictEqual(hasPermission('customer', 'work_orders:read_own'), true);
      assert.strictEqual(hasPermission('customer', 'payments:pay_own'), true);

      // Forbidden back-office actions
      assert.strictEqual(hasPermission('customer', 'work_orders:read_all'), false);
      assert.strictEqual(hasPermission('customer', 'work_orders:assign'), false);
      assert.strictEqual(hasPermission('customer', 'inventory:view_all'), false);
    });

    it('should enforce differentiation between Technician In-Charge and Technician Helper', () => {
      // In-charge can consume van stock and update job status
      assert.strictEqual(hasPermission('technician_in_charge', 'inventory:consume_van_stock'), true);
      assert.strictEqual(hasPermission('technician_in_charge', 'work_orders:status_transition'), true);

      // Helper has read/assist privileges only
      assert.strictEqual(hasPermission('technician_helper', 'inventory:consume_van_stock'), false);
      assert.strictEqual(hasPermission('technician_helper', 'work_orders:status_transition'), false);
      assert.strictEqual(hasPermission('technician_helper', 'work_orders:read_assigned'), true);
    });
  });

  describe('2. Insecure Direct Object Reference (IDOR) Ownership Defense', () => {
    it('should permit customer to view only their own work order', () => {
      const ownOrder = { customerId: 'cust-123', assignedTechnicianId: 'tech-01' };
      const foreignOrder = { customerId: 'cust-999', assignedTechnicianId: 'tech-02' };

      assert.strictEqual(canAccessWorkOrder('customer', 'cust-123', ownOrder), true);
      assert.strictEqual(canAccessWorkOrder('customer', 'cust-123', foreignOrder), false);
    });

    it('should permit technician in-charge to view only assigned work order', () => {
      const assignedOrder = { customerId: 'cust-123', assignedTechnicianId: 'tech-01' };
      const otherOrder = { customerId: 'cust-123', assignedTechnicianId: 'tech-99' };

      assert.strictEqual(canAccessWorkOrder('technician_in_charge', 'tech-01', assignedOrder), true);
      assert.strictEqual(canAccessWorkOrder('technician_in_charge', 'tech-01', otherOrder), false);
    });

    it('should permit customer to view only their own invoice', () => {
      const ownInvoice = { customerId: 'cust-123' };
      const otherInvoice = { customerId: 'cust-456' };

      assert.strictEqual(canAccessInvoice('customer', 'cust-123', ownInvoice), true);
      assert.strictEqual(canAccessInvoice('customer', 'cust-123', otherInvoice), false);
    });

    it('should permit accountant to view all invoices', () => {
      assert.strictEqual(canAccessInvoice('accountant', 'acc-01', { customerId: 'cust-456' }), true);
    });
  });

  describe('3. UAE PDPL & Telematics Location Privacy Protection', () => {
    it('should allow customer to track technician GPS only when job is EN_ROUTE or IN_PROGRESS', () => {
      const activeEnRouteContext = {
        isTechnicianOnDuty: true,
        jobStatus: 'EN_ROUTE' as const,
        jobCustomerId: 'cust-123',
        assignedTechnicianId: 'tech-01',
      };

      const completedContext = {
        isTechnicianOnDuty: true,
        jobStatus: 'COMPLETED' as const,
        jobCustomerId: 'cust-123',
        assignedTechnicianId: 'tech-01',
      };

      const foreignJobContext = {
        isTechnicianOnDuty: true,
        jobStatus: 'EN_ROUTE' as const,
        jobCustomerId: 'cust-999',
        assignedTechnicianId: 'tech-01',
      };

      // Allowed while en route to customer's site
      assert.strictEqual(canTrackTechnicianLocation('customer', 'cust-123', 'tech-01', activeEnRouteContext), true);

      // Blocked once job is completed (protects technician privacy after job)
      assert.strictEqual(canTrackTechnicianLocation('customer', 'cust-123', 'tech-01', completedContext), false);

      // Blocked for customers of other jobs
      assert.strictEqual(canTrackTechnicianLocation('customer', 'cust-123', 'tech-01', foreignJobContext), false);
    });
  });

  describe('4. Enforcement Helpers: requireRole & requireOwnership', () => {
    it('should allow valid role and throw SecurityAccessDeniedError for invalid role', () => {
      // Super admin always passes
      assert.doesNotThrow(() => requireRole('super_admin', ['accountant']));

      // Accountant has finance access
      assert.doesNotThrow(() => requireRole('accountant', ['accountant', 'super_admin']));

      // Dispatcher blocked from finance
      assert.throws(
        () => requireRole('dispatcher', ['accountant', 'super_admin']),
        /Security Violation: Role 'dispatcher' is not authorized/
      );
    });

    it('should throw SecurityAccessDeniedError when customer accesses another customer invoice (IDOR)', () => {
      const ownInvoice = { customerId: 'customer-1' };
      const otherInvoice = { customerId: 'customer-2' };

      assert.doesNotThrow(() =>
        requireOwnership('customer', 'customer-1', 'invoice', ownInvoice)
      );

      assert.throws(
        () => requireOwnership('customer', 'customer-1', 'invoice', otherInvoice),
        /Security Violation \(IDOR\): Access to invoice denied for user customer-1 \(customer\)/
      );
    });

    it('should throw SecurityAccessDeniedError when technician accesses another technician work order', () => {
      const assignedOrder = { assignedTechnicianId: 'tech-lead-1' };
      const otherOrder = { assignedTechnicianId: 'tech-lead-2' };

      assert.doesNotThrow(() =>
        requireOwnership('technician_in_charge', 'tech-lead-1', 'work_order', assignedOrder)
      );

      assert.throws(
        () => requireOwnership('technician_in_charge', 'tech-lead-1', 'work_order', otherOrder),
        /Security Violation \(IDOR\): Access to work_order denied for user tech-lead-1 \(technician_in_charge\)/
      );
    });
  });

  describe('5. Acceptance Check Verification Matrix', () => {
    it('should strictly prevent an accountant from changing a work order status', () => {
      assert.strictEqual(hasPermission('accountant', 'work_orders:status_transition'), false);
    });

    it('should strictly prevent a dispatcher from seeing finance (PnL, profitability, refunds)', () => {
      assert.strictEqual(hasPermission('dispatcher', 'finance:view_pnl'), false);
      assert.strictEqual(hasPermission('dispatcher', 'finance:view_profitability'), false);
      assert.strictEqual(hasPermission('dispatcher', 'payments:process_refund'), false);
    });

    it('should enforce role x action boundary across all roles', () => {
      const allRoles: SecurityRole[] = [
        'customer',
        'technician_helper',
        'technician_in_charge',
        'dispatcher',
        'storekeeper',
        'accountant',
        'ops_manager',
        'super_admin',
      ];

      for (const role of allRoles) {
        if (role === 'super_admin') {
          assert.strictEqual(hasPermission(role, 'finance:view_pnl'), true);
          assert.strictEqual(hasPermission(role, 'work_orders:delete'), true);
        } else if (role === 'accountant') {
          assert.strictEqual(hasPermission(role, 'finance:view_pnl'), true);
          assert.strictEqual(hasPermission(role, 'work_orders:assign'), false);
        } else if (role === 'dispatcher') {
          assert.strictEqual(hasPermission(role, 'work_orders:assign'), true);
          assert.strictEqual(hasPermission(role, 'finance:view_pnl'), false);
        } else if (role === 'customer') {
          assert.strictEqual(hasPermission(role, 'work_orders:read_all'), false);
          assert.strictEqual(hasPermission(role, 'finance:view_pnl'), false);
        }
      }
    });
  });
});
