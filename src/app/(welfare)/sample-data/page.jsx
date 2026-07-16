'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DatabaseIcon,
  DownloadIcon,
  RotateCcwIcon,
  CalendarRangeIcon,
  ClipboardListIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BackHeader } from '@/components/welfare/BackHeader';
import { KEYS } from '@/lib/welfare/storage';
import { applyBundle, restoreBackup, hasBackup, tryParse } from '@/lib/welfare/deviceData';
import { SAMPLE_DATASET } from '@/lib/welfare/sampleData';
import { toPersianDigits } from '@/lib/welfare/format';

export default function SampleDataPage() {
  const [backupExists, setBackupExists] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setBackupExists(hasBackup());
  }, []);

  const info = useMemo(() => {
    const bundle = SAMPLE_DATASET.bundle || {};
    const periods = tryParse(bundle[KEYS.periods]);
    const submissions = tryParse(bundle[KEYS.submissions]);
    return {
      periods: Array.isArray(periods) ? periods : [],
      submissionCount: Array.isArray(submissions) ? submissions.length : 0,
    };
  }, []);

  // Replace this device's data with the sample dataset (backing current data up).
  const useDataset = () => {
    try {
      applyBundle(SAMPLE_DATASET.bundle);
      // Full reload so WelfareProvider re-hydrates from the loaded data.
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[sample-data] load failed', err);
      toast.error('بارگذاری ناموفق بود');
      setConfirmOpen(false);
    }
  };

  const handleRestore = () => {
    if (restoreBackup()) window.location.href = '/dashboard';
    else toast.error('نسخه پشتیبان قابل خواندن نیست');
  };

  return (
    <div className="space-y-4 p-4">
      <BackHeader title="استفاده از داده نمونه" />

      {/* Shown once sample data has been loaded: one-tap return to own data. */}
      {backupExists && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-amber-800">داده نمونه بارگذاری شده است</p>
            <p className="mt-0.5 text-[10px] text-amber-600">داده قبلی شما پشتیبان‌گیری شده است.</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" onClick={handleRestore}>
            <RotateCcwIcon className="size-4" />
            بازگردانی داده من
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DatabaseIcon className="size-4 text-primary-500" />
            {SAMPLE_DATASET.label}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {SAMPLE_DATASET.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What's inside the dataset */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-grey-50 px-3 py-2.5">
              <CalendarRangeIcon className="size-4 shrink-0 text-primary-500" />
              <span>
                <span className="block text-[10px] text-grey-400">دوره‌ها</span>
                <span className="text-sm font-bold text-grey-800">
                  {toPersianDigits(info.periods.length)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-grey-50 px-3 py-2.5">
              <ClipboardListIcon className="size-4 shrink-0 text-primary-500" />
              <span>
                <span className="block text-[10px] text-grey-400">ثبت‌ها</span>
                <span className="text-sm font-bold text-grey-800">
                  {toPersianDigits(info.submissionCount)}
                </span>
              </span>
            </div>
          </div>

          {/* Period titles, if any */}
          {info.periods.length > 0 && (
            <ul className="divide-y divide-grey-100 rounded-lg border border-grey-100">
              {info.periods.map((p, i) => (
                <li
                  key={p?.id ?? i}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-grey-700"
                >
                  <span className="truncate">{p?.title || `دوره ${toPersianDigits(i + 1)}`}</span>
                  {p?.status && <span className="shrink-0 text-[10px] text-grey-400">{p.status}</span>}
                </li>
              ))}
            </ul>
          )}

          <Button className="h-11 w-full" onClick={() => setConfirmOpen(true)}>
            <DownloadIcon className="size-4" />
            استفاده از این داده
          </Button>
          <p className="text-[10px] leading-relaxed text-grey-400">
            با تأیید، داده فعلی این دستگاه با داده نمونه جایگزین می‌شود. پیش از جایگزینی از داده شما
            پشتیبان گرفته می‌شود و هر زمان می‌توانید آن را بازگردانید.
          </p>
        </CardContent>
      </Card>

      {/* Confirm before replacing the visitor's data. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>استفاده از داده نمونه؟</DialogTitle>
            <DialogDescription>
              داده فعلی این دستگاه با داده نمونه جایگزین می‌شود تا بتوانید برنامه را با داده واقعی
              ببینید. یک نسخه پشتیبان از داده شما گرفته می‌شود و می‌توانید بعداً آن را بازگردانید. پس از
              جایگزینی به داشبورد منتقل می‌شوید.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              انصراف
            </Button>
            <Button onClick={useDataset}>
              <DownloadIcon className="size-4" />
              استفاده کن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
