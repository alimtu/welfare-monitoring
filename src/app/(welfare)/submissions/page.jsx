'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { EyeIcon, PencilIcon, Trash2Icon, ArrowUpDownIcon, ClipboardListIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { getIndicator } from '@/lib/welfare/indicators';
import { formatValue, formatNumber, formatDate, SUBMISSION_STATUS } from '@/lib/welfare/format';

export default function SubmissionsPage() {
  const { currentPeriod, submissionsForPeriod, deleteSubmission } = useWelfare();
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('date');
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(() => {
    if (!currentPeriod) return [];
    let list = submissionsForPeriod(currentPeriod.id);
    if (status !== 'all') list = list.filter((s) => s.status === status);
    list = [...list].sort((a, b) =>
      sort === 'score' ? b.finalScore - a.finalScore : new Date(b.submittedAt) - new Date(a.submittedAt),
    );
    return list;
  }, [currentPeriod, submissionsForPeriod, status, sort]);

  const handleDelete = () => {
    if (!toDelete) return;
    deleteSubmission(toDelete.id);
    toast.success('ثبت حذف شد.');
    setToDelete(null);
  };

  const valueText = (s) =>
    s.indicatorType === 'checklist'
      ? `${formatNumber(s.percentage, 1)}٪`
      : formatValue(s.calculatedValue, s.resultUnit);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-grey-800">ثبت‌ها</h1>
        <Button asChild size="sm" variant="outline">
          <Link href="/indicators">
            <PlusIcon className="size-4" />
            ثبت جدید
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Tabs value={status} onValueChange={setStatus} className="flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1 text-xs">همه</TabsTrigger>
            <TabsTrigger value="submitted" className="flex-1 text-xs">ثبت‌شده</TabsTrigger>
            <TabsTrigger value="draft" className="flex-1 text-xs">پیش‌نویس</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 text-xs"
          onClick={() => setSort((s) => (s === 'date' ? 'score' : 'date'))}
        >
          <ArrowUpDownIcon className="size-3.5" />
          {sort === 'date' ? 'تاریخ' : 'امتیاز'}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardListIcon}
          title="ثبتی وجود ندارد"
          description="برای شروع، یکی از شاخص‌ها را ثبت کنید."
          action={<Button asChild><Link href="/indicators">مشاهده شاخص‌ها</Link></Button>}
        />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((s) => {
            const st = SUBMISSION_STATUS[s.status] || SUBMISSION_STATUS.draft;
            const indicator = getIndicator(s.indicatorId);
            return (
              <li key={s.id} className="rounded-xl border border-grey-100 bg-white p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-grey-800">{s.indicatorTitle}</p>
                    <p className="mt-0.5 text-[11px] text-grey-400">{formatDate(s.submittedAt)}</p>
                  </div>
                  <ScoreBadge score={s.finalScore} showLabel={false} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${st.bg} ${st.text}`}>{st.label}</span>
                  <span className="text-grey-500">مقدار: {valueText(s)}</span>
                </div>
                <div className="mt-3 flex gap-2 border-t border-grey-50 pt-3">
                  <Button asChild size="sm" variant="outline" className="h-8 flex-1 text-xs">
                    <Link href={`/submissions/${s.id}`}>
                      <EyeIcon className="size-3.5" />
                      مشاهده
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="h-8 flex-1 text-xs">
                    <Link href={`/submit/${s.indicatorType}/${s.indicatorId}`}>
                      <PencilIcon className="size-3.5" />
                      ویرایش
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-danger-500 hover:text-danger-600"
                    onClick={() => setToDelete(s)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف ثبت</DialogTitle>
            <DialogDescription>
              آیا از حذف ثبت «{toDelete?.indicatorTitle}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>انصراف</Button>
            <Button className="bg-danger-500 hover:bg-danger-600" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
