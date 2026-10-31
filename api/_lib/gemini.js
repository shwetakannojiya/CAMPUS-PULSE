/**
 * Gemini API Provider Client
 *
 * Isolated provider file. All model calls and authentication live strictly here.
 */

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Calls Google Gemini REST endpoint with structured JSON generation.
 */
export async function callGeminiJSON(systemPrompt, userPrompt, apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      // Safe error reporting without revealing keys
      throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response received from Gemini.');
    }

    return JSON.parse(candidateText);
  } catch (err) {
    if (err.message === 'NO_API_KEY') throw err;
    throw new Error(`Gemini generation failed: ${err.message}`);
  }
}

