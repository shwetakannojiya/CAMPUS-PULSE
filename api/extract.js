import { validateRequestBody, sanitizeExtractedEvent } from './_lib/validation.js';
import { EXTRACTION_SYSTEM_PROMPT } from './_lib/prompts.js';
import { callGeminiJSON } from './_lib/gemini.js';
import { SAMPLE_EXTRACTIONS } from './_lib/sampleData.js';

export default async function handler(req, res) {
  // Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    // Basic payload validation
    const validation = validateRequestBody(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { text } = validation;
    const referenceDate = req.body.referenceDate || new Date().toISOString().slice(0, 10);
    const timezone = req.body.timezone || 'Asia/Kolkata';

    // DEMO MODE CHECK: If no GEMINI_API_KEY configured
    if (!process.env.GEMINI_API_KEY) {
      // Find closest sample match or fallback
      let matchedKey = 'sample-1';
      if (text.includes('CODESTORM') || text.includes('Hackathon')) {
        matchedKey = 'sample-2';
      } else if (text.includes('04/05/2026') || text.includes('Cultural Fest')) {
        matchedKey = 'sample-3';
      } else if (text.includes('LIBRARY') || text.includes('dues')) {
        matchedKey = 'sample-4';
      } else if (text.includes('Placement') || text.includes('Hinglish') || text.includes('Bhai suno')) {
        matchedKey = 'sample-5';
      }

      const sampleResult = SAMPLE_EXTRACTIONS[matchedKey] || SAMPLE_EXTRACTIONS['sample-1'];

      return res.status(200).json({
        success: true,
        isDemoMode: true,
        demoNote: 'Extracted using Demo Mode (Configure GEMINI_API_KEY in .env for live model parsing).',
        event: {
          ...sampleResult,
          sourceText: text
        }
      });
    }

    // LIVE GEMINI AI MODE
    const userPrompt = `TODAY'S REFERENCE DATE: ${referenceDate}
TIMEZONE: ${timezone}

<NOTICE_DATA>
${text}
</NOTICE_DATA>`;

    const rawAIResponse = await callGeminiJSON(EXTRACTION_SYSTEM_PROMPT, userPrompt);
    const sanitizedEvent = sanitizeExtractedEvent(rawAIResponse);
    sanitizedEvent.sourceText = text;

    return res.status(200).json({
      success: true,
      isDemoMode: false,
      event: sanitizedEvent
    });

  } catch (error) {
    console.error('[API /api/extract Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to extract notice details. Please try again or check server configuration.',
      details: error.message
    });
  }
}

