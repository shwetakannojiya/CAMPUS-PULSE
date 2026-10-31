/**
 * Pre-computed realistic extraction results for the 5 sample notices.
 * Used when GEMINI_API_KEY is not configured (Demo Mode).
 */

export const SAMPLE_EXTRACTIONS = {
  'sample-1': {
    title: 'Hands-on Workshop: AI Agents & Full-Stack Apps',
    date: '2026-11-15',
    startTime: '10:00',
    endTime: '16:00',
    venue: 'Central Computing Center, Lab 3',
    category: 'Workshops',
    description: 'Hands-on workshop covering the creation of autonomous AI agents and deploying full-stack web applications.',
    registrationDeadline: '2026-11-12T23:59',
    instructions: [
      'Carry your college ID card',
      'Bring a laptop with Node.js and VS Code installed',
      'Free lunch and certificates provided'
    ],
    ambiguities: [],
    confidence: {
      title: 'high',
      date: 'high',
      time: 'high',
      venue: 'high',
      category: 'high'
    },
    isDemoResult: true
  },

  'sample-2': {
    title: 'CodeStorm 2026: 36-Hour National Hackathon',
    date: '2026-11-01',
    startTime: '09:00',
    endTime: '21:00',
    venue: 'Main Auditorium',
    category: 'Hackathons',
    description: 'National 36-hour hackathon with Rs 1,00,000 prize pool. Final call for team registrations closing tonight.',
    registrationDeadline: '2026-10-31T23:59',
    instructions: [
      'Team size strictly 2-4 members',
      'Bring extension boards'
    ],
    ambiguities: [],
    confidence: {
      title: 'high',
      date: 'high',
      time: 'high',
      venue: 'high',
      category: 'high'
    },
    isDemoResult: true
  },

  'sample-3': {
    title: 'Annual Cultural Fest Briefing Session',
    date: '2026-05-04',
    startTime: '15:00',
    endTime: '16:30',
    venue: 'Seminar Hall 1',
    category: 'Cultural Events',
    description: 'Mandatory briefing for all club leaders and society secretaries regarding the upcoming annual cultural fest.',
    registrationDeadline: null,
    instructions: [
      'Attendance is mandatory for all society secretaries',
      'Confirm date interpretation with Dean office'
    ],
    ambiguities: [
      {
        field: 'date',
        reason: 'Date was written as "04/05/2026" which could mean 4th May 2026 (DD/MM) or 5th April 2026 (MM/DD).',
        options: ['2026-05-04', '2026-04-05']
      }
    ],
    confidence: {
      title: 'high',
      date: 'low',
      time: 'high',
      venue: 'high',
      category: 'high'
    },
    isDemoResult: true
  },

  'sample-4': {
    title: 'Central Library: Textbook Return & Dues Clearance',
    date: null,
    startTime: null,
    endTime: null,
    venue: 'Ground Floor Circulation Desk, Central Library',
    category: 'Important Notices',
    description: 'Final year students must clear borrowed technical books and library dues before receiving graduation no-dues certificate.',
    registrationDeadline: null,
    instructions: [
      'Return all borrowed technical reference textbooks',
      'Fine of Rs 10 per day applies for overdue books'
    ],
    ambiguities: [
      {
        field: 'date',
        reason: 'No event date or deadline was specified in the library announcement.',
        options: []
      }
    ],
    confidence: {
      title: 'high',
      date: 'low',
      time: 'low',
      venue: 'high',
      category: 'high'
    },
    isDemoResult: true
  },

  'sample-5': {
    title: 'Placement Cell: Mock Technical Interviews',
    date: '2026-11-06',
    startTime: '14:00',
    endTime: '18:00',
    venue: 'Placement Cell Block C',
    category: 'Academic',
    description: 'Mock technical interview sessions organized by the campus placement cell for registered students.',
    registrationDeadline: '2026-11-04T18:00',
    instructions: [
      'Dress code strictly formal (tie optional)',
      'Carry 2 physical copies of updated resume',
      'Fill registration form before deadline'
    ],
    ambiguities: [],
    confidence: {
      title: 'high',
      date: 'high',
      time: 'high',
      venue: 'high',
      category: 'high'
    },
    isDemoResult: true
  }
};

