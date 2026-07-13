/**
 * Calculation engine for welfare indicators.
 *
 * Handles both indicator types:
 *  - Direct formula: run indicator.compute(inputData) -> value -> match bands.
 *  - Checklist: sum selected option scores -> percentage -> match bands.
 *
 * Band matching uses [min, max) semantics:
 *   value >= min (when min != null)  AND  value < max (when max != null).
 */

/**
 * Find the scoring band a value falls into.
 * @returns {{min:number|null,max:number|null,score:number,description:string}|null}
 */
export function matchBand(value, bands) {
  return (
    bands.find(b => {
      const okMin = b.min == null || value >= b.min;
      const okMax = b.max == null || value < b.max;
      return okMin && okMax;
    }) || null
  );
}

/**
 * Calculate a direct-formula indicator result.
 * @param {Object} indicator
 * @param {Object} inputData map of fieldKey -> number
 */
export function calculateDirect(indicator, inputData) {
  const calculatedValue = indicator.compute ? indicator.compute(inputData) : 0;
  const matchedBand = matchBand(calculatedValue, indicator.scoringBands);
  const finalScore = matchedBand ? matchedBand.score : 0;
  // eslint-disable-next-line no-console
  console.log(`[calc:direct] ${indicator.id}`, { inputData, calculatedValue, finalScore });
  return {
    calculatedValue,
    matchedBand,
    finalScore,
    weightedScore: finalScore * indicator.weight,
  };
}

const round1 = n => Math.round(n * 10) / 10;

/** Display unit for a criterion measure (used by the UI to format the value). */
export function criterionUnit(measure) {
  if (measure.type === 'count') return measure.input.unit || '';
  if (measure.type === 'percent' || measure.type === 'ratio') return '٪';
  if (measure.type === 'qualityAverage') return 'امتیاز';
  return '';
}

/**
 * Evaluate ONE checklist criterion from the user's measurement input.
 * Returns the measured value plus the auto-derived score for that criterion.
 * @param {Object} criterion
 * @param {Object} input the raw inputs for this criterion (nested per criterion id)
 * @returns {{filled:boolean, measureType:string, value:number|null, optionLabel:string|null, band:Object|null, score:number}}
 */
export function evaluateCriterion(criterion, input = {}) {
  const m = criterion.measure;

  if (m.type === 'select') {
    const option = m.options.find(o => o.value === input.option) || null;
    return {
      filled: !!option,
      measureType: 'select',
      value: null,
      optionLabel: option ? option.label : null,
      band: null,
      score: option ? option.score : 0,
    };
  }

  if (m.type === 'qualityAverage') {
    let count = 0;
    let weighted = 0;
    let anyEntered = false;
    for (const level of m.levels) {
      const raw = input[level.value];
      if (raw !== undefined && raw !== '') anyEntered = true; // 0 counts as entered
      const c = Number(raw) || 0;
      count += c;
      weighted += c * level.score;
    }
    // Filled once the user has entered at least one level count. A total of 0
    // (all levels 0) is a valid answer, so completeness is based on entry, not sum.
    const filled = anyEntered;
    const avg = count > 0 ? round1(weighted / count) : 0;
    return {
      filled,
      measureType: 'qualityAverage',
      value: avg,
      optionLabel: null,
      band: null,
      score: avg,
    };
  }

  // Numeric measures: count / percent / ratio
  let value = 0;
  let filled = false;
  if (m.type === 'ratio') {
    const rawN = input[m.numerator.key];
    const rawD = input[m.denominator.key];
    const n = Number(rawN);
    const d = Number(rawD);
    const bothEntered =
      rawN !== undefined &&
      rawN !== '' &&
      rawD !== undefined &&
      rawD !== '' &&
      !Number.isNaN(n) &&
      !Number.isNaN(d);
    // Denominator must be > 0, EXCEPT the 0/0 case which is a valid "0%"
    // (e.g. no cost and the employee paid nothing). A positive numerator over a
    // 0 denominator stays invalid (contradictory / division by zero).
    filled = bothEntered && (d > 0 || n === 0);
    value = d > 0 ? (n / d) * 100 : 0;
  } else {
    const raw = input[m.input.key];
    const v = Number(raw);
    filled = raw !== undefined && raw !== '' && !Number.isNaN(v);
    value = v;
  }
  const band = matchBand(value, m.bands);
  return {
    filled,
    measureType: m.type,
    value,
    optionLabel: null,
    band,
    score: band ? band.score : 0,
  };
}

/**
 * Build per-criterion score rows from the nested checklist input map.
 * @param {Object} indicator
 * @param {Object} checklistInputs { criterionId: { ...inputs } }
 */
export function buildCriteriaScores(indicator, checklistInputs = {}) {
  return (indicator.criteria || []).map(c => {
    const ev = evaluateCriterion(c, checklistInputs[c.id] || {});
    return {
      criterionId: c.id,
      title: c.title,
      maxScore: c.maxScore,
      measureType: ev.measureType,
      unit: criterionUnit(c.measure),
      value: ev.value,
      optionLabel: ev.optionLabel,
      bandDescription: ev.band ? ev.band.description : null,
      filled: ev.filled,
      score: ev.score,
    };
  });
}

/**
 * Calculate a checklist indicator result from measurement inputs.
 * Each criterion is scored from its own metric; the total (out of 100) is
 * converted to a percentage and matched to the indicator's scoring bands.
 * @param {Object} indicator
 * @param {Object} checklistInputs { criterionId: { ...inputs } }
 */
export function calculateChecklist(indicator, checklistInputs = {}) {
  const criteriaScores = buildCriteriaScores(indicator, checklistInputs);
  const totalScore = criteriaScores.reduce((sum, c) => sum + c.score, 0);
  const maxTotalScore = criteriaScores.reduce((sum, c) => sum + c.maxScore, 0);
  const percentage = maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;
  const matchedBand = matchBand(percentage, indicator.scoringBands);
  const finalScore = matchedBand ? matchedBand.score : 0;
  // eslint-disable-next-line no-console
  console.log(`[calc:checklist] ${indicator.id}`, {
    totalScore,
    maxTotalScore,
    percentage,
    finalScore,
  });
  return {
    criteriaScores,
    totalScore,
    maxTotalScore,
    percentage,
    matchedBand,
    finalScore,
    weightedScore: finalScore * indicator.weight,
  };
}

/**
 * Whether every criterion has its required measurement input filled.
 */
export function isChecklistComplete(indicator, checklistInputs = {}) {
  return (indicator.criteria || []).every(
    c => evaluateCriterion(c, checklistInputs[c.id] || {}).filled
  );
}

/**
 * Compute a result for either indicator type from a unified payload.
 * @param {Object} indicator
 * @param {{inputData?:Object, checklistInputs?:Object}} payload
 */
export function computeResult(indicator, { inputData = {}, checklistInputs = {} } = {}) {
  return indicator.type === 'checklist'
    ? calculateChecklist(indicator, checklistInputs)
    : calculateDirect(indicator, inputData);
}

/**
 * Overall period score = Σ(weight × score) / Σ(weight), across submitted rows.
 * Indicators with weight 0 are excluded from the denominator.
 * @param {Array} submissions submissions for a single period
 */
export function calcOverallPeriodScore(submissions) {
  const submitted = submissions.filter(s => s.status === 'submitted');
  let weightedSum = 0;
  let weightSum = 0;
  for (const s of submitted) {
    weightedSum += (s.finalScore || 0) * (s.weight || 0);
    weightSum += s.weight || 0;
  }
  return weightSum > 0 ? weightedSum / weightSum : 0;
}

/**
 * Average of final scores across submitted rows (unweighted).
 */
export function calcAverageScore(submissions) {
  const submitted = submissions.filter(s => s.status === 'submitted');
  if (submitted.length === 0) return 0;
  return submitted.reduce((sum, s) => sum + (s.finalScore || 0), 0) / submitted.length;
}
