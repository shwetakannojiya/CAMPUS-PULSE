/**
 * Storage Layer for Campus Pulse
 *
 * NOTE ON LIMITATIONS:
 * - Data is stored in browser localStorage.
 * - Stored per-browser and per-device only; not automatically synchronized across different devices.
 * - Can be cleared if the student clears browser cache/data.
 * - An abstraction layer is used so this can be swapped with Supabase/Firebase/PostgreSQL.
 */

const STORAGE_KEY = 'campus_pulse_events_v1';
const SCHEMA_VERSION = 1;

/**
 * Normalizes a string for duplicate comparison (lowercase, trimmed, collapsed whitespace).
 */
export function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Generates a normalized duplicate key: title + date + startTime.
 */
export function getEventDuplicateKey(event) {
  const normTitle = normalizeString(event.title);
  const normDate = event.date || 'no-date';
  const normTime = event.startTime || 'no-time';
  return `${normTitle}__${normDate}__${normTime}`;
}

/**
 * Safely retrieve all events from localStorage.
 */
export function getEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.events)) {
      return [];
    }
    return parsed.events;
  } catch (err) {
    console.error('[Storage] Error loading events from localStorage:', err);
    return [];
  }
}

/**
 * Save the entire list of events with schema metadata.
 */
function saveEventsList(events) {
  try {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      events
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('[Storage] Error saving events to localStorage:', err);
    return false;
  }
}

/**
 * Checks if an event is a duplicate of an existing saved event.
 * Returns the matching event if found, or null.
 */
export function checkDuplicate(newEvent, currentEvents = null) {
  const events = currentEvents || getEvents();
  const targetKey = getEventDuplicateKey(newEvent);

  return events.find((existing) => {
    // If checking against same ID (during edit), ignore
    if (newEvent.id && existing.id === newEvent.id) return false;
    return getEventDuplicateKey(existing) === targetKey;
  }) || null;
}

/**
 * Save a new event record.
 */
export function saveEvent(event) {
  const events = getEvents();
  const nowIso = new Date().toISOString();

  const newRecord = {
    ...event,
    id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: event.createdAt || nowIso,
    updatedAt: nowIso
  };

  events.unshift(newRecord); // newest first
  saveEventsList(events);
  return newRecord;
}

/**
 * Update an existing event by ID.
 */
export function updateEvent(id, updates) {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  events[idx] = {
    ...events[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveEventsList(events);
  return events[idx];
}

/**
 * Delete an event by ID.
 */
export function deleteEvent(id) {
  const events = getEvents();
  const filtered = events.filter((e) => e.id !== id);
  saveEventsList(filtered);
  return filtered;
}

/**
 * Clear all events completely.
 */
export function clearAllEvents() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('[Storage] Error clearing events:', err);
    return false;
  }
}

/**
 * Export all events as a JSON formatted string.
 */
export function exportEventsJSON() {
  const events = getEvents();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      eventCount: events.length,
      events
    },
    null,
    2
  );
}

