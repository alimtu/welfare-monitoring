/**
 * Mock/demo data preloaded into localStorage on first run.
 *
 * Provides two evaluation periods (one completed, one active) and a spread of
 * sample submissions covering all four score levels (10 / 7 / 4 / 1) plus one
 * checklist submission — so the dashboard, reports and trend charts have data.
 */
import { buildSubmission } from './submission';

const PREV_PERIOD_ID = 'period_1402';
const ACTIVE_PERIOD_ID = 'period_1403';

const PERIODS = [
  {
    id: PREV_PERIOD_ID,
    title: 'دوره ارزیابی ۱۴۰۲',
    startDate: '2023-03-21',
    endDate: '2024-03-19',
    status: 'completed',
    createdAt: '2023-03-21T08:00:00.000Z',
  },
  {
    id: ACTIVE_PERIOD_ID,
    title: 'دوره ارزیابی ۱۴۰۳',
    startDate: '2024-03-20',
    endDate: '2025-03-20',
    status: 'active',
    createdAt: '2024-03-20T08:00:00.000Z',
  },
];

/**
 * Build the full seed dataset. Submissions are produced through buildSubmission
 * so their calculated scores are always consistent with the calculation engine.
 */
export function buildSeed() {
  const submissions = [
    // --- Previous period (for trend comparison) ---
    buildSubmission({
      periodId: PREV_PERIOD_ID,
      indicatorId: 'IND01',
      inputData: { transportation: 1500000000, food: 1000000000, housing: 1500000000, accommodation: 1000000000, insurance: 750000000, other: 500000000, employees: 25 },
      submittedAt: '2024-01-10T10:00:00.000Z',
    }), // ~250M -> score 4
    buildSubmission({
      periodId: PREV_PERIOD_ID,
      indicatorId: 'IND09',
      inputData: { area: 200, employees: 250 },
      submittedAt: '2024-01-12T10:00:00.000Z',
    }), // 0.8 -> score 7

    // --- Active period ---
    buildSubmission({
      periodId: ACTIVE_PERIOD_ID,
      indicatorId: 'IND01',
      inputData: { transportation: 2000000000, food: 1500000000, housing: 2000000000, accommodation: 1250000000, insurance: 1000000000, other: 1000000000, employees: 25 },
      previousScore: 4,
      submittedAt: '2025-01-15T09:30:00.000Z',
    }), // 350M -> score 7
    buildSubmission({
      periodId: ACTIVE_PERIOD_ID,
      indicatorId: 'IND02',
      inputData: { facilities: 1200000000, turnover: 10000000000 },
      submittedAt: '2025-01-16T11:00:00.000Z',
    }), // 12% -> score 4
    buildSubmission({
      periodId: ACTIVE_PERIOD_ID,
      indicatorId: 'IND09',
      inputData: { area: 300, employees: 250 },
      previousScore: 7,
      submittedAt: '2025-01-18T14:20:00.000Z',
    }), // 1.2 -> score 10
    buildSubmission({
      periodId: ACTIVE_PERIOD_ID,
      indicatorId: 'IND13',
      inputData: { units: 10, employees: 250 },
      submittedAt: '2025-01-20T08:45:00.000Z',
    }), // 4% -> score 1
    buildSubmission({
      periodId: ACTIVE_PERIOD_ID,
      indicatorId: 'IND12',
      checklistInputs: {
        C1: { option: 'established' }, // 20
        C2: { records: 220, total: 250 }, // 88% -> 50
        C3: { programs: 5 }, // >4 -> 30
      },
      submittedAt: '2025-01-22T13:10:00.000Z',
    }), // total 100 -> 100% -> score 10 (checklist)
  ];

  return { periods: PERIODS, submissions };
}

export { ACTIVE_PERIOD_ID, PREV_PERIOD_ID };
