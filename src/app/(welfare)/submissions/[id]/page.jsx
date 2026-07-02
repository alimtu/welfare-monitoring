'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { PencilIcon, Trash2Icon, SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BackHeader } from '@/components/welfare/BackHeader';
import { IndicatorInfo } from '@/components/welfare/IndicatorInfo';
import { ExpertAnalysisView } from '@/components/welfare/ExpertAnalysisView';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { getIndicator } from '@/lib/welfare/indicators';
import { formatValue, formatNumber, formatDateTime, toPersianDigits, formatCriterionValue, SUBMISSION_STATUS } from '@/lib/welfare/format';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getSubmission, deleteSubmission, periods } = useWelfare();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submission = getSubmission(id);

  if (!submission) {
    return (
      <div className="p-4">
        <EmptyState icon={SearchXIcon} title="ثبت یافت نشد" description="این ثبت وجود ندارد یا حذف شده است." action={<Button asChild><Link href="/submissions">بازگشت به ثبت‌ها</Link></Button>} />
      </div>
    );
  }

  const indicator = getIndicator(submission.indicatorId);
  const period = periods.find((p) => p.id === submission.periodId);
  const st = SUBMISSION_STATUS[submission.status] || SUBMISSION_STATUS.draft;

  const handleDelete = () => {
    deleteSubmission(submission.id);
    toast.success('ثبت حذف شد.');
    router.push('/submissions');
  };

  return (
    <div className="space-y-5 p-4">
      <BackHeader title={submission.indicatorTitle} fallbackHref="/submissions" />

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className={`rounded-full px-2 py-0.5 font-medium ${st.bg} ${st.text}`}>{st.label}</span>
        {period && <span className="rounded-full bg-grey-100 px-2 py-0.5 text-grey-600">{period.title}</span>}
        <span className="text-grey-400">{formatDateTime(submission.submittedAt)}</span>
      </div>

      {indicator && <IndicatorInfo indicator={indicator} />}

      {/* Submitted data */}
      <div className="rounded-xl border border-grey-100 bg-white p-4">
        <p className="mb-3 text-sm font-bold text-grey-800">داده‌های ثبت‌شده</p>
        {submission.indicatorType === 'checklist' ? (
          <ul className="space-y-2">
            {(submission.criteriaScores || []).map((c) => (
              <li key={c.criterionId} className="flex items-start justify-between gap-2 border-b border-grey-50 pb-2 last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-grey-700">{c.title}</p>
                  <p className="mt-0.5 text-[11px] text-grey-400">{formatCriterionValue(c)}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-grey-700">
                  {toPersianDigits(formatNumber(c.score, 1))} / {toPersianDigits(c.maxScore)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            {(indicator?.inputFields || []).map((f) => (
              <li key={f.key} className="flex items-center justify-between gap-2 border-b border-grey-50 pb-2 last:border-0">
                <span className="text-xs text-grey-600">{f.label}</span>
                <span className="shrink-0 text-xs font-semibold text-grey-800">
                  {formatNumber(submission.inputData?.[f.key] ?? 0, 0)}
                  {f.unit ? ` ${f.unit}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Calculation breakdown */}
      <div className="space-y-2.5 rounded-xl border border-grey-100 bg-white p-4">
        <p className="text-sm font-bold text-grey-800">جزئیات محاسبه</p>
        {submission.indicatorType === 'checklist' ? (
          <>
            <Row label="امتیاز کسب‌شده" value={`${toPersianDigits(formatNumber(submission.totalScore, 0))} از ${toPersianDigits(formatNumber(submission.maxTotalScore, 0))}`} />
            <Row label="درصد" value={`${formatNumber(submission.percentage, 1)}٪`} />
          </>
        ) : (
          <Row label="مقدار محاسبه‌شده" value={formatValue(submission.calculatedValue, submission.resultUnit)} />
        )}
        <Row label="بازه امتیاز" value={submission.matchedBand?.description || '—'} />
        <Row label="وزن شاخص" value={toPersianDigits(submission.weight)} />
        <Row label="امتیاز وزن‌دهی‌شده" value={toPersianDigits(submission.weightedScore)} />
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-grey-600">امتیاز نهایی</span>
          <ScoreBadge score={submission.finalScore} />
        </div>
      </div>

      {/* Expert analysis */}
      <ExpertAnalysisView text={submission.expertAnalysis} />

      {/* Notes */}
      {submission.notes && (
        <div className="rounded-xl border border-grey-100 bg-white p-4">
          <p className="mb-1.5 text-xs font-bold text-grey-700">یادداشت</p>
          <p className="text-xs leading-relaxed text-grey-600">{submission.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="h-11 flex-1">
          <Link href={`/submit/${submission.indicatorType}/${submission.indicatorId}`}>
            <PencilIcon className="size-4" />
            ویرایش
          </Link>
        </Button>
        <Button variant="outline" className="h-11 flex-1 text-danger-500 hover:text-danger-600" onClick={() => setConfirmOpen(true)}>
          <Trash2Icon className="size-4" />
          حذف
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف ثبت</DialogTitle>
            <DialogDescription>آیا از حذف این ثبت مطمئن هستید؟ این عمل قابل بازگشت نیست.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>انصراف</Button>
            <Button className="bg-danger-500 hover:bg-danger-600" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-grey-500">{label}</span>
      <span className="text-xs font-semibold text-grey-800">{value}</span>
    </div>
  );
}
