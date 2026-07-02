'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { SaveIcon, SendIcon, SearchXIcon, CalendarPlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NumberInput } from '@/components/welfare/NumberInput';
import { BackHeader } from '@/components/welfare/BackHeader';
import { IndicatorInfo } from '@/components/welfare/IndicatorInfo';
import { ExpertAnalysisView } from '@/components/welfare/ExpertAnalysisView';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { getIndicator } from '@/lib/welfare/indicators';
import { calculateDirect } from '@/lib/welfare/calculations';
import { buildSubmission } from '@/lib/welfare/submission';
import { generateExpertAnalysis } from '@/lib/welfare/analysis';
import { formatValue, formatNumber, toPersianDigits, scoreMeta } from '@/lib/welfare/format';

export default function DirectSubmitPage() {
  const { indicatorId } = useParams();
  const { currentPeriod, getSubmissionForIndicator } = useWelfare();
  const indicator = getIndicator(indicatorId);

  if (!indicator || indicator.type !== 'direct') {
    return (
      <div className="p-4">
        <EmptyState icon={SearchXIcon} title="شاخص یافت نشد" description="این شاخص وجود ندارد یا از نوع فرمول مستقیم نیست." />
      </div>
    );
  }

  if (!currentPeriod) {
    return (
      <div className="p-4">
        <EmptyState
          icon={CalendarPlusIcon}
          title="دوره فعالی انتخاب نشده است"
          description="برای ثبت داده، ابتدا یک دوره ارزیابی را فعال کنید."
          action={<Button asChild><Link href="/periods">مدیریت دوره‌ها</Link></Button>}
        />
      </div>
    );
  }

  const existing = getSubmissionForIndicator(currentPeriod.id, indicator.id);
  return <DirectForm indicator={indicator} period={currentPeriod} existing={existing} />;
}

function DirectForm({ indicator, period, existing }) {
  const router = useRouter();
  const { saveSubmission, getPreviousScore } = useWelfare();

  const [values, setValues] = useState(() => {
    const init = {};
    indicator.inputFields.forEach((f) => {
      init[f.key] = existing?.inputData?.[f.key] != null ? String(existing.inputData[f.key]) : '';
    });
    return init;
  });
  const [notes, setNotes] = useState(existing?.notes || '');

  const inputData = useMemo(() => {
    const d = {};
    indicator.inputFields.forEach((f) => {
      d[f.key] = Number(values[f.key]) || 0;
    });
    return d;
  }, [values, indicator]);

  const result = useMemo(() => calculateDirect(indicator, inputData), [indicator, inputData]);
  const analysis = useMemo(() => generateExpertAnalysis(indicator, result), [indicator, result]);

  const anyFilled = indicator.inputFields.some((f) => values[f.key] !== '');
  const allFilled = indicator.inputFields.every((f) => values[f.key] !== '' && !Number.isNaN(Number(values[f.key])));

  const setField = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  const handleSave = (status) => {
    if (status === 'submitted' && !allFilled) {
      toast.error('برای ثبت نهایی، همه فیلدها را تکمیل کنید.');
      return;
    }
    const record = buildSubmission({
      periodId: period.id,
      indicatorId: indicator.id,
      inputData,
      status,
      notes,
      previousScore: getPreviousScore(indicator.id, period.id),
      id: existing?.id,
    });
    saveSubmission(record);
    toast.success(status === 'submitted' ? 'شاخص با موفقیت ثبت شد.' : 'پیش‌نویس ذخیره شد.');
    router.push(status === 'submitted' ? `/submissions/${record.id}` : '/submissions');
  };

  // Grouped fields (e.g. the welfare budget breakdown) get a subtotal row.
  const grouped = indicator.inputFields.filter((f) => f.group);
  const ungrouped = indicator.inputFields.filter((f) => !f.group);
  const groupName = grouped[0]?.group;
  const groupSubtotal = grouped.reduce((s, f) => s + (Number(values[f.key]) || 0), 0);

  return (
    <div className="space-y-5 px-4 pt-4 pb-28">
      <BackHeader title={indicator.title} fallbackHref="/indicators" />

      <div className="rounded-md bg-primary-50 px-3 py-1.5 text-[11px] text-primary-600">
        دوره ثبت: {period.title}
      </div>

      <IndicatorInfo indicator={indicator} />

      {/* Input form */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-grey-800">مقادیر ورودی</h2>

        {grouped.length > 0 && (
          <div className="space-y-3 rounded-xl border border-grey-100 p-3">
            <p className="text-xs font-semibold text-grey-600">{groupName}</p>
            {grouped.map((f) => (
              <NumberField key={f.key} field={f} value={values[f.key]} onChange={setField} />
            ))}
            <div className="flex items-center justify-between border-t border-grey-100 pt-2 text-xs">
              <span className="text-grey-500">مجموع {groupName}</span>
              <span className="font-bold text-grey-800">{formatNumber(groupSubtotal, 0)} ریال</span>
            </div>
          </div>
        )}

        {ungrouped.map((f) => (
          <NumberField key={f.key} field={f} value={values[f.key]} onChange={setField} />
        ))}
      </div>

      {/* Live calculation */}
      <ResultPanel indicator={indicator} result={result} show={anyFilled} />

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">یادداشت (اختیاری)</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="توضیحات تکمیلی..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Expert analysis preview */}
      {anyFilled && <ExpertAnalysisView text={analysis} />}

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center safe-bottom">
        <div className="flex w-full max-w-[480px] gap-3 border-t border-grey-100 bg-white/95 p-4 backdrop-blur-sm">
          <Button variant="outline" className="h-11 flex-1" onClick={() => handleSave('draft')}>
            <SaveIcon className="size-4" />
            ذخیره پیش‌نویس
          </Button>
          <Button className="h-11 flex-1" onClick={() => handleSave('submitted')} disabled={!allFilled}>
            <SendIcon className="size-4" />
            ثبت نهایی
          </Button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <div className="space-y-1.5" data-field>
      <Label htmlFor={field.key} className="text-xs">
        {field.label}
      </Label>
      <NumberInput id={field.key} value={value} unit={field.unit} onChange={(raw) => onChange(field.key, raw)} />
    </div>
  );
}

function ResultPanel({ indicator, result, show }) {
  const meta = scoreMeta(result.finalScore);
  return (
    <div className="space-y-3 rounded-xl border border-grey-100 bg-white p-4">
      <p className="text-sm font-bold text-grey-800">نتیجه محاسبه</p>
      {!show ? (
        <p className="text-xs text-grey-400">برای مشاهده نتیجه، مقادیر را وارد کنید.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-grey-500">مقدار محاسبه‌شده</span>
            <span className="text-sm font-bold text-grey-800">
              {formatValue(result.calculatedValue, indicator.resultUnit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-grey-500">بازه امتیاز</span>
            <span className="text-xs text-grey-600">{result.matchedBand?.description || '—'}</span>
          </div>
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${meta.bg}`}>
            <span className={`text-xs font-medium ${meta.text}`}>امتیاز نهایی</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-grey-500">
                وزن‌دهی: {toPersianDigits(result.weightedScore)}
              </span>
              <ScoreBadge score={result.finalScore} />
            </div>
          </div>

          {/* Scoring bands reference */}
          <div className="space-y-1 border-t border-grey-100 pt-2">
            <p className="text-[11px] font-medium text-grey-400">جدول امتیازدهی</p>
            {indicator.scoringBands.map((b, i) => {
              const active = b.score === result.finalScore && result.matchedBand === b;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded px-2 py-1 text-[11px] ${
                    active ? 'bg-primary-50 font-semibold text-primary-700' : 'text-grey-500'
                  }`}
                >
                  <span>{b.description}</span>
                  <span>امتیاز {toPersianDigits(b.score)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
