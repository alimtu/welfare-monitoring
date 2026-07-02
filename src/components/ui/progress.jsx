'use client';

import { cn } from '@/lib/utils';

/**
 * Minimal progress bar (no external dependency).
 * @param {{value?: number, className?: string, indicatorClassName?: string}} props
 */
export function Progress({ value = 0, className, indicatorClassName, ...props }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-grey-100', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full bg-primary-500 transition-all duration-500', indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
