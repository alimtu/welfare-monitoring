'use client';

import Skeleton from './Skeleton';

export default function ChartsPageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="w-full p-4 space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-grey-100 bg-white p-4 flex flex-col items-center gap-2">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-grey-100 bg-white overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="px-4 pb-4 space-y-3">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-4/5 rounded-full" />
            <Skeleton className="h-2 w-3/4 rounded-full" />
          </div>
        </div>
      ))}

      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
