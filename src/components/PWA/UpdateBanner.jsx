'use client';

import { RefreshCwIcon, XIcon } from 'lucide-react';

export default function UpdateBanner({ onUpdate, onDismiss }) {
  return (
    <div className="fixed bottom-8 inset-x-0 z-60 p-4 safe-bottom">
      <div className="mx-auto max-w-md bg-primary-600 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <RefreshCwIcon className="size-5 shrink-0" />
        <p className="flex-1 text-xs leading-relaxed">
          نسخه جدید در دسترس است.
        </p>
        <button
          type="button"
          onClick={onUpdate}
          className="text-xs font-medium bg-white text-primary-600 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors active:scale-95"
        >
          بروزرسانی
        </button>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="p-0.5 hover:bg-white/20 rounded-md transition-colors">
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
