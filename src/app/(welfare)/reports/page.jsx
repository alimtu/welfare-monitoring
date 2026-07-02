'use client';

import Link from 'next/link';
import { FileBarChartIcon, TrendingUpIcon, ChevronLeftIcon } from 'lucide-react';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { calcOverallPeriodScore } from '@/lib/welfare/calculations';
import { toPersianDigits, formatNumber } from '@/lib/welfare/format';

export default function ReportsPage() {
  const { currentPeriod, submissionsForPeriod } = useWelfare();
  const overall = currentPeriod ? calcOverallPeriodScore(submissionsForPeriod(currentPeriod.id)) : 0;

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-base font-bold text-grey-800">گزارش‌ها</h1>

      {currentPeriod && (
        <div className="rounded-xl bg-primary-500 p-4 text-white">
          <p className="text-xs opacity-90">امتیاز کلی «{currentPeriod.title}»</p>
          <p className="mt-1 text-3xl font-extrabold">
            {toPersianDigits(formatNumber(overall, 1))}
            <span className="text-base font-medium opacity-80"> / ۱۰</span>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {currentPeriod && (
          <Link
            href={`/reports/period/${currentPeriod.id}`}
            className="flex items-center gap-3 rounded-xl border border-grey-100 bg-white p-4 transition-colors hover:border-primary-100"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
              <FileBarChartIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-grey-800">گزارش دوره</p>
              <p className="mt-0.5 text-[11px] text-grey-400">خلاصه عملکرد و امتیاز همه شاخص‌ها</p>
            </div>
            <ChevronLeftIcon className="size-4 text-grey-300" />
          </Link>
        )}

        <Link
          href="/reports/trends"
          className="flex items-center gap-3 rounded-xl border border-grey-100 bg-white p-4 transition-colors hover:border-primary-100"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#b45309]">
            <TrendingUpIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-grey-800">تحلیل روند</p>
            <p className="mt-0.5 text-[11px] text-grey-400">مقایسه شاخص‌ها در دوره‌های مختلف</p>
          </div>
          <ChevronLeftIcon className="size-4 text-grey-300" />
        </Link>
      </div>
    </div>
  );
}
