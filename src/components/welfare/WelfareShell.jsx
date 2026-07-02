'use client';

import { Loader2Icon } from 'lucide-react';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { PeriodSelector } from './PeriodSelector';
import { WelfareNav } from './WelfareNav';

/**
 * Chrome shared by all welfare pages: a sticky period-selector sub-header
 * (below the global app header), the page content, and the bottom tab nav.
 * Renders a loading state until localStorage has been hydrated.
 */
export function WelfareShell({ children }) {
  const { ready } = useWelfare();

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100dvh-56px)] items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-14 z-30 border-b border-grey-100 bg-white px-4 py-2.5">
        <PeriodSelector />
      </div>
      <div className="min-h-[calc(100dvh-160px)]">{children}</div>
      <WelfareNav />
    </div>
  );
}
