'use client';

import Skeleton from './Skeleton';

export default function PostsPageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="w-full px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-grey-100 overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      <span className="sr-only">در حال بارگذاری...</span>
    </div>
  );
}
