import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getDubaiHour,
  getDubaiGreeting,
  formatDubaiLiveDate,
  formatDubaiTime,
  formatRelativeDubaiTime,
} from './datetime';

describe('R4: ONE TIMEZONE ENGINE - Unit Tests', () => {
  it('1. Computes exact Dubai hour (UTC+4)', () => {
    // 2026-09-25T08:00:00Z is 12:00 in Dubai (UTC+4)
    const dateUtc = new Date('2026-09-25T08:00:00Z');
    assert.strictEqual(getDubaiHour(dateUtc), 12);

    // 2026-09-25T03:00:00Z is 07:00 in Dubai
    const morningDate = new Date('2026-09-25T03:00:00Z');
    assert.strictEqual(getDubaiHour(morningDate), 7);
  });

  it('2. Returns dynamic greeting based on Dubai local hour', () => {
    // 03:00 UTC = 07:00 Dubai -> Morning
    const morning = new Date('2026-09-25T03:00:00Z');
    assert.strictEqual(getDubaiGreeting('en', morning), 'Good morning');
    assert.strictEqual(getDubaiGreeting('ar', morning), 'صباح الخير');

    // 09:00 UTC = 13:00 Dubai -> Afternoon
    const afternoon = new Date('2026-09-25T09:00:00Z');
    assert.strictEqual(getDubaiGreeting('en', afternoon), 'Good afternoon');
    assert.strictEqual(getDubaiGreeting('ar', afternoon), 'مساء الخير');

    // 16:00 UTC = 20:00 Dubai -> Evening
    const evening = new Date('2026-09-25T16:00:00Z');
    assert.strictEqual(getDubaiGreeting('en', evening), 'Good evening');
    assert.strictEqual(getDubaiGreeting('ar', evening), 'مساء الخير');
  });

  it('3. Formats live date banner in Asia/Dubai en-AE and ar-AE', () => {
    const d = new Date('2026-09-25T10:00:00Z');
    const enLive = formatDubaiLiveDate(d, 'en');
    assert.ok(enLive.includes('25'));
    assert.ok(enLive.includes('2026'));

    const arLive = formatDubaiLiveDate(d, 'ar');
    assert.ok(arLive.length > 0);
  });

  it('4. Formats time in Asia/Dubai', () => {
    // 08:30 UTC = 12:30 Dubai
    const d = new Date('2026-09-25T08:30:00Z');
    const time24 = formatDubaiTime(d, 'en', true);
    assert.strictEqual(time24, '12:30');
  });

  it('5. Computes relative Dubai time accurately', () => {
    const base = new Date('2026-09-25T12:00:00Z');
    const past5m = new Date('2026-09-25T11:55:00Z');
    const future15m = new Date('2026-09-25T12:15:00Z');

    assert.strictEqual(formatRelativeDubaiTime(past5m, base, 'en'), '5 min ago');
    assert.strictEqual(formatRelativeDubaiTime(future15m, base, 'en'), 'in 15 min');
  });
});
