const ALLOWED_CATEGORIES = [
  'Academic',
  'Workshops',
  'Hackathons',
  'Technical Events',
  'Cultural Events',
  'Sports',
  'Important Notices',
  'Other'
];

/**
 * Validate incoming HTTP request payload.
 */
export function validateRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object.' };
  }

  const { text } = body;
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'The "text" field is required and must be a string.' };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Notice text cannot be empty or whitespace-only.' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Notice text exceeds the maximum limit of 5,000 characters.' };
  }

  return { valid: true, text: trimmed };
}

/**
 * Validates and sanitizes AI extracted event output shape.
 */
export function sanitizeExtractedEvent(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI output was not a valid JSON object.');
  }

  // Ensure title is non-empty string
  const title = (raw.title && typeof raw.title === 'string' && raw.title.trim())
    ? raw.title.trim()
    : 'Untitled Notice Event';

  // Ensure category is strictly one of the allowed categories
  const category = ALLOWED_CATEGORIES.includes(raw.category)
    ? raw.category
    : 'Other';

  // Validate ISO date (YYYY-MM-DD or null)
  let date = null;
  if (raw.date && typeof raw.date === 'string') {
    const dMatch = raw.date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dMatch) date = raw.date.trim();
  }

  // Validate 24h times (HH:mm or null)
  let startTime = null;
  if (raw.startTime && typeof raw.startTime === 'string') {
    const tMatch = raw.startTime.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (tMatch) startTime = raw.startTime.trim().padStart(5, '0');
  }

  let endTime = null;
  if (raw.endTime && typeof raw.endTime === 'string') {
    const tMatch = raw.endTime.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (tMatch) endTime = raw.endTime.trim().padStart(5, '0');
  }

  const venue = (raw.venue && typeof raw.venue === 'string') ? raw.venue.trim() : null;
  const description = (raw.description && typeof raw.description === 'string') ? raw.description.trim() : '';
  const registrationDeadline = (raw.registrationDeadline && typeof raw.registrationDeadline === 'string')
    ? raw.registrationDeadline.trim()
    : null;

  const instructions = Array.isArray(raw.instructions)
    ? raw.instructions.map((i) => String(i).trim()).filter(Boolean)
    : [];

  const ambiguities = Array.isArray(raw.ambiguities)
    ? raw.ambiguities.map((a) => ({
        field: String(a.field || 'general'),
        reason: String(a.reason || 'Unclear information in notice'),
        options: Array.isArray(a.options) ? a.options.map(String) : []
      }))
    : [];

  const confidence = (raw.confidence && typeof raw.confidence === 'object')
    ? {
        title: raw.confidence.title === 'low' ? 'low' : 'high',
        date: raw.confidence.date === 'low' ? 'low' : 'high',
        time: raw.confidence.time === 'low' ? 'low' : 'high',
        venue: raw.confidence.venue === 'low' ? 'low' : 'high',
        category: raw.confidence.category === 'low' ? 'low' : 'high'
      }
    : { title: 'high', date: 'high', time: 'high', venue: 'high', category: 'high' };

  return {
    title,
    category,
    date,
    startTime,
    endTime,
    venue,
    description,
    registrationDeadline,
    instructions,
    ambiguities,
    confidence
  };
}

/**
 * Validates weekly digest output against provided real events.
 * Drops any non-existent event IDs to prevent AI hallucinations.
 */
export function sanitizeDigestOutput(rawDigest, validEventIds) {
  const validIdSet = new Set(validEventIds);
  const sections = ['urgent', 'thisWeek', 'workshopsAndCompetitions', 'deadlines', 'academicAndNotices'];
  const sanitized = {};

  sections.forEach((sec) => {
    const items = Array.isArray(rawDigest?.[sec]) ? rawDigest[sec] : [];
    sanitized[sec] = items
      .filter((item) => item && typeof item.eventId === 'string' && validIdSet.has(item.eventId))
      .map((item) => ({
        eventId: item.eventId,
        summary: String(item.summary || '').trim()
      }))
      .filter((item) => item.summary.length > 0);
  });

  return sanitized;
}

