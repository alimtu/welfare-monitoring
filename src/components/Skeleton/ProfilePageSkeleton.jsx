'use client';

import Skeleton from './Skeleton';

export default function ProfilePageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="w-full p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>

      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
