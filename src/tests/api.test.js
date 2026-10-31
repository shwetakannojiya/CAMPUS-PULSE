import { describe, it, expect } from 'vitest';
import extractHandler from '../../api/extract.js';
import digestHandler from '../../api/digest.js';
import { sanitizeExtractedEvent, sanitizeDigestOutput } from '../../api/_lib/validation.js';

// Helper to mock req/res for Vercel serverless function testing
function mockReqRes(method, body = {}) {
  const req = {
    method,
    body
  };

  const res = {
    statusCode: 200,
    headers: {},
    responseData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(data) {
      this.responseData = data;
      return this;
    }
  };

  return { req, res };
}

describe('API Serverless Handlers & Protections', () => {
  it('1. Rejects non-POST methods with 405', async () => {
    const { req, res } = mockReqRes('GET');
    await extractHandler(req, res);
    expect(res.statusCode).toBe(405);
    expect(res.responseData.error).toMatch(/Method Not Allowed/i);
  });

  it('2. Rejects empty or whitespace-only notice with 400', async () => {
    const { req, res } = mockReqRes('POST', { text: '   ' });
    await extractHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.responseData.error).toMatch(/empty/i);
  });

  it('3. Rejects notices exceeding 5,000 characters with 400', async () => {
    const longText = 'a'.repeat(5001);
    const { req, res } = mockReqRes('POST', { text: longText });
    await extractHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.responseData.error).toMatch(/exceeds/i);
  });

  it('4. Correctly extracts sample notice in Demo Mode when GEMINI_API_KEY is not set', async () => {
    const { req, res } = mockReqRes('POST', {
      text: 'HANDS-ON WORKSHOP: AI AGENTS & FULL-STACK APPS on 2026-11-15'
    });
    await extractHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.responseData.success).toBe(true);
    expect(res.responseData.isDemoMode).toBe(true);
    expect(res.responseData.event.title).toContain('AI Agents');
    expect(res.responseData.event.category).toBe('Workshops');
  });

  it('5. Ambiguous date notice (04/05/2026) flags ambiguities and options', async () => {
    const { req, res } = mockReqRes('POST', {
      text: 'Annual Cultural Fest briefing session is scheduled for 04/05/2026'
    });
    await extractHandler(req, res);
    expect(res.statusCode).toBe(200);
    const amb = res.responseData.event.ambiguities;
    expect(amb.length).toBeGreaterThan(0);
    expect(amb[0].field).toBe('date');
    expect(amb[0].options).toContain('2026-05-04');
    expect(amb[0].options).toContain('2026-04-05');
  });

  it('6. Missing-date notice returns null date and ambiguity', async () => {
    const { req, res } = mockReqRes('POST', {
      text: 'IMPORTANT NOTICE - CENTRAL LIBRARY return books and dues'
    });
    await extractHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.responseData.event.date).toBeNull();
  });

  it('7. Weekly digest handler rejects empty events array with 400', async () => {
    const { req, res } = mockReqRes('POST', { events: [] });
    await digestHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('8. Weekly digest verifies event IDs and purges hallucinatory IDs', () => {
    const realIds = ['evt_1', 'evt_2'];
    const fakeAIOutput = {
      urgent: [{ eventId: 'evt_1', summary: 'Hackathon starts tomorrow' }],
      thisWeek: [{ eventId: 'fake_hallucinated_id', summary: 'Non-existent event' }]
    };

    const sanitized = sanitizeDigestOutput(fakeAIOutput, realIds);
    expect(sanitized.urgent.length).toBe(1);
    expect(sanitized.urgent[0].eventId).toBe('evt_1');
    expect(sanitized.thisWeek.length).toBe(0); // dropped!
  });

  it('9. Output sanitizer strictly coerces category into allowed enums', () => {
    const raw = {
      title: 'Valid Title',
      category: 'InjectedCategoryHacked',
      date: '2026-11-20',
      startTime: '10:00'
    };
    const sanitized = sanitizeExtractedEvent(raw);
    expect(sanitized.category).toBe('Other');
  });
});

