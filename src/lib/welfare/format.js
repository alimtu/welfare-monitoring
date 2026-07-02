/**
 * Display helpers: Persian digits, number/value formatting, Jalali dates,
 * and score -> color/label metadata used for the 10/7/4/1 color coding.
 */
import { format as formatJalali } from 'date-fns-jalali';

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert Latin digits in a string/number to Persian digits. */
export function toPersianDigits(input) {
  if (input == null) return '';
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Group a number with thousands separators and Persian digits. */
export function formatNumber(value, maximumFractionDigits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return toPersianDigits('0');
  const grouped = n.toLocaleString('en-US', { maximumFractionDigits });
  return toPersianDigits(grouped);
}

/**
 * Format a computed indicator value according to its result unit.
 * @param {number} value
 * @param {'rial'|'percent'|'area'|'number'} resultUnit
 */
export function formatValue(value, resultUnit) {
  switch (resultUnit) {
    case 'rial':
      return `${formatNumber(value, 0)} ریال`;
    case 'percent':
      return `${formatNumber(value, 1)}٪`;
    case 'area':
      return `${formatNumber(value, 2)} مترمربع`;
    case 'number':
    default:
      return formatNumber(value, 2);
  }
}

/** Format an ISO date string as a Jalali (Persian) date with Persian digits. */
export function formatDate(iso) {
  if (!iso) return '';
  try {
    return toPersianDigits(formatJalali(new Date(iso), 'yyyy/MM/dd'));
  } catch {
    return '';
  }
}

/** Format an ISO date-time as Jalali date + HH:mm. */
export function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return toPersianDigits(formatJalali(new Date(iso), 'yyyy/MM/dd - HH:mm'));
  } catch {
    return '';
  }
}

// Score color-coding (score 10 green, 7 amber, 4 orange, 1 red) ---------------
const SCORE_META = {
  10: { label: 'عالی', bg: 'bg-[#dcfce7]', text: 'text-[#15803d]', border: 'border-[#bbf7d0]', hex: '#16a34a' },
  7: { label: 'خوب', bg: 'bg-[#fef3c7]', text: 'text-[#b45309]', border: 'border-[#fde68a]', hex: '#f59e0b' },
  4: { label: 'متوسط', bg: 'bg-[#ffedd5]', text: 'text-[#c2410c]', border: 'border-[#fed7aa]', hex: '#f97316' },
  1: { label: 'ضعیف', bg: 'bg-[#fee2e2]', text: 'text-[#b91c1c]', border: 'border-[#fecaca]', hex: '#ef4444' },
  0: { label: 'ثبت نشده', bg: 'bg-grey-100', text: 'text-grey-500', border: 'border-grey-150', hex: '#9a9a9a' },
};

export function scoreMeta(score) {
  return SCORE_META[score] || SCORE_META[0];
}

/**
 * Human-readable measured value for a checklist criterion score row
 * (produced by buildCriteriaScores in calculations.js).
 */
export function formatCriterionValue(row) {
  if (!row || !row.filled) return '—';
  switch (row.measureType) {
    case 'select':
      return row.optionLabel || '—';
    case 'qualityAverage':
      return `میانگین ${formatNumber(row.value, 1)} امتیاز`;
    case 'percent':
    case 'ratio':
      return `${formatNumber(row.value, 1)}٪`;
    default: // count
      return `${formatNumber(row.value, 0)}${row.unit ? ` ${row.unit}` : ''}`;
  }
}

// Status labels/colors for submissions and periods ----------------------------
export const SUBMISSION_STATUS = {
  draft: { label: 'پیش‌نویس', bg: 'bg-grey-100', text: 'text-grey-600' },
  submitted: { label: 'ثبت‌شده', bg: 'bg-[#dcfce7]', text: 'text-[#15803d]' },
};

export const PERIOD_STATUS = {
  active: { label: 'فعال', bg: 'bg-[#dcfce7]', text: 'text-[#15803d]' },
  completed: { label: 'تکمیل‌شده', bg: 'bg-primary-100', text: 'text-primary-600' },
  draft: { label: 'پیش‌نویس', bg: 'bg-grey-100', text: 'text-grey-600' },
};
