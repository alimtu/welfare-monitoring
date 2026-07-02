'use client';

import { WifiOffIcon, RefreshCwIcon } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="size-16 rounded-full bg-grey-50 flex items-center justify-center mb-4">
        <WifiOffIcon className="size-7 text-grey-400" />
      </div>
      <h1 className="text-base font-bold text-grey-800 mb-2">اتصال اینترنت قطع است</h1>
      <p className="text-sm text-grey-500 mb-6 max-w-xs">
        لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors active:scale-95"
      >
        <RefreshCwIcon className="size-4" />
        <span>تلاش مجدد</span>
      </button>
    </div>
  );
}
