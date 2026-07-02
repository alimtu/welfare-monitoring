'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from 'lucide-react';

/** Simple back-button + title row used at the top of detail/submission pages. */
export function BackHeader({ title, fallbackHref = '/dashboard' }) {
  const router = useRouter();
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={goBack}
        className="-mr-1 rounded-md p-1 text-grey-400 transition-colors hover:bg-grey-50 hover:text-grey-700"
        aria-label="بازگشت"
      >
        <ArrowRightIcon className="size-5" />
      </button>
      <h1 className="truncate text-sm font-bold text-grey-800">{title}</h1>
    </div>
  );
}
