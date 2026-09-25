import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  aedToFils,
  filsToAed,
  formatAed,
  roundMinutesUp,
  calculateLabourItem,
  calculatePricing,
} from './pricing';

describe('R2: ONE MONEY ENGINE - Pricing Unit Tests', () => {
  it('1. Converts AED to exact integer fils and fils back to AED', () => {
    assert.strictEqual(aedToFils(150.25), 15025);
    assert.strictEqual(aedToFils(0), 0);
    assert.strictEqual(aedToFils(0.01), 1);
    assert.strictEqual(filsToAed(15025), 150.25);
    assert.strictEqual(filsToAed(1), 0.01);
  });

  it('2. Rounds minutes up to nearest 15 minutes by default', () => {
    assert.strictEqual(roundMinutesUp(0), 0);
    assert.strictEqual(roundMinutesUp(5), 15);
    assert.strictEqual(roundMinutesUp(15), 15);
    assert.strictEqual(roundMinutesUp(16), 30);
    assert.strictEqual(roundMinutesUp(45), 45);
    assert.strictEqual(roundMinutesUp(46), 60);
    assert.strictEqual(roundMinutesUp(61), 75);
  });

  it('3. Supports configurable labour rounding interval (e.g. 30m or 1m)', () => {
    assert.strictEqual(roundMinutesUp(10, 30), 30);
    assert.strictEqual(roundMinutesUp(31, 30), 60);
    assert.strictEqual(roundMinutesUp(12, 1), 12);
  });

  it('4. Calculates labour billable hours and fils correctly with rounding', () => {
    // 40 minutes at 120 AED/hr with 15m rounding -> 45 minutes (0.75 hr) -> 90 AED (9000 fils)
    const result = calculateLabourItem({
      minutes: 40,
      hourlyRateAed: 120,
    });
    assert.strictEqual(result.billableMinutes, 45);
    assert.strictEqual(result.billableHours, 0.75);
    assert.strictEqual(result.labourFils, 9000);
    assert.strictEqual(result.labourAed, 90);
  });

  it('5. Calculates parts total in integer fils with quantity', () => {
    // 3 items @ 45.50 AED = 136.50 AED = 13650 fils
    const result = calculatePricing({
      parts: [{ quantity: 3, unitPriceAed: 45.50 }],
    });
    assert.strictEqual(result.partsFils, 13650);
    assert.strictEqual(result.partsAed, 136.50);
  });

  it('6. Calculates call-out fee and expenses addition', () => {
    const result = calculatePricing({
      callOutFeeAed: 100,
      expensesAed: 50.50,
    });
    assert.strictEqual(result.callOutFeeFils, 10000);
    assert.strictEqual(result.expensesFils, 5050);
    assert.strictEqual(result.subtotalFils, 15050);
  });

  it('7. Deducts discount before calculating VAT', () => {
    // Subtotal gross = 200 AED (20000 fils), Discount = 50 AED (5000 fils)
    // Net subtotal = 150 AED (15000 fils), 5% VAT = 7.50 AED (750 fils), Total = 157.50 AED (15750 fils)
    const result = calculatePricing({
      callOutFeeAed: 200,
      discountAed: 50,
    });
    assert.strictEqual(result.subtotalFils, 15000);
    assert.strictEqual(result.vatFils, 750);
    assert.strictEqual(result.totalFils, 15750);
    assert.strictEqual(result.totalAed, 157.50);
  });

  it('8. Applies percentage discount properly and caps discount to gross subtotal', () => {
    // 100 AED with 10% discount -> 90 AED subtotal, 5% VAT -> 4.50 AED, Total = 94.50 AED
    const result = calculatePricing({
      callOutFeeAed: 100,
      discountPercent: 10,
    });
    assert.strictEqual(result.discountFils, 1000);
    assert.strictEqual(result.subtotalFils, 9000);
    assert.strictEqual(result.vatFils, 450);
    assert.strictEqual(result.totalFils, 9450);

    // Over-discount capped to gross
    const capped = calculatePricing({
      callOutFeeAed: 100,
      discountAed: 500,
    });
    assert.strictEqual(capped.subtotalFils, 0);
    assert.strictEqual(capped.vatFils, 0);
    assert.strictEqual(capped.totalFils, 0);
  });

  it('9. Computes exact UAE 5% VAT without floating point precision issues', () => {
    // 33.33 AED subtotal -> 3333 fils * 5 / 100 = 166.65 -> rounds to 167 fils (1.67 AED)
    // Total = 3500 fils (35.00 AED)
    const result = calculatePricing({
      labourAed: 33.33,
    });
    assert.strictEqual(result.subtotalFils, 3333);
    assert.strictEqual(result.vatFils, 167);
    assert.strictEqual(result.totalFils, 3500);
    assert.strictEqual(result.vatAed, 1.67);
    assert.strictEqual(result.totalAed, 35.00);
  });

  it('10. Calculates comprehensive multi-item work order pricing invoice', () => {
    // Labour: 1 hr 10 min (rounds to 75m = 1.25 hr) @ 160 AED/hr = 200 AED (20000 fils)
    // Parts: 2 @ 125.50 AED = 251.00 AED (25100 fils)
    // Expenses: 25.00 AED (2500 fils)
    // Call-out fee: 100.00 AED (10000 fils)
    // Gross: 576.00 AED (57600 fils)
    // Discount: 50.00 AED (5000 fils)
    // Subtotal: 526.00 AED (52600 fils)
    // VAT 5%: 26.30 AED (2630 fils)
    // Total: 552.30 AED (55230 fils)
    const result = calculatePricing({
      labour: [{ minutes: 70, hourlyRateAed: 160 }],
      parts: [{ quantity: 2, unitPriceAed: 125.50 }],
      expenses: [{ amountAed: 25.00 }],
      callOutFeeAed: 100.00,
      discountAed: 50.00,
    });

    assert.strictEqual(result.labourFils, 20000);
    assert.strictEqual(result.partsFils, 25100);
    assert.strictEqual(result.expensesFils, 2500);
    assert.strictEqual(result.callOutFeeFils, 10000);
    assert.strictEqual(result.discountFils, 5000);
    assert.strictEqual(result.subtotalFils, 52600);
    assert.strictEqual(result.subtotalAed, 526.00);
    assert.strictEqual(result.vatFils, 2630);
    assert.strictEqual(result.vatAed, 26.30);
    assert.strictEqual(result.totalFils, 55230);
    assert.strictEqual(result.totalAed, 552.30);
  });

  it('11. Formats currency according to UAE conventions', () => {
    const formatted = formatAed(1234.5, false);
    assert.ok(formatted.includes('1,234.50'));
    assert.ok(formatted.endsWith('AED'));

    const fromFils = formatAed(123450, true);
    assert.ok(fromFils.includes('1,234.50'));
    assert.ok(fromFils.endsWith('AED'));
  });
});
