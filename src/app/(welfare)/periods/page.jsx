'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, CheckIcon, FlagIcon, Trash2Icon, CalendarRangeIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { PERIOD_STATUS, formatDate, toPersianDigits } from '@/lib/welfare/format';

export default function PeriodsPage() {
  const {
    periods,
    submissionsForPeriod,
    createPeriod,
    setActivePeriod,
    completePeriod,
    deletePeriod,
    resetDemoData,
  } = useWelfare();

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '' });
  const [toDelete, setToDelete] = useState(null);

  const handleCreate = () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast.error('لطفاً عنوان و تاریخ‌های شروع و پایان را کامل کنید.');
      return;
    }
    if (form.endDate < form.startDate) {
      toast.error('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
      return;
    }
    createPeriod({ title: form.title.trim(), startDate: form.startDate, endDate: form.endDate });
    toast.success('دوره ارزیابی ایجاد شد.');
    setForm({ title: '', startDate: '', endDate: '' });
    setCreateOpen(false);
  };

  const handleDelete = () => {
    if (!toDelete) return;
    deletePeriod(toDelete.id);
    toast.success('دوره حذف شد.');
    setToDelete(null);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-grey-800">مدیریت دوره‌ها</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          دوره جدید
        </Button>
      </div>

      {periods.length === 0 ? (
        <EmptyState
          icon={CalendarRangeIcon}
          title="دوره‌ای تعریف نشده است"
          description="برای شروع ارزیابی، یک دوره جدید ایجاد کنید."
          action={<Button onClick={() => setCreateOpen(true)}>ایجاد دوره</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {periods.map((p) => {
            const status = PERIOD_STATUS[p.status] || PERIOD_STATUS.draft;
            const count = submissionsForPeriod(p.id).filter((s) => s.status === 'submitted').length;
            return (
              <li key={p.id} className="rounded-xl border border-grey-100 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-grey-800">{p.title}</p>
                    <p className="mt-1 text-xs text-grey-500">
                      {formatDate(p.startDate)} تا {formatDate(p.endDate)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-grey-400">
                      {toPersianDigits(count)} شاخص ثبت‌شده
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-grey-50 pt-3">
                  {p.status !== 'active' && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setActivePeriod(p.id)}>
                      <CheckIcon className="size-3.5" />
                      فعال‌سازی
                    </Button>
                  )}
                  {p.status !== 'completed' && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => completePeriod(p.id)}>
                      <FlagIcon className="size-3.5" />
                      تکمیل دوره
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-danger-500 hover:text-danger-600"
                    onClick={() => setToDelete(p)}
                  >
                    <Trash2Icon className="size-3.5" />
                    حذف
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            toast.success('داده‌های نمونه بازنشانی شد.');
          }}
          className="flex items-center gap-1.5 text-[11px] text-grey-400 hover:text-grey-600"
        >
          <RotateCcwIcon className="size-3.5" />
          بازنشانی داده‌های نمونه
        </button>
      </div>

      {/* Create period dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ایجاد دوره ارزیابی</DialogTitle>
            <DialogDescription>عنوان و بازه زمانی دوره را وارد کنید.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-title">عنوان دوره</Label>
              <Input
                id="p-title"
                placeholder="مثلاً دوره ارزیابی ۱۴۰۴"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-start">تاریخ شروع</Label>
                <Input
                  id="p-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-end">تاریخ پایان</Label>
                <Input
                  id="p-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handleCreate}>ایجاد دوره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف دوره</DialogTitle>
            <DialogDescription>
              با حذف «{toDelete?.title}» تمام ثبت‌های مرتبط با آن نیز حذف می‌شوند. این عمل قابل بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              انصراف
            </Button>
            <Button className="bg-danger-500 hover:bg-danger-600" onClick={handleDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
