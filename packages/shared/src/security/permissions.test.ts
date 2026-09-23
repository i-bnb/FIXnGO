import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  hasPermission,
  canAccessWorkOrder,
  canAccessInvoice,
  canTrackTechnicianLocation,
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
});
