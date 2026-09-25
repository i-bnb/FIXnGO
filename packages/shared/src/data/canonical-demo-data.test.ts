import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CANONICAL_CUSTOMERS,
  CANONICAL_WORK_ORDERS,
  CANONICAL_INVENTORY,
  CANONICAL_RENTAL_FLEET,
  CANONICAL_TECHNICIANS,
  getCanonicalMetrics,
  getCanonicalCategoryBreakdown,
  maskPhone,
  maskEmail,
  formatTimer,
} from './canonical-demo-data';

describe('Single Source of Truth: Canonical Dataset & Dashboard Invariant Verification', () => {
  it('should have exactly 60 fictional customers with no real names/phones/TRNs', () => {
    assert.strictEqual(CANONICAL_CUSTOMERS.length, 60);
    for (const c of CANONICAL_CUSTOMERS) {
      assert.strictEqual(c.email, 'test@i-bnb.com');
      assert.strictEqual(c.phone, 'xxxxxxxxx');
      assert.ok(c.trn.includes('(demo)'), `TRN must explicitly indicate demo: ${c.trn}`);
      assert.ok(!c.name.includes('Emaar') && !c.name.includes('Sobha') && !c.name.includes('Arabtec'), `No real corporate entities allowed: ${c.name}`);
    }
  });

  it('should have exactly 400 work orders over 6 months in format WO-2026-00xxx', () => {
    assert.strictEqual(CANONICAL_WORK_ORDERS.length, 400);
    for (let i = 0; i < CANONICAL_WORK_ORDERS.length; i++) {
      const wo = CANONICAL_WORK_ORDERS[i];
      const expected = `WO-2026-${(i + 1).toString().padStart(5, '0')}`;
      assert.strictEqual(wo.orderNumber, expected, 'Work order numbering must strictly follow 5-digit padded format');
      assert.ok(wo.subtotalAed > 0, 'Subtotal must be positive');
      assert.strictEqual(Math.round((wo.subtotalAed + wo.vatAmountAed) * 100) / 100, wo.totalAed, 'VAT calculation must balance');
    }
  });

  it('should have exactly 200 inventory items and 40 rental units', () => {
    assert.strictEqual(CANONICAL_INVENTORY.length, 200);
    assert.strictEqual(CANONICAL_RENTAL_FLEET.length, 40);
  });

  it('should verify technician list contains no real person names like Hasan Al-Banna', () => {
    assert.strictEqual(CANONICAL_TECHNICIANS.length, 5);
    const names = CANONICAL_TECHNICIANS.map((t) => t.name.toLowerCase());
    assert.ok(!names.some((n) => n.includes('hasan al-banna') || n.includes('banna')), 'Must not contain Hasan Al-Banna');
    assert.ok(names.some((n) => n.includes('tariq al-mansoor')), 'Lead Plumber must be Tariq Al-Mansoor');
  });

  it('should verify Single Source of Truth: Dashboard totals exactly equal list/category totals for Sep 2026', () => {
    const metrics = getCanonicalMetrics('SEP');
    const breakdown = getCanonicalCategoryBreakdown('SEP');

    const totalCategoryCount = breakdown.reduce((sum, c) => sum + c.count, 0);
    assert.strictEqual(metrics.totalOrders, totalCategoryCount, 'Dashboard total orders must equal sum of category ticket counts');

    // Labour supply is included in revenue breakdown
    const labourCat = breakdown.find((c) => c.type === 'LABOUR_SUPPLY');
    assert.ok(labourCat !== undefined, 'Labour supply must be represented as a service line');
    assert.ok(labourCat.count > 0, 'Labour supply must have allocated orders');
  });

  it('should format stopwatch timers strictly as h:mm:ss', () => {
    assert.strictEqual(formatTimer(4120), '1:08:40', 'Timer must format as h:mm:ss without leading zeroes on single digit hours');
    assert.strictEqual(formatTimer(3600), '1:00:00');
    assert.strictEqual(formatTimer(59), '0:00:59');
  });

  it('should mask phone and email addresses in list views', () => {
    assert.strictEqual(maskPhone('+971 50 000 0111'), 'xxxxxxxxx');
    assert.strictEqual(maskEmail('contact@palmcrest.example'), 'test@i-bnb.com');
  });
});
