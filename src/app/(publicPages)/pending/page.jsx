'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  ClipboardListIcon,
  SendIcon,
  Trash2Icon,
  LoaderIcon,
  WifiOffIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InboxIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/lib/hooks/usePWA';
import {
  usePendingSubmissions,
  flushOne,
} from '@/lib/hooks/usePendingSubmissions';
import { removePending } from '@/lib/offline/idb';
import { formatJalali } from '@/lib/utils/jalali';

const STATUS_META = {
  pending: { label: 'در انتظار ارسال', color: 'text-grey-500', Icon: ClipboardListIcon },
  sending: { label: 'در حال ارسال...', color: 'text-primary-500', Icon: LoaderIcon },
  failed: { label: 'ناموفق', color: 'text-danger-500', Icon: AlertCircleIcon },
};

export default function PendingPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const { items, loading } = usePendingSubmissions();
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const handleSendOne = async (record) => {
    if (!isOnline) {
      toast.error('برای ارسال به اینترنت نیاز است');
      return;
    }
    setBusyId(record.id);
    const result = await flushOne(record);
    setBusyId(null);
    if (result.ok) {
      toast.success(`فرم «${record.formTitle}» ارسال شد`);
    } else {
      toast.error(result.error?.message || 'خطا در ارسال فرم');
    }
  };

  const handleDelete = async (record) => {
    await removePending(record.id);
    toast.success('حذف شد');
  };

  const handleSendAll = async () => {
    if (!isOnline) {
      toast.error('برای ارسال به اینترنت نیاز است');
      return;
    }
    if (items.length === 0) return;

    setBulkBusy(true);
    let sent = 0;
    let failed = 0;

    for (const record of items) {
      const result = await flushOne(record);
      if (result.ok) sent++;
      else failed++;
    }

    setBulkBusy(false);

    if (sent > 0 && failed === 0) {
      toast.success(`${sent} فرم با موفقیت ارسال شد`);
    } else if (sent > 0 && failed > 0) {
      toast.success(`${sent} فرم ارسال شد، ${failed} فرم ناموفق`);
    } else {
      toast.error('ارسال فرم‌ها ناموفق بود');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-56px)]">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b border-grey-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 -mr-1 rounded-md text-grey-400 hover:text-grey-700 hover:bg-grey-50 transition-colors"
          >
            <ArrowRightIcon className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-grey-800">صف ارسال آفلاین</p>
            <p className="text-[11px] text-grey-400 mt-0.5">
              {items.length > 0
                ? `${items.length} فرم در انتظار ارسال`
                : 'فرمی در صف نیست'}
            </p>
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-warning-700">
          <WifiOffIcon className="size-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            اینترنت در دسترس نیست. هنگام اتصال می‌توانید فرم‌ها را ارسال کنید.
          </p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 p-4 space-y-2 pb-28">
        {loading ? (
          <p className="text-xs text-grey-400 text-center py-8">در حال بارگذاری...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-full bg-success-50 flex items-center justify-center mb-4">
              <CheckCircle2Icon className="size-8 text-success-500" />
            </div>
            <p className="text-sm font-semibold text-grey-700 mb-1">صف خالی است</p>
            <p className="text-xs text-grey-400">فرمی در انتظار ارسال نیست.</p>
          </div>
        ) : (
          items.map((record) => {
            const meta = STATUS_META[record.status] || STATUS_META.pending;
            const StatusIcon = meta.Icon;
            const isThisBusy = busyId === record.id || record.status === 'sending';
            return (
              <div
                key={record.id}
                className="rounded-xl border border-grey-100 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                    <InboxIcon className="size-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-grey-800 truncate">
                      {record.formTitle || 'فرم'}
                    </p>
                    <p className="text-[11px] text-grey-400 mt-0.5">
                      {formatJalali(record.createdAt)}
                    </p>
                  </div>
                </div>

                <div className={`mt-2 flex items-center gap-1.5 text-[11px] ${meta.color}`}>
                  <StatusIcon className={`size-3.5 ${record.status === 'sending' ? 'animate-spin' : ''}`} />
                  <span>{meta.label}</span>
                </div>

                {record.error && (
                  <p className="mt-1 text-[11px] text-danger-500 truncate">{record.error}</p>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    disabled={isThisBusy || bulkBusy || !isOnline}
                    onClick={() => handleSendOne(record)}
                  >
                    {isThisBusy ? (
                      <LoaderIcon className="size-3.5 animate-spin" />
                    ) : (
                      <>
                        <SendIcon className="size-3.5" />
                        ارسال
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-danger-500 border-danger-200 hover:bg-danger-50"
                    disabled={isThisBusy || bulkBusy}
                    onClick={() => handleDelete(record)}
                  >
                    <Trash2Icon className="size-3.5" />
                    حذف
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk send footer */}
      {items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center safe-bottom">
          <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-sm border-t border-grey-100 p-4">
            <Button
              type="button"
              onClick={handleSendAll}
              disabled={!isOnline || bulkBusy}
              className="w-full h-11"
            >
              {bulkBusy ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  <SendIcon className="size-4" />
                  ارسال همه ({items.length})
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
