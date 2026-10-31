import { describe, it, expect } from 'vitest';
import { getEventStatus } from '../lib/status';
import { STATUS_TYPES } from '../lib/constants';

describe('Smart Priority System (getEventStatus)', () => {
  // Base reference time: 2026-10-31 12:00:00 (Asia/Kolkata)
  // 2026-10-31T12:00:00+05:30 -> UTC is 2026-10-31T06:30:00Z
  const mockNow = new Date('2026-10-31T06:30:00Z');

  it('1. Returns URGENT for an event happening today', () => {
    const event = {
      date: '2026-10-31',
      startTime: '14:00',
      endTime: '17:00',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.URGENT);
    expect(result.isToday).toBe(true);
  });

  it('2. Returns URGENT for an event starting in 23 hours', () => {
    // Current time is 12:00 on Oct 31.
    // 23 hours later is 11:00 on Nov 1.
    const event = {
      date: '2026-11-01',
      startTime: '11:00',
      endTime: '13:00',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.URGENT);
  });

  it('3. Returns UPCOMING for an event starting in 25 hours', () => {
    // Current time is 12:00 on Oct 31.
    // 25 hours later is 13:00 on Nov 1.
    const event = {
      date: '2026-11-01',
      startTime: '13:00',
      endTime: '15:00',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.UPCOMING);
  });

  it('4. Returns EXPIRED for a past event', () => {
    const event = {
      date: '2026-10-25',
      startTime: '10:00',
      endTime: '12:00',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.EXPIRED);
  });

  it('5. Returns DATE_UNCONFIRMED when date is null', () => {
    const event = {
      date: null,
      startTime: '10:00',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.DATE_UNCONFIRMED);
  });

  it('6. Returns DATE_UNCONFIRMED when date is marked unconfirmed or ambiguous', () => {
    const event = {
      date: '2026-11-10',
      startTime: '10:00',
      dateConfirmed: false
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.DATE_UNCONFIRMED);
  });

  it('7. Handles date-only events as all-day events', () => {
    // Tomorrow all day: starting 00:00 on Nov 1 is in 12 hours -> URGENT
    const eventTomorrow = {
      date: '2026-11-01',
      startTime: null,
      endTime: null,
      dateConfirmed: true
    };
    const resultTomorrow = getEventStatus(eventTomorrow, mockNow);
    expect(resultTomorrow.status).toBe(STATUS_TYPES.URGENT);

    // Event 5 days later all day -> UPCOMING
    const eventLater = {
      date: '2026-11-05',
      startTime: null,
      endTime: null,
      dateConfirmed: true
    };
    const resultLater = getEventStatus(eventLater, mockNow);
    expect(resultLater.status).toBe(STATUS_TYPES.UPCOMING);
  });

  it('8. Returns URGENT when open deadline is in 10 hours even if event is in the future', () => {
    // Event is on Nov 10, but deadline is tonight at 22:00 (10 hours away)
    const event = {
      date: '2026-11-10',
      startTime: '10:00',
      endTime: '12:00',
      registrationDeadline: '2026-10-31T22:00',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.URGENT);
    expect(result.registrationClosed).toBe(false);
  });

  it('9. Sets registrationClosed true if deadline passed while event is still in future', () => {
    // Event is Nov 10 (UPCOMING), but deadline was yesterday (Oct 30)
    const event = {
      date: '2026-11-10',
      startTime: '10:00',
      endTime: '12:00',
      registrationDeadline: '2026-10-30T23:59',
      dateConfirmed: true
    };
    const result = getEventStatus(event, mockNow);
    expect(result.status).toBe(STATUS_TYPES.UPCOMING);
    expect(result.registrationClosed).toBe(true);
  });

  it('10. Handles midnight boundaries cleanly without off-by-one errors', () => {
    // Current time at 23:59:00 on Oct 31
    const lateNightNow = new Date('2026-10-31T18:29:00Z'); // 23:59 IST

    // Event starting tomorrow at 00:01 (2 minutes away)
    const eventMidnight = {
      date: '2026-11-01',
      startTime: '00:01',
      endTime: '02:00',
      dateConfirmed: true
    };
    const result = getEventStatus(eventMidnight, lateNightNow);
    expect(result.status).toBe(STATUS_TYPES.URGENT);
  });
});

