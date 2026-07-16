/**
 * Pure report builder for a welfare data bundle (periods + submissions).
 *
 * Turns the raw `{ welfare_periods, welfare_submissions }` bundle into a
 * structured, chart-ready report: per-period scores/rows, cross-period trends,
 * and computed insights. No localStorage, no React — safe to unit-test.
 */
import { INDICATORS } from './indicators';
import { calcOverallPeriodScore, calcAverageScore } from './calculations';
import { tryParse } from './deviceData';

const round2 = (n) => Number((n || 0).toFixed(2));

/**
 * @param {{welfare_periods?:any, welfare_submissions?:any}} bundle
 * @returns {{
 *   periods: Array<Object>,
 *   overallTrend: Array<{name:string, score:number}>,
 *   indicatorStats: Array<{ind:Object, avg:number, delta:number, latest:number|null}>,
 *   insights: Object,
 *   totals: {periodCount:number, submissionCount:number},
 * }}
 */
export function buildReport(bundle) {
  const periodsRaw = tryParse(bundle?.welfare_periods) || [];
  const subsRaw = tryParse(bundle?.welfare_submissions) || [];

  const periods = Array.isArray(periodsRaw)
    ? [...periodsRaw].sort((a, b) => new Date(a?.startDate || 0) - new Date(b?.startDate || 0))
    : [];

  const subsByPeriod = {};
  (Array.isArray(subsRaw) ? subsRaw : []).forEach((s) => {
    if (!s || !s.periodId) return;
    (subsByPeriod[s.periodId] = subsByPeriod[s.periodId] || []).push(s);
  });

  const periodReports = periods.map((p) => {
    const subs = subsByPeriod[p.id] || [];
    const rows = INDICATORS.map((ind) => {
      const sub = subs.find((s) => s.indicatorId === ind.id && s.status === 'submitted') || null;
      return { ind, sub, score: sub ? sub.finalScore : null };
    });
    return {
      ...p,
      subs,
      rows,
      overall: calcOverallPeriodScore(subs),
      average: calcAverageScore(subs),
      submittedCount: rows.filter((r) => r.sub).length,
    };
  });

  const overallTrend = periodReports.map((p) => ({ name: p.title, score: round2(p.overall) }));

  // Per-indicator stats across periods (average score + first→last improvement).
  const indicatorStats = INDICATORS.map((ind) => {
    const scores = periodReports
      .map((p) => p.rows.find((r) => r.ind.id === ind.id)?.score)
      .filter((s) => s != null);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const delta = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
    return { ind, avg: round2(avg), delta, latest: scores.length ? scores[scores.length - 1] : null };
  });

  const byAvg = [...indicatorStats].sort((a, b) => b.avg - a.avg);
  const byDelta = [...indicatorStats].sort((a, b) => b.delta - a.delta);
  const byPeriod = [...periodReports].sort((a, b) => b.overall - a.overall);

  return {
    periods: periodReports,
    overallTrend,
    indicatorStats,
    insights: {
      best: byAvg[0] || null,
      worst: byAvg[byAvg.length - 1] || null,
      mostImproved: byDelta[0] || null,
      mostDeclined: byDelta[byDelta.length - 1] || null,
      bestPeriod: byPeriod[0] || null,
      worstPeriod: byPeriod[byPeriod.length - 1] || null,
    },
    totals: {
      periodCount: periodReports.length,
      submissionCount: periodReports.reduce((n, p) => n + p.submittedCount, 0),
    },
  };
}

/** Score of a given indicator in each period, for the per-indicator trend chart. */
export function indicatorTrend(report, indicatorId) {
  return report.periods.map((p) => ({
    name: p.title,
    score: p.rows.find((r) => r.ind.id === indicatorId)?.score ?? null,
  }));
}
