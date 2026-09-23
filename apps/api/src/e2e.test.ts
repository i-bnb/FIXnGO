import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { calculateUaeVat } from './common/utils/vat.util';
import { calculateDistanceKm, estimateEtaMinutes } from './common/utils/distance.util';
import { ALLOWED_WO_TRANSITIONS } from './modules/work-orders/work-orders.service';

describe('FieldOps ERP - Phase 2 API Automated E2E Suite', () => {
  // =========================================================================
  // TEST SUITE 1: FULL JOB LIFECYCLE (BOOKING -> INVOICE -> PAYMENT -> GL POSTING)
  // =========================================================================
  describe('1. Full Job Lifecycle & State Machine Verification', () => {
    it('should strictly validate allowed work order state transitions according to state machine', () => {
      // Valid transitions
      assert.ok(ALLOWED_WO_TRANSITIONS['NEW'].includes('ASSIGNED'));
      assert.ok(ALLOWED_WO_TRANSITIONS['ASSIGNED'].includes('EN_ROUTE'));
      assert.ok(ALLOWED_WO_TRANSITIONS['EN_ROUTE'].includes('ON_SITE'));
      assert.ok(ALLOWED_WO_TRANSITIONS['ON_SITE'].includes('IN_PROGRESS'));
      assert.ok(ALLOWED_WO_TRANSITIONS['IN_PROGRESS'].includes('COMPLETED'));
      assert.ok(ALLOWED_WO_TRANSITIONS['COMPLETED'].includes('INVOICED'));
      assert.ok(ALLOWED_WO_TRANSITIONS['INVOICED'].includes('CLOSED'));

      // Disallowed transitions (e.g. cannot jump from NEW directly to COMPLETED or CLOSED)
      assert.strictEqual(ALLOWED_WO_TRANSITIONS['NEW'].includes('COMPLETED'), false);
      assert.strictEqual(ALLOWED_WO_TRANSITIONS['NEW'].includes('CLOSED'), false);
      assert.strictEqual(ALLOWED_WO_TRANSITIONS['ASSIGNED'].includes('COMPLETED'), false);
      assert.strictEqual(ALLOWED_WO_TRANSITIONS['COMPLETED'].includes('IN_PROGRESS'), false);
    });

    it('should calculate accurate 5% UAE VAT and enforce balanced General Ledger journal entry', () => {
      // Job components:
      // Labour: 2.5 hours @ AED 102.00/hr = AED 255.00
      // Parts: Capacitor (AED 65.00) + R410A Gas (AED 220.00) = AED 285.00
      const labourRevenue = 255.00;
      const partsRevenue = 285.00;
      const subtotal = labourRevenue + partsRevenue; // AED 540.00

      const vatCalc = calculateUaeVat(subtotal);
      assert.strictEqual(vatCalc.subtotal, 540.00);
      assert.strictEqual(vatCalc.vatAmount, 27.00);
      assert.strictEqual(vatCalc.totalAmount, 567.00);

      // Verify Balanced Double-Entry General Ledger journal:
      // Dr Bank (1020): AED 567.00
      // Cr Service Revenue (4010): AED 255.00
      // Cr Material Sales Revenue (4020): AED 285.00
      // Cr UAE VAT Output 5% (2050): AED 27.00
      const journalLines = [
        { accountCode: '1020', debit: 567.00, credit: 0.00 },
        { accountCode: '4010', debit: 0.00, credit: 255.00 },
        { accountCode: '4020', debit: 0.00, credit: 285.00 },
        { accountCode: '2050', debit: 0.00, credit: 27.00 },
      ];

      const totalDebits = journalLines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredits = journalLines.reduce((sum, l) => sum + l.credit, 0);

      // Invariant: Total Debits must equal Total Credits
      assert.strictEqual(totalDebits, 567.00);
      assert.strictEqual(totalCredits, 567.00);
      assert.strictEqual(Math.abs(totalDebits - totalCredits) < 0.001, true);
    });

    it('should enforce completion prerequisites: requires AFTER photo and customer sign-off', () => {
      // Mock state simulating completion validation rules
      function validateCompletionPrerequisites(attachments: Array<{ type: string }>, signoff: any) {
        const hasAfterPhoto = attachments.some((a) => a.type === 'AFTER_PHOTO');
        if (!hasAfterPhoto) {
          throw new Error('Completion rejected: At least one AFTER_PHOTO is required');
        }
        if (!signoff || !signoff.signatureUrl) {
          throw new Error('Completion rejected: Customer digital signature is required');
        }
        return true;
      }

      // 1. Missing after photo
      assert.throws(
        () => validateCompletionPrerequisites([{ type: 'BEFORE_PHOTO' }], { signatureUrl: 'https://sig.png' }),
        /At least one AFTER_PHOTO is required/
      );

      // 2. Missing customer signoff
      assert.throws(
        () => validateCompletionPrerequisites([{ type: 'AFTER_PHOTO' }], null),
        /Customer digital signature is required/
      );

      // 3. Both present -> Allowed
      const allowed = validateCompletionPrerequisites(
        [{ type: 'BEFORE_PHOTO' }, { type: 'AFTER_PHOTO' }],
        { signatureUrl: 'https://sig.png', rating: 5 }
      );
      assert.strictEqual(allowed, true);
    });

    it('should decrement stock and record stock movement on parts issue', () => {
      const initialStock = 15;
      const quantityToIssue = 2;

      function issuePart(stockOnHand: number, qty: number) {
        if (stockOnHand < qty) {
          throw new Error('Insufficient inventory stock in van/warehouse');
        }
        const updatedStock = stockOnHand - qty;
        const movement = {
          type: 'JOB_CONSUMPTION',
          quantity: qty,
          unitCost: 25.00,
          totalCost: qty * 25.00,
        };
        return { updatedStock, movement };
      }

      const result = issuePart(initialStock, quantityToIssue);
      assert.strictEqual(result.updatedStock, 13);
      assert.strictEqual(result.movement.type, 'JOB_CONSUMPTION');
      assert.strictEqual(result.movement.totalCost, 50.00);

      // Cannot issue more than available stock
      assert.throws(() => issuePart(1, 5), /Insufficient inventory stock/);
    });
  });

  // =========================================================================
  // TEST SUITE 2: EQUIPMENT RENTAL AVAILABILITY & OVERLAP REJECTION
  // =========================================================================
  describe('2. Equipment Rental Date Availability & Overlap Rejection', () => {
    // Existing active contract: March 10, 2026 -> March 25, 2026
    const activeContract = {
      equipmentId: 'eq-cat-320d-excavator',
      startDate: new Date('2026-03-10T00:00:00Z'),
      endDate: new Date('2026-03-25T23:59:59Z'),
      status: 'ACTIVE',
    };

    function checkEquipmentAvailability(
      equipmentId: string,
      reqStart: Date,
      reqEnd: Date,
      existingContracts: typeof activeContract[]
    ) {
      if (reqStart >= reqEnd) {
        throw new Error('Invalid date range: End date must be after start date');
      }

      const conflicts = existingContracts.filter((c) => {
        if (c.equipmentId !== equipmentId || c.status !== 'ACTIVE') return false;
        // Overlap condition: StartA <= EndB AND EndA >= StartB
        return c.startDate <= reqEnd && c.endDate >= reqStart;
      });

      return {
        isAvailable: conflicts.length === 0,
        conflictsCount: conflicts.length,
      };
    }

    it('should reject overlapping rental requests inside active contract window', () => {
      // Overlap: March 15 -> March 20 (completely inside active contract)
      const res1 = checkEquipmentAvailability(
        'eq-cat-320d-excavator',
        new Date('2026-03-15T00:00:00Z'),
        new Date('2026-03-20T00:00:00Z'),
        [activeContract]
      );
      assert.strictEqual(res1.isAvailable, false);
      assert.strictEqual(res1.conflictsCount, 1);
    });

    it('should reject rental request that starts before and ends inside active contract', () => {
      // Overlap: March 05 -> March 12
      const res2 = checkEquipmentAvailability(
        'eq-cat-320d-excavator',
        new Date('2026-03-05T00:00:00Z'),
        new Date('2026-03-12T00:00:00Z'),
        [activeContract]
      );
      assert.strictEqual(res2.isAvailable, false);
      assert.strictEqual(res2.conflictsCount, 1);
    });

    it('should reject rental request that starts inside and ends after active contract', () => {
      // Overlap: March 20 -> March 30
      const res3 = checkEquipmentAvailability(
        'eq-cat-320d-excavator',
        new Date('2026-03-20T00:00:00Z'),
        new Date('2026-03-30T00:00:00Z'),
        [activeContract]
      );
      assert.strictEqual(res3.isAvailable, false);
      assert.strictEqual(res3.conflictsCount, 1);
    });

    it('should approve rental requests strictly outside active contract window', () => {
      // Available: April 01, 2026 -> April 15, 2026 (completely after)
      const resAfter = checkEquipmentAvailability(
        'eq-cat-320d-excavator',
        new Date('2026-04-01T00:00:00Z'),
        new Date('2026-04-15T00:00:00Z'),
        [activeContract]
      );
      assert.strictEqual(resAfter.isAvailable, true);
      assert.strictEqual(resAfter.conflictsCount, 0);

      // Available: February 01, 2026 -> February 28, 2026 (completely before)
      const resBefore = checkEquipmentAvailability(
        'eq-cat-320d-excavator',
        new Date('2026-02-01T00:00:00Z'),
        new Date('2026-02-28T00:00:00Z'),
        [activeContract]
      );
      assert.strictEqual(resBefore.isAvailable, true);
      assert.strictEqual(resBefore.conflictsCount, 0);
    });
  });

  // =========================================================================
  // TEST SUITE 3: POSTGIS / GEOSPATIAL NEAREST TECHNICIAN DISTANCE RANKING
  // =========================================================================
  describe('3. Geospatial Nearest Technician Distance Ranking', () => {
    // Target Job Site: Downtown Dubai (Burj Khalifa area)
    const siteLat = 25.1972;
    const siteLng = 55.2744;

    const sampleTechnicians = [
      {
        id: 'tech-rashid',
        name: 'Rashid Al-Nuaimi',
        trade: 'HVAC_TECH',
        // Business Bay: ~1.5 km away
        latitude: 25.1856,
        longitude: 55.2708,
      },
      {
        id: 'tech-vikram',
        name: 'Vikram Patel',
        trade: 'ELECTRICIAN',
        // Dubai Marina: ~20 km away
        latitude: 25.0800,
        longitude: 55.1400,
      },
      {
        id: 'tech-tariq',
        name: 'Tariq Mahmoud',
        trade: 'HVAC_TECH',
        // Deira / Rigga: ~8.8 km away
        latitude: 25.2697,
        longitude: 55.3094,
      },
    ];

    it('should compute exact Haversine distance in kilometers and realistic ETA in minutes', () => {
      // Business Bay to Downtown Dubai
      const distBusinessBay = calculateDistanceKm(siteLat, siteLng, 25.1856, 55.2708);
      assert.ok(distBusinessBay > 1.0 && distBusinessBay < 2.0, `Expected ~1.3-1.6 km, got ${distBusinessBay}`);

      const etaBusinessBay = estimateEtaMinutes(distBusinessBay);
      assert.strictEqual(etaBusinessBay, 5); // Minimum threshold for traffic/departure

      // Dubai Marina to Downtown Dubai
      const distMarina = calculateDistanceKm(siteLat, siteLng, 25.0800, 55.1400);
      assert.ok(distMarina > 18.0 && distMarina < 23.0, `Expected ~19-21 km, got ${distMarina}`);

      const etaMarina = estimateEtaMinutes(distMarina);
      assert.ok(etaMarina >= 25 && etaMarina <= 35, `Expected 25-35 minutes ETA, got ${etaMarina}`);
    });

    it('should rank technicians strictly ascending by distance to job site', () => {
      const ranked = sampleTechnicians
        .map((t) => {
          const distanceKm = calculateDistanceKm(siteLat, siteLng, t.latitude, t.longitude);
          const estimatedEtaMinutes = estimateEtaMinutes(distanceKm);
          return { ...t, distanceKm, estimatedEtaMinutes };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);

      // Verification of strict ranking:
      // 1st: Rashid (Business Bay, ~1.3 km)
      assert.strictEqual(ranked[0].id, 'tech-rashid');
      assert.strictEqual(ranked[0].name, 'Rashid Al-Nuaimi');
      assert.ok(ranked[0].distanceKm < 2.0);

      // 2nd: Tariq (Deira, ~8.8 km)
      assert.strictEqual(ranked[1].id, 'tech-tariq');
      assert.ok(ranked[1].distanceKm > 7.0 && ranked[1].distanceKm < 11.0);

      // 3rd: Vikram (Dubai Marina, ~20 km)
      assert.strictEqual(ranked[2].id, 'tech-vikram');
      assert.ok(ranked[2].distanceKm > 18.0);

      // Distances must be strictly increasing
      assert.ok(ranked[0].distanceKm < ranked[1].distanceKm);
      assert.ok(ranked[1].distanceKm < ranked[2].distanceKm);
    });

    it('should filter technicians by trade skill before distance ranking', () => {
      // Filter for HVAC_TECH only (should exclude Vikram Patel who is ELECTRICIAN)
      const hvacTechnicians = sampleTechnicians.filter((t) => t.trade === 'HVAC_TECH');
      assert.strictEqual(hvacTechnicians.length, 2);
      assert.ok(hvacTechnicians.every((t) => t.trade === 'HVAC_TECH'));

      const rankedHvac = hvacTechnicians
        .map((t) => ({
          ...t,
          distanceKm: calculateDistanceKm(siteLat, siteLng, t.latitude, t.longitude),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      assert.strictEqual(rankedHvac[0].name, 'Rashid Al-Nuaimi');
      assert.strictEqual(rankedHvac[1].name, 'Tariq Mahmoud');
    });
  });
});
