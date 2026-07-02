'use client';

import Skeleton from './Skeleton';

export default function HomePageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="w-full">
      <div className="p-4 space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-px flex-1" />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-grey-100 p-4">
            <Skeleton className="size-10 rounded-lg shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="size-4 rounded shrink-0" />
          </div>
        ))}
      </div>
      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
