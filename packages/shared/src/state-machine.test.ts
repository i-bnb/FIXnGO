import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateWorkOrderTransition,
  validateQuoteTransition,
  InvalidStateTransitionError,
  UnauthorizedStateTransitionError,
} from './state-machine';

describe('R3: ONE STATE MACHINE - Unit Tests', () => {
  it('1. Allows legal work order progression: NEW -> QUOTED -> APPROVED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID -> CLOSED', () => {
    assert.doesNotThrow(() => validateWorkOrderTransition('NEW', 'QUOTED'));
    assert.doesNotThrow(() => validateWorkOrderTransition('QUOTED', 'APPROVED'));
    assert.doesNotThrow(() => validateWorkOrderTransition('APPROVED', 'ASSIGNED'));
    assert.doesNotThrow(() => validateWorkOrderTransition('ASSIGNED', 'EN_ROUTE'));
    assert.doesNotThrow(() => validateWorkOrderTransition('EN_ROUTE', 'ON_SITE'));
    assert.doesNotThrow(() => validateWorkOrderTransition('ON_SITE', 'IN_PROGRESS'));
    assert.doesNotThrow(() => validateWorkOrderTransition('IN_PROGRESS', 'COMPLETED'));
    assert.doesNotThrow(() => validateWorkOrderTransition('COMPLETED', 'INVOICED'));
    assert.doesNotThrow(() => validateWorkOrderTransition('INVOICED', 'PAID'));
    assert.doesNotThrow(() => validateWorkOrderTransition('PAID', 'CLOSED'));
  });

  it('2. Throws 409 InvalidStateTransitionError on illegal transitions', () => {
    // Cannot skip straight from NEW to COMPLETED
    assert.throws(
      () => validateWorkOrderTransition('NEW', 'COMPLETED'),
      (err: any) => err instanceof InvalidStateTransitionError && err.statusCode === 409,
    );

    // Cannot jump from QUOTED straight to ASSIGNED without APPROVED
    assert.throws(
      () => validateWorkOrderTransition('QUOTED', 'ASSIGNED'),
      (err: any) => err instanceof InvalidStateTransitionError && err.statusCode === 409,
    );

    // Cannot transition from CLOSED to any status
    assert.throws(
      () => validateWorkOrderTransition('CLOSED', 'IN_PROGRESS'),
      (err: any) => err instanceof InvalidStateTransitionError && err.statusCode === 409,
    );
  });

  it('3. Enforces role restrictions: customer cannot mark job ASSIGNED or COMPLETED', () => {
    assert.throws(
      () => validateWorkOrderTransition('APPROVED', 'ASSIGNED', 'CUSTOMER'),
      (err: any) => err instanceof UnauthorizedStateTransitionError && err.statusCode === 403,
    );
    assert.throws(
      () => validateWorkOrderTransition('IN_PROGRESS', 'COMPLETED', 'CUSTOMER'),
      (err: any) => err instanceof UnauthorizedStateTransitionError && err.statusCode === 403,
    );
  });

  it('4. Enforces role restrictions: technician cannot close or invoice or approve quotes', () => {
    assert.throws(
      () => validateWorkOrderTransition('COMPLETED', 'INVOICED', 'TECHNICIAN'),
      (err: any) => err instanceof UnauthorizedStateTransitionError && err.statusCode === 403,
    );
    assert.throws(
      () => validateQuoteTransition('SENT', 'APPROVED', 'TECHNICIAN'),
      (err: any) => err instanceof UnauthorizedStateTransitionError && err.statusCode === 403,
    );
  });

  it('5. Allows technician field progression: ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', () => {
    assert.doesNotThrow(() => validateWorkOrderTransition('ASSIGNED', 'EN_ROUTE', 'TECHNICIAN'));
    assert.doesNotThrow(() => validateWorkOrderTransition('EN_ROUTE', 'ON_SITE', 'TECHNICIAN'));
    assert.doesNotThrow(() => validateWorkOrderTransition('ON_SITE', 'IN_PROGRESS', 'TECHNICIAN'));
    assert.doesNotThrow(() => validateWorkOrderTransition('IN_PROGRESS', 'COMPLETED', 'TECHNICIAN'));
  });

  it('6. Allows customer to approve or reject SENT quotes', () => {
    assert.doesNotThrow(() => validateQuoteTransition('SENT', 'APPROVED', 'CUSTOMER'));
    assert.doesNotThrow(() => validateQuoteTransition('SENT', 'REJECTED', 'CUSTOMER'));
  });

  it('7. Throws 409 on invalid quote transition (e.g. DRAFT -> APPROVED without SENT)', () => {
    assert.throws(
      () => validateQuoteTransition('DRAFT', 'APPROVED'),
      (err: any) => err instanceof InvalidStateTransitionError && err.statusCode === 409,
    );
  });
});
