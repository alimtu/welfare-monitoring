/**
 * Builds a normalized IndicatorSubmission record from raw user input.
 * Shared by the mock-data seeder and the direct/checklist submission pages so
 * calculation + expert-analysis logic lives in exactly one place.
 */
import { computeResult } from './calculations';
import { generateExpertAnalysis } from './analysis';
import { getIndicator } from './indicators';
import { uid } from './ids';

/**
 * @param {Object} params
 * @param {string} params.periodId
 * @param {string} params.indicatorId
 * @param {Object} [params.inputData]        numeric inputs for direct indicators
 * @param {Object} [params.checklistInputs]  nested { criterionId: {...inputs} } for checklists
 * @param {'draft'|'submitted'} [params.status]
 * @param {string} [params.notes]
 * @param {number} [params.previousScore] previous-period score for comparison text
 * @param {string} [params.submittedAt]   ISO timestamp (defaults to now)
 * @param {string} [params.id]            reuse an id when editing
 */
export function buildSubmission({
  periodId,
  indicatorId,
  inputData = {},
  checklistInputs = {},
  status = 'submitted',
  notes = '',
  previousScore,
  submittedAt,
  id,
}) {
  const indicator = getIndicator(indicatorId);
  if (!indicator) throw new Error(`Unknown indicator: ${indicatorId}`);

  const isChecklist = indicator.type === 'checklist';
  const result = computeResult(indicator, { inputData, checklistInputs });
  const expertAnalysis = generateExpertAnalysis(
    indicator,
    result,
    previousScore != null ? { previousScore } : {},
  );

  return {
    id: id || uid('sub'),
    periodId,
    indicatorId,
    indicatorTitle: indicator.title,
    indicatorType: indicator.type,
    weight: indicator.weight,
    status,
    submittedAt: submittedAt || new Date().toISOString(),
    // Raw inputs (one of these is null depending on the indicator type)
    inputData: isChecklist ? null : inputData,
    checklistInputs: isChecklist ? checklistInputs : null,
    // Calculation output
    resultUnit: indicator.resultUnit || null,
    calculatedValue: isChecklist ? null : result.calculatedValue,
    percentage: isChecklist ? result.percentage : null,
    totalScore: isChecklist ? result.totalScore : null,
    maxTotalScore: isChecklist ? result.maxTotalScore : null,
    criteriaScores: isChecklist ? result.criteriaScores : null,
    matchedBand: result.matchedBand,
    finalScore: result.finalScore,
    weightedScore: result.weightedScore,
    expertAnalysis,
    notes,
  };
}
