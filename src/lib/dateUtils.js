import { APP_TIMEZONE } from './constants';

/**
 * Returns current date and time formatted in APP_TIMEZONE (Asia/Kolkata).
 * Avoids browser-locale discrepancies.
 */
export function getNowInTimezone(overrideDate = null) {
  const d = overrideDate ? new Date(overrideDate) : new Date();
  
  // Format to Asia/Kolkata ISO-like parts
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(d);
  const map = {};
  parts.forEach((p) => { map[p.type] = p.value; });

  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const timeStr = `${map.hour}:${map.minute}`;

  // Build a date object representing this local wall-clock moment
  const wallClock = new Date(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second || 0)
  );

  return {
    dateStr,
    timeStr,
    wallClock,
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day)
  };
}

/**
 * Safely parse YYYY-MM-DD into { year, month, day } numbers without UTC shifts.
 */
export function parseDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10)
  };
}

/**
 * Validates that an ISO date string represents a real calendar date
 * (e.g., February 29 on leap years, rejects 2026-02-30 or 2026-13-01).
 */
export function isValidCalendarDate(dateStr) {
  const parts = parseDateString(dateStr);
  if (!parts) return false;

  const { year, month, day } = parts;
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * Convert an event's date and time into a comparable timestamp (in milliseconds).
 * If no time is specified, defaultHour and defaultMinute are used.
 */
export function getEventTimestamp(dateStr, timeStr, defaultHour = 0, defaultMinute = 0) {
  const dateParts = parseDateString(dateStr);
  if (!dateParts) return null;

  let h = defaultHour;
  let m = defaultMinute;

  if (timeStr && typeof timeStr === 'string') {
    const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      h = parseInt(timeMatch[1], 10);
      m = parseInt(timeMatch[2], 10);
    }
  }

  // Create Date using wall-clock components
  return new Date(dateParts.year, dateParts.month - 1, dateParts.day, h, m, 0, 0).getTime();
}

/**
 * Parse an ISO registration deadline string (e.g. "2026-11-04T23:59" or "2026-11-04 23:59" or "2026-11-04").
 */
export function parseDeadlineTimestamp(deadlineStr) {
  if (!deadlineStr || typeof deadlineStr !== 'string') return null;
  const cleaned = deadlineStr.trim().replace(' ', 'T');
  const datePartMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!datePartMatch) return null;

  const y = parseInt(datePartMatch[1], 10);
  const mo = parseInt(datePartMatch[2], 10);
  const d = parseInt(datePartMatch[3], 10);

  let h = 23;
  let m = 59;
  const timeMatch = cleaned.match(/T(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    h = parseInt(timeMatch[1], 10);
    m = parseInt(timeMatch[2], 10);
  }

  return new Date(y, mo - 1, d, h, m, 0, 0).getTime();
}

/**
 * Check if a date string is strictly today in Asia/Kolkata.
 */
export function isDateToday(dateStr, nowWallClock) {
  const parsed = parseDateString(dateStr);
  if (!parsed || !nowWallClock) return false;
  return (
    parsed.year === nowWallClock.getFullYear() &&
    parsed.month === (nowWallClock.getMonth() + 1) &&
    parsed.day === nowWallClock.getDate()
  );
}

/**
 * Check if an event falls in "This Week" (next 7 days rolling from now).
 */
export function isEventInNext7Days(dateStr, nowWallClock) {
  const startMs = getEventTimestamp(dateStr, '00:00', 0, 0);
  if (!startMs || !nowWallClock) return false;

  const todayStart = new Date(
    nowWallClock.getFullYear(),
    nowWallClock.getMonth(),
    nowWallClock.getDate(),
    0, 0, 0, 0
  ).getTime();

  const sevenDaysLater = todayStart + (7 * 24 * 60 * 60 * 1000);

  return startMs >= todayStart && startMs < sevenDaysLater;
}
