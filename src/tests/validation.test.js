import { describe, it, expect } from 'vitest';
import { isValidCalendarDate, parseDateString } from '../lib/dateUtils';
import { sanitizeExtractedEvent } from '../../api/_lib/validation';

describe('Validation and Edge Cases Checklist', () => {
  it('1. Validates real Gregorian calendar dates', () => {
    expect(isValidCalendarDate('2026-10-31')).toBe(true);
    expect(isValidCalendarDate('2026-02-28')).toBe(true);
    // 2026 is not a leap year, Feb 29 is invalid
    expect(isValidCalendarDate('2026-02-29')).toBe(false);
    // 2028 is a leap year
    expect(isValidCalendarDate('2028-02-29')).toBe(true);
    // Invalid months or days
    expect(isValidCalendarDate('2026-04-31')).toBe(false); // April has 30 days
    expect(isValidCalendarDate('2026-13-01')).toBe(false);
    expect(isValidCalendarDate('invalid-date')).toBe(false);
    expect(isValidCalendarDate(null)).toBe(false);
  });

  it('2. Enforces non-empty title in sanitizer', () => {
    const raw = {
      title: '   ',
      category: 'Workshops'
    };
    const sanitized = sanitizeExtractedEvent(raw);
    expect(sanitized.title).toBe('Untitled Notice Event');
  });

  it('3. Strips unknown fields from AI output', () => {
    const raw = {
      title: 'Valid Event',
      category: 'Academic',
      maliciousField: '<script>alert(1)</script>',
      injectedData: { secret: 123 }
    };
    const sanitized = sanitizeExtractedEvent(raw);
    expect(sanitized.maliciousField).toBeUndefined();
    expect(sanitized.injectedData).toBeUndefined();
  });

  it('4. Pads 1-digit hours to strict 24h HH:mm', () => {
    const raw = {
      title: 'Workshop',
      category: 'Workshops',
      startTime: '9:30',
      endTime: '17:00'
    };
    const sanitized = sanitizeExtractedEvent(raw);
    expect(sanitized.startTime).toBe('09:30');
    expect(sanitized.endTime).toBe('17:00');
  });
});

