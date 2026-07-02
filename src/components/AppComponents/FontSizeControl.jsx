'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.4;
const STEP = 0.1;
const STORAGE_KEY = 'university-welfare-monitoring-font-scale';

export default function FontSizeControl() {
  const [scale, setScale] = useState(1);

  // Load initial value from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = stored ? Number(stored) : 1;
    const clamped = Number.isFinite(initial)
      ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, initial))
      : 1;

    setScale(clamped);
    document.documentElement.style.setProperty('--font-scale', String(clamped));
  }, []);

  const updateScale = (next) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(clamped);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    }
    document.documentElement.style.setProperty('--font-scale', String(clamped));
  };

  const handleIncrease = () => updateScale(scale + STEP);
  const handleDecrease = () => updateScale(scale - STEP);
  const handleReset = () => updateScale(1);

  const percentage = Math.round(scale * 100);

  return (
    <div className="fixed bottom-4 left-4 z-[1100] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-md border border-gray-200 text-xs md:text-sm">
      <span className="hidden sm:inline text-gray-600">اندازه متن</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={handleDecrease}
        disabled={scale <= MIN_SCALE + 0.01}
        aria-label="کوچک‌تر کردن متن"
      >
        A-
      </Button>
      <span className="min-w-10 text-center text-gray-700">{percentage}%</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={handleIncrease}
        disabled={scale >= MAX_SCALE - 0.01}
        aria-label="بزرگ‌تر کردن متن"
      >
        A+
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 px-2 hidden md:inline"
        onClick={handleReset}
      >
        ریست
      </Button>
    </div>
  );
}


