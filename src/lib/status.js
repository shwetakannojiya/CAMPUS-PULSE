import {
  getNowInTimezone,
  getEventTimestamp,
  parseDeadlineTimestamp,
  isDateToday
} from './dateUtils';
import { STATUS_TYPES } from './constants';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Computes deterministic status for an event at the given `now` moment.
 *
 * @param {Object} event - Event record
 * @param {Date|number|string|null} nowInput - Optional override for current time
 * @returns {Object} { status: 'URGENT'|'UPCOMING'|'EXPIRED'|'DATE_UNCONFIRMED', registrationClosed: boolean, isToday: boolean }
 */
export function getEventStatus(event, nowInput = null) {
  const { wallClock: nowWallClock } = getNowInTimezone(nowInput);
  const nowMs = nowWallClock.getTime();

  // Rule 1: Missing date OR unconfirmed / ambiguous date -> DATE_UNCONFIRMED
  if (!event || !event.date || event.dateConfirmed === false || event.isDateAmbiguous === true) {
    return {
      status: STATUS_TYPES.DATE_UNCONFIRMED,
      registrationClosed: false,
      isToday: false
    };
  }

  // Calculate event start and end timestamps
  // If no time is specified, it's all-day (00:00 to 23:59:59).
  // If start time exists but no end time, it ends at 23:59:59 on that day.
  const startMs = getEventTimestamp(event.date, event.startTime, 0, 0);
  const endMs = event.endTime
    ? getEventTimestamp(event.date, event.endTime, 23, 59)
    : getEventTimestamp(event.date, '23:59', 23, 59);

  // Parse registration deadline if provided
  const deadlineMs = event.registrationDeadline
    ? parseDeadlineTimestamp(event.registrationDeadline)
    : null;

  const isDeadlineOpen = deadlineMs !== null && deadlineMs >= nowMs;
  const isDeadlinePassed = deadlineMs !== null && deadlineMs < nowMs;

  // Deadline passed while event is still in the future
  const registrationClosed = isDeadlinePassed && endMs >= nowMs;

  // Check if today in timezone
  const isToday = isDateToday(event.date, nowWallClock);
  const isHappeningNow = nowMs >= startMs && nowMs <= endMs;

  // Rule 4: EXPIRED -> Event end has passed AND no registration deadline is in the future
  if (endMs < nowMs && !isDeadlineOpen) {
    return {
      status: STATUS_TYPES.EXPIRED,
      registrationClosed: false,
      isToday: false
    };
  }

  // Rule 5: URGENT ->
  // - Happening now or today
  // - Event start within the next 24 hours
  // - Open registration deadline within the next 24 hours
  const isStartWithin24h = startMs > nowMs && (startMs - nowMs) <= TWENTY_FOUR_HOURS_MS;
  const isDeadlineWithin24h = isDeadlineOpen && (deadlineMs - nowMs) <= TWENTY_FOUR_HOURS_MS;

  if (isHappeningNow || isToday || isStartWithin24h || isDeadlineWithin24h) {
    return {
      status: STATUS_TYPES.URGENT,
      registrationClosed,
      isToday
    };
  }

  // Rule 6: UPCOMING -> Everything else with a future moment > 24 hours away
  return {
    status: STATUS_TYPES.UPCOMING,
    registrationClosed,
    isToday
  };
}

