'use client';

import { CalendarRangeIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { PERIOD_STATUS } from '@/lib/welfare/format';

/**
 * Period picker shown in the welfare sub-header. Switches which period the app
 * is focused on (dashboard, submissions, submit). Does not change status.
 */
export function PeriodSelector() {
  const { periods, currentPeriodId, setCurrentPeriodId } = useWelfare();

  if (periods.length === 0) {
    return <p className="text-xs text-grey-400">دوره‌ای تعریف نشده است</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <CalendarRangeIcon className="size-4 shrink-0 text-primary-500" />
      <span className="shrink-0 text-xs text-grey-500">دوره ارزیابی:</span>
      <Select value={currentPeriodId || undefined} onValueChange={setCurrentPeriodId}>
        <SelectTrigger className="h-8 flex-1 text-xs">
          <SelectValue placeholder="انتخاب دوره" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((p) => {
            const status = PERIOD_STATUS[p.status] || PERIOD_STATUS.draft;
            return (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.title} ({status.label})
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
