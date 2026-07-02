'use client';

import { SparklesIcon } from 'lucide-react';

/** Renders auto-generated Persian expert analysis text (preserves line breaks). */
export function ExpertAnalysisView({ text }) {
  if (!text) return null;
  return (
    <div className="rounded-xl border border-grey-100 bg-grey-50/60 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-grey-700">
        <SparklesIcon className="size-4 text-primary-500" />
        تحلیل کارشناسی
      </div>
      <p className="whitespace-pre-line text-xs leading-relaxed text-grey-600">{text}</p>
    </div>
  );
}
