import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { calculateUaeVat } from './vat.util';
import { calculateDistanceKm, estimateEtaMinutes } from './distance.util';

describe('UAE VAT & Geospatial Utilities', () => {
  it('should accurately calculate 5% VAT for UAE invoices without floating point drift', () => {
    const res1 = calculateUaeVat(100.0);
    assert.strictEqual(res1.subtotal, 100.0);
    assert.strictEqual(res1.vatRate, 0.05);
    assert.strictEqual(res1.vatAmount, 5.0);
    assert.strictEqual(res1.totalAmount, 105.0);

    // Test with fractional amount: 365.0 AED
    const res2 = calculateUaeVat(365.0);
    assert.strictEqual(res2.subtotal, 365.0);
    assert.strictEqual(res2.vatAmount, 18.25);
    assert.strictEqual(res2.totalAmount, 383.25);

    // Test with small cents: 19.99 AED -> VAT 1.00 AED
    const res3 = calculateUaeVat(19.99);
    assert.strictEqual(res3.vatAmount, 1.0);
    assert.strictEqual(res3.totalAmount, 20.99);
  });

  it('should compute distance between Downtown Dubai and Business Bay correctly (~2-3 km)', () => {
    // Downtown: 25.1972, 55.2744
    // Business Bay: 25.1856, 55.2708
    const distanceKm = calculateDistanceKm(25.1972, 55.2744, 25.1856, 55.2708);
    assert.ok(distanceKm > 1.0 && distanceKm < 3.0, `Distance should be ~1.3-2.0 km, got ${distanceKm}`);
  });

  it('should estimate realistic ETA in minutes based on UAE traffic', () => {
    const eta = estimateEtaMinutes(10); // 10 km at 40 km/h is 15 minutes
    assert.strictEqual(eta, 15);

    const closeEta = estimateEtaMinutes(0.5);
    assert.strictEqual(closeEta, 5); // Minimum threshold
  });
});
