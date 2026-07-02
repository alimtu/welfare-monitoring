'use client';

import { WifiOffIcon } from 'lucide-react';

export default function OfflineIndicator() {
  return (
    <div className="fixed top-0 inset-x-0 z-[70] bg-danger-500 text-white text-center py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-medium safe-top">
      <WifiOffIcon className="size-3.5" />
      <span>اتصال اینترنت قطع است</span>
    </div>
  );
}
