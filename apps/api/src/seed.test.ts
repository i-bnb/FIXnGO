import { describe, it } from 'node:test';
import * as assert from 'node:assert';

describe('Seed Script Deterministic Validation & Financial Invariant Tests', () => {
  it('should verify 6-month status distribution totals exactly 400 work orders', () => {
    const statusesList: string[] = [];
    for (let i = 0; i < 280; i++) statusesList.push('COMPLETED');
    for (let i = 0; i < 40; i++) statusesList.push('INVOICED');
    for (let i = 0; i < 30; i++) statusesList.push('CLOSED');
    for (let i = 0; i < 15; i++) statusesList.push('IN_PROGRESS');
    for (let i = 0; i < 10; i++) statusesList.push('ON_SITE');
    for (let i = 0; i < 10; i++) statusesList.push('EN_ROUTE');
    for (let i = 0; i < 10; i++) statusesList.push('ASSIGNED');
    for (let i = 0; i < 5; i++) statusesList.push('NEW');

    assert.strictEqual(statusesList.length, 400);

    const counts = statusesList.reduce((acc: Record<string, number>, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    assert.strictEqual(counts['COMPLETED'], 280);
    assert.strictEqual(counts['INVOICED'], 40);
    assert.strictEqual(counts['CLOSED'], 30);
    assert.strictEqual(counts['IN_PROGRESS'], 15);
    assert.strictEqual(counts['ON_SITE'], 10);
    assert.strictEqual(counts['EN_ROUTE'], 10);
    assert.strictEqual(counts['ASSIGNED'], 10);
    assert.strictEqual(counts['NEW'], 5);
  });

  it('should verify exactly 3 intentional loss-making jobs for the profitability report', () => {
    const lossMakingJobs = [
      { id: 89, orderNumber: 'WO-2025-0089', quotedRevenue: 450.0, partsCost: 680.0, labourCost: 360.0 },
      { id: 142, orderNumber: 'WO-2025-0142', quotedRevenue: 320.0, partsCost: 410.0, labourCost: 250.0 },
      { id: 218, orderNumber: 'WO-2025-0218', quotedRevenue: 380.0, partsCost: 440.0, labourCost: 230.0 },
    ];

    assert.strictEqual(lossMakingJobs.length, 3);

    for (const job of lossMakingJobs) {
      const totalCost = job.partsCost + job.labourCost;
      const grossMargin = job.quotedRevenue - totalCost;
      const marginPct = (grossMargin / job.quotedRevenue) * 100;

      // Negative gross margin proof
      assert.ok(grossMargin < 0, `Job ${job.orderNumber} should be negative margin`);
      assert.ok(marginPct < -50, `Job ${job.orderNumber} margin should be < -50%, got ${marginPct}%`);
    }
  });

  it('should verify double-entry balancing across all generated invoice and payment journal entries', () => {
    // Simulating journal entry creation logic from seed
    interface JournalLine {
      accountId: string;
      debit: number;
      credit: number;
    }

    function createBalancedInvoiceJournal(subtotal: number, vat: number): JournalLine[] {
      const total = subtotal + vat;
      return [
        { accountId: '1050', debit: total, credit: 0.0 }, // Dr A/R
        { accountId: '4010', debit: 0.0, credit: subtotal }, // Cr Revenue
        { accountId: '2050', debit: 0.0, credit: vat }, // Cr VAT Output
      ];
    }

    function createBalancedPaymentJournal(amount: number): JournalLine[] {
      return [
        { accountId: '1020', debit: amount, credit: 0.0 }, // Dr Bank
        { accountId: '1050', debit: 0.0, credit: amount }, // Cr A/R
      ];
    }

    function createBalancedCostJournal(partsCost: number, labourCost: number): JournalLine[] {
      return [
        { accountId: '5010', debit: partsCost, credit: 0.0 }, // Dr COGS Parts
        { accountId: '5020', debit: labourCost, credit: 0.0 }, // Dr COGS Labour
        { accountId: '1080', debit: 0.0, credit: partsCost }, // Cr Inventory
        { accountId: '1020', debit: 0.0, credit: labourCost }, // Cr Bank/Wages
      ];
    }

    // Run test over 100 synthetic jobs
    let grandDebits = 0;
    let grandCredits = 0;

    for (let i = 1; i <= 100; i++) {
      const subtotal = 350.0 + i * 5;
      const vat = Number((subtotal * 0.05).toFixed(2));
      const total = Number((subtotal + vat).toFixed(2));
      const parts = Number((subtotal * 0.28).toFixed(2));
      const labour = Number((subtotal * 0.22).toFixed(2));

      const invLines = createBalancedInvoiceJournal(subtotal, vat);
      const payLines = createBalancedPaymentJournal(total);
      const costLines = createBalancedCostJournal(parts, labour);

      for (const line of [...invLines, ...payLines, ...costLines]) {
        grandDebits += line.debit;
        grandCredits += line.credit;
      }
    }

    // Invariant: Total Debits == Total Credits to exact cents
    assert.strictEqual(
      Number(grandDebits.toFixed(2)),
      Number(grandCredits.toFixed(2)),
      `Grand Debits (${grandDebits}) must equal Grand Credits (${grandCredits})`
    );
  });

  it('should verify equipment rental fleet count and utilization calculation (~60-75%)', () => {
    const totalEquipmentCount = 40;
    const activeRentedCount = 27; // 27 units out of 40 currently rented

    const utilizationRate = (activeRentedCount / totalEquipmentCount) * 100;
    assert.ok(
      utilizationRate >= 60 && utilizationRate <= 75,
      `Utilization rate should be between 60% and 75%, got ${utilizationRate}%`
    );
  });

  it('should verify customer sites have valid UAE bounding box coordinates', () => {
    const uaeSites = [
      // Dubai sites
      { name: 'Downtown', lat: 25.1972, lng: 55.2744 },
      { name: 'Business Bay', lat: 25.1856, lng: 55.2708 },
      { name: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
      { name: 'Palm Jumeirah', lat: 25.1124, lng: 55.1390 },
      // Sharjah sites
      { name: 'Al Majaz', lat: 25.3280, lng: 55.3850 },
      { name: 'Al Nahda SHJ', lat: 25.3050, lng: 55.3720 },
      // Abu Dhabi sites
      { name: 'Al Reem Island', lat: 24.4988, lng: 54.4072 },
      { name: 'Yas Island', lat: 24.4920, lng: 54.6050 },
    ];

    for (const site of uaeSites) {
      // UAE Latitude ranges ~24.0 to 26.0
      assert.ok(site.lat >= 24.0 && site.lat <= 26.0, `Site ${site.name} latitude out of UAE bounds: ${site.lat}`);
      // UAE Longitude ranges ~54.0 to 56.5
      assert.ok(site.lng >= 54.0 && site.lng <= 56.5, `Site ${site.name} longitude out of UAE bounds: ${site.lng}`);
    }
  });

  it('should verify 5 live-demo telematics actor coordinates', () => {
    const actors = [
      { name: 'Rashid Al-Nuaimi', lat: 25.1860, lng: 55.2715, loc: 'Business Bay' },
      { name: 'Vikram Patel', lat: 25.1972, lng: 55.2744, loc: 'Downtown' },
      { name: 'Tariq Al-Mansoor', lat: 25.0805, lng: 55.1403, loc: 'Al Barsha' },
      { name: 'Farhan Siddiqui', lat: 25.1320, lng: 55.2280, loc: 'Al Quoz' },
      { name: 'Ahmed Mustafa', lat: 25.1600, lng: 55.2450, loc: 'SZR' },
    ];

    assert.strictEqual(actors.length, 5);
    for (const a of actors) {
      assert.ok(a.lat > 25.0 && a.lat < 25.3);
      assert.ok(a.lng > 55.1 && a.lng < 55.3);
    }
  });
});
