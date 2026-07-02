'use client';

import { useState } from 'react';
import { DownloadIcon, XIcon } from 'lucide-react';

export default function InstallPrompt({ onInstall }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-55 p-3 safe-bottom">
      <div className="mx-auto max-w-md bg-white border border-grey-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
          <DownloadIcon className="size-5 text-primary-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-grey-800">نصب اپلیکیشن</p>
          <p className="text-[10px] text-grey-500 mt-0.5">برای دسترسی سریع‌تر نصب کنید</p>
        </div>
        <button
          type="button"
          onClick={onInstall}
          className="text-xs font-medium bg-primary-500 text-white rounded-lg px-3 py-1.5 hover:bg-primary-600 transition-colors active:scale-95 shrink-0"
        >
          نصب
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-grey-50 rounded-md transition-colors shrink-0"
        >
          <XIcon className="size-4 text-grey-400" />
        </button>
      </div>
    </div>
  );
}
