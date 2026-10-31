import { sanitizeDigestOutput } from './_lib/validation.js';
import { DIGEST_SYSTEM_PROMPT } from './_lib/prompts.js';
import { callGeminiJSON } from './_lib/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { events } = req.body || {};
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'No events provided for weekly digest.' });
    }

    const validIds = events.map((e) => e.id);

    // DEMO MODE CHECK: If no GEMINI_API_KEY
    if (!process.env.GEMINI_API_KEY) {
      // Deterministically categorize real input events into sections
      const digest = {
        urgent: [],
        thisWeek: [],
        workshopsAndCompetitions: [],
        deadlines: [],
        academicAndNotices: []
      };

      events.forEach((evt) => {
        const item = {
          eventId: evt.id,
          summary: `${evt.title} scheduled for ${evt.date || 'date to be confirmed'}${evt.venue ? ` at ${evt.venue}` : ''}.`
        };

        if (evt.computedStatus === 'URGENT' || evt.isToday) {
          digest.urgent.push(item);
        } else if (evt.category === 'Workshops' || evt.category === 'Hackathons') {
          digest.workshopsAndCompetitions.push(item);
        } else if (evt.registrationDeadline) {
          digest.deadlines.push({
            eventId: evt.id,
            summary: `Registration closes on ${evt.registrationDeadline} for ${evt.title}.`
          });
        } else if (evt.category === 'Academic' || evt.category === 'Important Notices') {
          digest.academicAndNotices.push(item);
        } else {
          digest.thisWeek.push(item);
        }
      });

      return res.status(200).json({
        success: true,
        isDemoMode: true,
        demoNote: 'Digest generated in Demo Mode from your real local events.',
        digest
      });
    }

    // LIVE GEMINI AI MODE
    const userPrompt = `List of confirmed events for this week:
${JSON.stringify(events, null, 2)}`;

    const rawAIResponse = await callGeminiJSON(DIGEST_SYSTEM_PROMPT, userPrompt);
    const sanitizedDigest = sanitizeDigestOutput(rawAIResponse, validIds);

    return res.status(200).json({
      success: true,
      isDemoMode: false,
      digest: sanitizedDigest
    });

  } catch (error) {
    console.error('[API /api/digest Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to generate weekly digest. Please try again.',
      details: error.message
    });
  }
}

