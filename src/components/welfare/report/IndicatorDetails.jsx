'use client';

import { useState } from 'react';
import { ChevronDownIcon, SparklesIcon } from 'lucide-react';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { toPersianDigits, formatNumber, formatValue } from '@/lib/welfare/format';
import { cn } from '@/lib/utils';

/** Per-criterion breakdown table for checklist indicators. */
function CriteriaBreakdown({ criteria }) {
  if (!criteria?.length) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-grey-500">ریز معیارها</p>
      <ul className="divide-y divide-grey-100 rounded-lg border border-grey-100">
        {criteria.map((c) => (
          <li key={c.criterionId} className="flex items-start justify-between gap-2 px-2.5 py-1.5">
            <span className="min-w-0">
              <span className="block truncate text-[11px] text-grey-700">{c.title}</span>
              <span className="text-[10px] text-grey-400">
                {c.optionLabel
                  ? c.optionLabel
                  : c.value != null
                    ? `${toPersianDigits(formatNumber(c.value, 1))} ${c.unit || ''}`.trim()
                    : '—'}
                {c.bandDescription ? ` · ${c.bandDescription}` : ''}
              </span>
            </span>
            <span className="shrink-0 text-[11px] font-medium text-grey-600">
              {toPersianDigits(c.score)}/{toPersianDigits(c.maxScore)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Expandable per-indicator detail for one period: why it scored what it did
 * (matched band), the stored Persian expert analysis, and — for checklist
 * indicators — the full per-criterion breakdown.
 *
 * @param {{rows: Array<{ind:Object, sub:Object|null, score:number|null}>}} props
 */
export function IndicatorDetails({ rows }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="divide-y divide-grey-100 rounded-lg border border-grey-100">
      {rows.map(({ ind, sub, score }) => {
        const open = openId === ind.id;
        const hasDetail = Boolean(sub);
        return (
          <div key={ind.id}>
            <button
              type="button"
              disabled={!hasDetail}
              onClick={() => setOpenId(open ? null : ind.id)}
              className="flex w-full items-center justify-between gap-2 p-2.5 text-right disabled:opacity-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-grey-700">
                  {toPersianDigits(ind.code)}. {ind.title}
                </span>
                {sub?.matchedBand?.description && (
                  <span className="block truncate text-[10px] text-grey-400">
                    {sub.matchedBand.description}
                  </span>
                )}
              </span>
              {score != null ? (
                <ScoreBadge score={score} showLabel={false} />
              ) : (
                <span className="text-[10px] text-grey-300">ثبت‌نشده</span>
              )}
              {hasDetail && (
                <ChevronDownIcon
                  className={cn('size-4 shrink-0 text-grey-400 transition-transform', open && 'rotate-180')}
                />
              )}
            </button>

            {open && sub && (
              <div className="space-y-3 bg-grey-50/50 px-2.5 pb-3 pt-1">
                {/* Measured value / checklist total */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-grey-500">
                  <span>
                    مقدار:{' '}
                    <span className="font-medium text-grey-700">
                      {sub.indicatorType === 'checklist'
                        ? `${toPersianDigits(formatNumber(sub.percentage, 0))}٪ (${toPersianDigits(
                            sub.totalScore,
                          )} از ${toPersianDigits(sub.maxTotalScore)})`
                        : formatValue(sub.calculatedValue, sub.resultUnit)}
                    </span>
                  </span>
                  <span>
                    وزن: <span className="font-medium text-grey-700">{toPersianDigits(sub.weight)}</span>
                  </span>
                  <span>
                    امتیاز وزنی:{' '}
                    <span className="font-medium text-grey-700">
                      {toPersianDigits(formatNumber(sub.weightedScore, 0))}
                    </span>
                  </span>
                </div>

                <CriteriaBreakdown criteria={sub.criteriaScores} />

                {sub.expertAnalysis && (
                  <div className="rounded-lg border border-grey-100 bg-white p-2.5">
                    <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-grey-600">
                      <SparklesIcon className="size-3.5 text-primary-500" />
                      تحلیل کارشناسی
                    </p>
                    <p className="whitespace-pre-line text-[11px] leading-relaxed text-grey-600">
                      {sub.expertAnalysis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
