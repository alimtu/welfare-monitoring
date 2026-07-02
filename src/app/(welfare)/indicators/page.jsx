'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { INDICATORS } from '@/lib/welfare/indicators';
import { toPersianDigits } from '@/lib/welfare/format';

const TYPE_LABEL = { direct: 'فرمول مستقیم', checklist: 'چک‌لیست' };

export default function IndicatorsPage() {
  const { currentPeriod, getSubmissionForIndicator } = useWelfare();
  const [filter, setFilter] = useState('all');

  const list = useMemo(
    () => INDICATORS.filter((ind) => filter === 'all' || ind.type === filter),
    [filter],
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-grey-800">شاخص‌ها</h1>
        <span className="text-xs text-grey-400">{currentPeriod?.title}</span>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1 text-xs">همه</TabsTrigger>
          <TabsTrigger value="direct" className="flex-1 text-xs">فرمول مستقیم</TabsTrigger>
          <TabsTrigger value="checklist" className="flex-1 text-xs">چک‌لیست</TabsTrigger>
        </TabsList>
      </Tabs>

      <ul className="space-y-2.5">
        {list.map((ind) => {
          const sub = currentPeriod ? getSubmissionForIndicator(currentPeriod.id, ind.id) : null;
          return (
            <li key={ind.id}>
              <Link
                href={`/submit/${ind.type}/${ind.id}`}
                className="flex items-center gap-3 rounded-xl border border-grey-100 bg-white p-3.5 transition-colors hover:border-primary-100 hover:bg-primary-50/30"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">
                  {toPersianDigits(ind.code)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-grey-800">{ind.title}</p>
                  <p className="mt-0.5 text-[11px] text-grey-400">
                    {TYPE_LABEL[ind.type]} · وزن {toPersianDigits(ind.weight)}
                  </p>
                </div>
                {sub ? (
                  <ScoreBadge score={sub.finalScore} showLabel={false} />
                ) : (
                  <ChevronLeftIcon className="size-4 shrink-0 text-grey-300" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
