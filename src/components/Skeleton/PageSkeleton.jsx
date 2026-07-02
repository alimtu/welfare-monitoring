'use client';

import Skeleton from './Skeleton';

/**
 * Generic fallback skeleton for pages without a specific skeleton.
 * Mobile-first, minimal layout.
 */
export default function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="w-full p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-grey-100 p-4 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>

      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
