'use client';

import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { toPersianDigits, formatNumber } from '@/lib/welfare/format';

/** Arrow + coloured delta between the first and last period. */
function Delta({ value }) {
  if (value == null) return <span className="text-[10px] text-grey-300">—</span>;
  const Icon = value > 0 ? TrendingUpIcon : value < 0 ? TrendingDownIcon : MinusIcon;
  const tone =
    value > 0 ? 'text-[#15803d]' : value < 0 ? 'text-[#b91c1c]' : 'text-grey-400';
  return (
    <span className={`flex items-center justify-center gap-0.5 text-[11px] font-medium ${tone}`}>
      <Icon className="size-3.5" />
      {value === 0 ? '۰' : toPersianDigits(formatNumber(Math.abs(value), 0))}
    </span>
  );
}

/**
 * Indicators ranked by their average score across all periods, with the
 * first→last change for each.
 * @param {{stats: Array<{ind:Object, avg:number, delta:number, latest:number|null}>}} props
 */
export function IndicatorRanking({ stats }) {
  const ranked = [...stats].sort((a, b) => b.avg - a.avg);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right text-[11px]">رتبه</TableHead>
            <TableHead className="text-right text-[11px]">شاخص</TableHead>
            <TableHead className="text-center text-[11px]">میانگین</TableHead>
            <TableHead className="text-center text-[11px]">آخرین</TableHead>
            <TableHead className="text-center text-[11px]">تغییر</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranked.map((s, i) => (
            <TableRow key={s.ind.id}>
              <TableCell className="text-[11px] text-grey-400">{toPersianDigits(i + 1)}</TableCell>
              <TableCell className="max-w-[140px] truncate text-[11px] text-grey-700">
                {toPersianDigits(s.ind.code)}. {s.ind.title}
              </TableCell>
              <TableCell className="text-center text-[11px] font-medium text-grey-700">
                {toPersianDigits(formatNumber(s.avg, 1))}
              </TableCell>
              <TableCell className="text-center">
                {s.latest != null ? (
                  <ScoreBadge score={s.latest} showLabel={false} />
                ) : (
                  <span className="text-[10px] text-grey-300">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Delta value={s.delta} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
