'use client';

import { cn } from '@/lib/utils';

/**
 * Dashboard summary card with an icon, label and value.
 * @param {{icon:Function, label:string, value:React.ReactNode, hint?:string, accentClassName?:string}} props
 */
export function StatCard({ icon: Icon, label, value, hint, accentClassName = 'bg-primary-50 text-primary-500' }) {
  return (
    <div className="rounded-xl border border-grey-100 bg-white p-3.5">
      <div className="flex items-center gap-2">
        <span className={cn('flex size-8 items-center justify-center rounded-lg', accentClassName)}>
          {Icon && <Icon className="size-4" />}
        </span>
        <span className="text-xs text-grey-500">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-grey-800">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-grey-400">{hint}</p>}
    </div>
  );
}
