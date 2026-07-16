'use client';

import { INDICATORS } from '@/lib/welfare/indicators';
import { toPersianDigits, scoreMeta } from '@/lib/welfare/format';

/**
 * Every indicator (rows) × every period (columns) as a colour-coded matrix —
 * the whole dataset at a glance. Period columns are numbered to stay readable
 * on a narrow screen; the legend below maps numbers to period titles.
 *
 * @param {{periods: Array<{id:string, title:string, rows:Array}>}} props
 */
export function ScoreHeatmap({ periods }) {
  if (!periods?.length) return null;

  const template = `minmax(0,1fr) repeat(${periods.length}, 30px)`;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {/* Header: period numbers */}
        <div className="grid items-center gap-1" style={{ gridTemplateColumns: template }}>
          <span className="text-[10px] text-grey-400">شاخص</span>
          {periods.map((_, i) => (
            <span key={i} className="text-center text-[10px] font-medium text-grey-500">
              {toPersianDigits(i + 1)}
            </span>
          ))}
        </div>

        {/* One row per indicator */}
        {INDICATORS.map((ind) => (
          <div key={ind.id} className="grid items-center gap-1" style={{ gridTemplateColumns: template }}>
            <span className="truncate text-[10px] text-grey-600" title={ind.title}>
              {toPersianDigits(ind.code)}. {ind.title}
            </span>
            {periods.map((p) => {
              const score = p.rows.find((r) => r.ind.id === ind.id)?.score ?? null;
              const meta = score != null ? scoreMeta(score) : null;
              return (
                <span
                  key={p.id}
                  title={`${p.title} — ${ind.title}: ${score != null ? toPersianDigits(score) : 'ثبت‌نشده'}`}
                  className={`flex h-6 items-center justify-center rounded text-[10px] font-bold ${
                    meta ? `${meta.bg} ${meta.text}` : 'bg-grey-50 text-grey-300'
                  }`}
                >
                  {score != null ? toPersianDigits(score) : '—'}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend: number → period title */}
      <ul className="space-y-0.5 border-t border-grey-100 pt-2">
        {periods.map((p, i) => (
          <li key={p.id} className="flex gap-1.5 text-[10px] text-grey-400">
            <span className="font-medium text-grey-500">{toPersianDigits(i + 1)}.</span>
            <span className="truncate">{p.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
