import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UAE_CONSTANTS, CreateServiceBookingSchema, ServiceType } from './index';

describe('Shared Package Validation & UAE Rules', () => {
  it('should have standard UAE VAT 5% and valid TRN', () => {
    assert.strictEqual(UAE_CONSTANTS.VAT_RATE, 0.05);
    assert.strictEqual(UAE_CONSTANTS.COMPANY_TRN, '100482910300003');
    assert.strictEqual(UAE_CONSTANTS.CURRENCY, 'AED');
  });

  it('should validate a correct customer service booking payload', () => {
    const validData = {
      serviceType: ServiceType.HVAC,
      title: 'AC Gas Refill',
      description: 'AC is blowing warm air in bedroom',
      isEmergency: true,
      scheduledDate: '2026-09-24',
      scheduledTimeSlot: '10:00 - 12:00',
      emirate: 'Dubai' as const,
      area: 'Downtown Dubai',
      address: 'Burj Crown Tower, Apt 1402',
      latitude: 25.1972,
      longitude: 55.2744,
      estimatedBaseAed: 180,
    };

    const result = CreateServiceBookingSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  it('should reject invalid coordinates outside UAE', () => {
    const invalidData = {
      serviceType: ServiceType.ELECTRICAL,
      title: 'Circuit failure',
      description: 'Breaker tripped',
      scheduledDate: '2026-09-24',
      emirate: 'Dubai' as const,
      area: 'Test',
      address: 'Nowhere',
      latitude: 10.0, // outside UAE
      longitude: 10.0, // outside UAE
      estimatedBaseAed: 100,
    };

    const result = CreateServiceBookingSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
  });
});
