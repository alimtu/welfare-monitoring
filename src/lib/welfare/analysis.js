/**
 * Expert analysis generator — produces Persian narrative text for a submission
 * based on its calculated value, final score and the indicator's optimal standard.
 */
import { formatValue, formatNumber, toPersianDigits } from './format';

const STATUS_BY_SCORE = {
  10: 'عملکرد در سطح عالی و بالاتر از استاندارد مطلوب است.',
  7: 'عملکرد در سطح خوب اما نیازمند بهبود برای رسیدن به استاندارد مطلوب است.',
  4: 'عملکرد در سطح متوسط و نیازمند توجه جدی برای بهبود است.',
  1: 'عملکرد در سطح ضعیف و نیازمند اقدامات فوری اصلاحی است.',
};

const SUGGESTION_BY_SCORE = {
  10: 'حفظ روند فعلی و مستندسازی تجربه‌های موفق برای تداوم عملکرد مطلوب توصیه می‌شود.',
  7: 'با تقویت برنامه‌ریزی و تخصیص منابع بیشتر می‌توان به استاندارد مطلوب دست یافت.',
  4: 'بازنگری در فرآیندها و افزایش تخصیص منابع برای بهبود شاخص ضروری است.',
  1: 'تدوین برنامه اصلاحی فوری و اولویت‌دهی به این شاخص در دوره آتی الزامی است.',
};

/**
 * @param {Object} indicator
 * @param {Object} result calculation result ({calculatedValue|percentage, finalScore, ...})
 * @param {Object} [options]
 * @param {number} [options.previousScore] score from the previous period, if any
 */
export function generateExpertAnalysis(indicator, result, options = {}) {
  const score = result.finalScore || 0;

  const valueText =
    indicator.type === 'checklist'
      ? `${formatNumber(result.percentage, 1)}٪ (${formatNumber(result.totalScore, 0)} از ${formatNumber(
          result.maxTotalScore,
          0,
        )} امتیاز)`
      : formatValue(result.calculatedValue, indicator.resultUnit);

  const lines = [];
  lines.push(`تحلیل کارشناسی شاخص «${indicator.title}»:`);
  lines.push('');
  lines.push(`مقدار محاسبه‌شده: ${valueText}`);
  lines.push(`امتیاز نهایی: ${toPersianDigits(score)} از ۱۰`);
  lines.push(`استاندارد مطلوب: ${indicator.optimalStandard}`);
  lines.push('');
  lines.push('ارزیابی وضعیت:');
  lines.push(STATUS_BY_SCORE[score] || 'وضعیت این شاخص هنوز ارزیابی نشده است.');
  lines.push('');
  lines.push('پیشنهادات بهبود:');
  lines.push(SUGGESTION_BY_SCORE[score] || 'داده‌ای برای ارائه پیشنهاد در دسترس نیست.');

  if (typeof options.previousScore === 'number') {
    lines.push('');
    lines.push('مقایسه با دوره قبل:');
    const diff = score - options.previousScore;
    if (diff > 0) {
      lines.push(`نسبت به دوره قبل ${toPersianDigits(diff)} امتیاز بهبود داشته است.`);
    } else if (diff < 0) {
      lines.push(`نسبت به دوره قبل ${toPersianDigits(Math.abs(diff))} امتیاز کاهش داشته است.`);
    } else {
      lines.push('نسبت به دوره قبل تغییری نداشته است.');
    }
  }

  return lines.join('\n');
}
