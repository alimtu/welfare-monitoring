'use client';

import { cn } from '@/lib/utils';
import { scoreMeta, toPersianDigits } from '@/lib/welfare/format';

/**
 * Color-coded score pill (green 10 / amber 7 / orange 4 / red 1 / grey 0).
 * @param {{score:number, showLabel?:boolean, className?:string}} props
 */
export function ScoreBadge({ score, showLabel = true, className }) {
  const meta = scoreMeta(score);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
        meta.bg,
        meta.text,
        meta.border,
        className,
      )}
    >
      <span>{toPersianDigits(score)}</span>
      {showLabel && <span className="font-medium opacity-90">· {meta.label}</span>}
    </span>
  );
}

/** Solid circular score chip used in tighter layouts. */
export function ScoreCircle({ score, className }) {
  const meta = scoreMeta(score);
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        meta.bg,
        meta.text,
        className,
      )}
    >
      {toPersianDigits(score)}
    </span>
  );
}
