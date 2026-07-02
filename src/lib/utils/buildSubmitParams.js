import { formatJalaliISO } from './jalali';

function serializeValue(raw, type) {
  if (raw == null || raw === '') return undefined;

  if (type === 5 && Array.isArray(raw)) {
    return raw.length ? raw.join(',') : undefined;
  }

  if (type === 6) {
    const formatted = formatJalaliISO(raw);
    return formatted || undefined;
  }

  if (type === 10 && typeof raw === 'object') {
    return raw.sub || undefined;
  }

  return String(raw);
}

/**
 * Transforms react-hook-form values into the API format:
 *   f_{sectionId}_{rowIndex} = value
 */
export default function buildSubmitParams(values, steps, formId) {
  const params = { op: 'm_sendform', formId };

  for (const step of steps) {
    const sections = step.sections || [];

    if (step.numrow > 1) {
      const rows = values[`rows_${step.stepId}`] || [];
      rows.forEach((row, ri) => {
        if (!row) return;
        const hasAnyValue = sections.some(
          s => row[`section_${s.sectionId}`] != null && row[`section_${s.sectionId}`] !== ''
        );
        if (!hasAnyValue) return;

        for (const section of sections) {
          const raw = row[`section_${section.sectionId}`];
          const val = serializeValue(raw, section.type);
          if (val !== undefined) params[`f_${section.sectionId}_${ri + 1}`] = val;
        }
      });
    } else {
      for (const section of sections) {
        const raw = values[`section_${section.sectionId}`];
        const val = serializeValue(raw, section.type);
        if (val !== undefined) params[`f_${section.sectionId}_1`] = val;
      }
    }
  }

  return params;
}
