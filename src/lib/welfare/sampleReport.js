/**
 * Pure report builder for a welfare data bundle (periods + submissions).
 *
 * Turns the raw `{ welfare_periods, welfare_submissions }` bundle into a
 * structured, chart-ready report: per-period scores/rows, cross-period trends,
 * and computed insights. No localStorage, no React — safe to unit-test.
 */
import { INDICATORS, SCORE_LEVELS } from './indicators';
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

/**
 * How many indicators landed at each score level (10/7/4/1), per period.
 * Shaped for a stacked bar chart: { name, s10, s7, s4, s1 }.
 */
export function scoreDistribution(report) {
  return report.periods.map((p) => {
    const row = { name: p.title };
    SCORE_LEVELS.forEach((lvl) => {
      row[`s${lvl}`] = 0;
    });
    p.rows.forEach((r) => {
      if (r.score != null && SCORE_LEVELS.includes(r.score)) row[`s${r.score}`] += 1;
    });
    return row;
  });
}

/**
 * Weighted contribution (weight × score) per indicator for one period, biggest
 * first — shows which indicators actually drive the overall score. Uses the
 * submission's own weight when present, matching the overall-score formula.
 */
export function weightedContribution(period) {
  if (!period) return [];
  return period.rows
    .map((r) => {
      const weight = r.sub?.weight ?? r.ind.weight ?? 0;
      const score = r.score ?? 0;
      return {
        code: r.ind.code,
        fullName: r.ind.title,
        weight,
        score,
        weighted: score * weight,
        gap: 10 - score, // headroom to a perfect score
      };
    })
    .sort((a, b) => b.weighted - a.weighted);
}

/** Indicator-by-indicator comparison of two periods, plus ranked gains/losses. */
export function comparePeriods(report, aId, bId) {
  const a = report.periods.find((p) => p.id === aId) || null;
  const b = report.periods.find((p) => p.id === bId) || null;
  if (!a || !b) return { a, b, rows: [], gains: [], losses: [] };

  const rows = INDICATORS.map((ind) => {
    const scoreA = a.rows.find((r) => r.ind.id === ind.id)?.score ?? null;
    const scoreB = b.rows.find((r) => r.ind.id === ind.id)?.score ?? null;
    return {
      ind,
      scoreA,
      scoreB,
      delta: scoreA != null && scoreB != null ? scoreB - scoreA : null,
    };
  });

  const moved = rows.filter((r) => r.delta != null && r.delta !== 0);
  return {
    a,
    b,
    rows,
    gains: moved.filter((r) => r.delta > 0).sort((x, y) => y.delta - x.delta),
    losses: moved.filter((r) => r.delta < 0).sort((x, y) => x.delta - y.delta),
  };
}
