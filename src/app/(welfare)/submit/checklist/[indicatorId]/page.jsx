'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { SaveIcon, SendIcon, SearchXIcon, CalendarPlusIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { NumberInput } from '@/components/welfare/NumberInput';
import { BackHeader } from '@/components/welfare/BackHeader';
import { IndicatorInfo } from '@/components/welfare/IndicatorInfo';
import { ExpertAnalysisView } from '@/components/welfare/ExpertAnalysisView';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { EmptyState } from '@/components/welfare/EmptyState';
import { cn } from '@/lib/utils';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { getIndicator } from '@/lib/welfare/indicators';
import { calculateChecklist, isChecklistComplete } from '@/lib/welfare/calculations';
import { buildSubmission } from '@/lib/welfare/submission';
import { generateExpertAnalysis } from '@/lib/welfare/analysis';
import { formatNumber, toPersianDigits, scoreMeta, formatCriterionValue } from '@/lib/welfare/format';

export default function ChecklistSubmitPage() {
  const { indicatorId } = useParams();
  const { currentPeriod, getSubmissionForIndicator } = useWelfare();
  const indicator = getIndicator(indicatorId);

  if (!indicator || indicator.type !== 'checklist') {
    return (
      <div className="p-4">
        <EmptyState icon={SearchXIcon} title="شاخص یافت نشد" description="این شاخص وجود ندارد یا از نوع چک‌لیست نیست." />
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
  return <ChecklistForm indicator={indicator} period={currentPeriod} existing={existing} />;
}

function ChecklistForm({ indicator, period, existing }) {
  const router = useRouter();
  const { saveSubmission, getPreviousScore } = useWelfare();

  // Nested inputs: { criterionId: { ...fields } }
  const [inputs, setInputs] = useState(() => cloneInputs(existing?.checklistInputs));
  const [notes, setNotes] = useState(existing?.notes || '');

  const result = useMemo(() => calculateChecklist(indicator, inputs), [indicator, inputs]);
  const analysis = useMemo(() => generateExpertAnalysis(indicator, result), [indicator, result]);

  const scoreById = useMemo(() => {
    const map = {};
    result.criteriaScores.forEach((r) => { map[r.criterionId] = r; });
    return map;
  }, [result]);

  const complete = isChecklistComplete(indicator, inputs);
  const anyFilled = result.criteriaScores.some((r) => r.filled);
  const meta = scoreMeta(result.finalScore);

  const setField = (criterionId, key, value) =>
    setInputs((prev) => ({ ...prev, [criterionId]: { ...prev[criterionId], [key]: value } }));

  const setOption = (criterionId, optionValue) =>
    setInputs((prev) => ({ ...prev, [criterionId]: { option: optionValue } }));

  const handleSave = (status) => {
    if (status === 'submitted' && !complete) {
      toast.error('برای ثبت نهایی، همه معیارها را تکمیل کنید.');
      return;
    }
    const record = buildSubmission({
      periodId: period.id,
      indicatorId: indicator.id,
      checklistInputs: inputs,
      status,
      notes,
      previousScore: getPreviousScore(indicator.id, period.id),
      id: existing?.id,
    });
    saveSubmission(record);
    toast.success(status === 'submitted' ? 'شاخص با موفقیت ثبت شد.' : 'پیش‌نویس ذخیره شد.');
    router.push(status === 'submitted' ? `/submissions/${record.id}` : '/submissions');
  };

  return (
    <div className="space-y-5 px-4 pt-4 pb-28">
      <BackHeader title={indicator.title} fallbackHref="/indicators" />

      <div className="rounded-md bg-primary-50 px-3 py-1.5 text-[11px] text-primary-600">
        دوره ثبت: {period.title}
      </div>

      <IndicatorInfo indicator={indicator} />

      {/* Measurement criteria */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-grey-800">ارزیابی معیارها</h2>
        {indicator.criteria.map((c, idx) => (
          <CriterionCard
            key={c.id}
            index={idx}
            criterion={c}
            input={inputs[c.id] || {}}
            row={scoreById[c.id]}
            onField={setField}
            onOption={setOption}
          />
        ))}
      </div>

      {/* Running result */}
      <div className="space-y-3 rounded-xl border border-grey-100 bg-white p-4">
        <p className="text-sm font-bold text-grey-800">نتیجه ارزیابی</p>
        {!anyFilled ? (
          <p className="text-xs text-grey-400">برای مشاهده نتیجه، معیارها را تکمیل کنید.</p>
        ) : (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-grey-500">امتیاز کسب‌شده</span>
                <span className="font-bold text-grey-800">
                  {toPersianDigits(formatNumber(result.totalScore, 1))} از {toPersianDigits(formatNumber(result.maxTotalScore, 0))}
                </span>
              </div>
              <Progress value={result.percentage} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-grey-500">درصد</span>
              <span className="text-sm font-bold text-grey-800">{formatNumber(result.percentage, 1)}٪</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-grey-500">بازه امتیاز</span>
              <span className="text-xs text-grey-600">{result.matchedBand?.description || '—'}</span>
            </div>
            <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${meta.bg}`}>
              <span className={`text-xs font-medium ${meta.text}`}>امتیاز نهایی</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-grey-500">وزن‌دهی: {toPersianDigits(result.weightedScore)}</span>
                <ScoreBadge score={result.finalScore} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">یادداشت (اختیاری)</Label>
        <Textarea id="notes" rows={3} placeholder="توضیحات تکمیلی..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {anyFilled && <ExpertAnalysisView text={analysis} />}

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center safe-bottom">
        <div className="flex w-full max-w-[480px] gap-3 border-t border-grey-100 bg-white/95 p-4 backdrop-blur-sm">
          <Button variant="outline" className="h-11 flex-1" onClick={() => handleSave('draft')}>
            <SaveIcon className="size-4" />
            ذخیره پیش‌نویس
          </Button>
          <Button className="h-11 flex-1" onClick={() => handleSave('submitted')} disabled={!complete}>
            <SendIcon className="size-4" />
            ثبت نهایی
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Renders one criterion: header + measurement inputs (by type) + earned score. */
function CriterionCard({ index, criterion, input, row, onField, onOption }) {
  const m = criterion.measure;
  return (
    <div className="rounded-xl border border-grey-100 p-3.5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-grey-800">
            {toPersianDigits(index + 1)}. {criterion.title}
          </p>
          {criterion.description && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-grey-400">{criterion.description}</p>
          )}
        </div>
        <span className="shrink-0 rounded bg-grey-100 px-1.5 py-0.5 text-[10px] text-grey-500">
          حداکثر {toPersianDigits(criterion.maxScore)}
        </span>
      </div>

      {/* Inputs by measure type */}
      {m.type === 'select' && (
        <div className="space-y-2">
          {m.options.map((o) => {
            const sel = input.option === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onOption(criterion.id, o.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors',
                  sel ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-grey-100 bg-white text-grey-600 hover:border-grey-200',
                )}
              >
                <span className="flex items-center gap-2 text-right">
                  <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border', sel ? 'border-primary-500 bg-primary-500 text-white' : 'border-grey-300')}>
                    {sel && <CheckIcon className="size-3 stroke-[3]" />}
                  </span>
                  {o.label}
                </span>
                <span className={cn('shrink-0 font-bold', sel ? 'text-primary-600' : 'text-grey-400')}>{toPersianDigits(o.score)}</span>
              </button>
            );
          })}
        </div>
      )}

      {(m.type === 'count' || m.type === 'percent') && (
        <NumField field={m.input} value={input[m.input.key] ?? ''} onChange={(v) => onField(criterion.id, m.input.key, v)} />
      )}

      {m.type === 'ratio' && (
        <div className="space-y-2.5">
          <NumField field={m.numerator} value={input[m.numerator.key] ?? ''} onChange={(v) => onField(criterion.id, m.numerator.key, v)} />
          <NumField field={m.denominator} value={input[m.denominator.key] ?? ''} onChange={(v) => onField(criterion.id, m.denominator.key, v)} />
        </div>
      )}

      {m.type === 'qualityAverage' && (
        <div className="space-y-2.5">
          {m.levels.map((lvl) => (
            <NumField
              key={lvl.value}
              field={{ key: lvl.value, label: `تعداد مراکز — ${lvl.label} (${toPersianDigits(lvl.score)})`, unit: 'مرکز' }}
              value={input[lvl.value] ?? ''}
              onChange={(v) => onField(criterion.id, lvl.value, v)}
            />
          ))}
        </div>
      )}

      {/* Earned score for this criterion */}
      <div className="mt-3 flex items-center justify-between border-t border-grey-50 pt-2.5 text-xs">
        <span className="text-grey-500">
          {row?.filled ? `مقدار: ${formatCriterionValue(row)}` : 'در انتظار ورود داده'}
        </span>
        <span className={cn('font-bold', row?.filled ? 'text-primary-600' : 'text-grey-300')}>
          امتیاز: {toPersianDigits(formatNumber(row?.score || 0, 1))} از {toPersianDigits(criterion.maxScore)}
        </span>
      </div>
    </div>
  );
}

function NumField({ field, value, onChange }) {
  return (
    <div className="space-y-1" data-field>
      <Label htmlFor={field.key} className="text-[11px] text-grey-600">{field.label}</Label>
      <NumberInput id={field.key} value={value} unit={field.unit} onChange={onChange} />
    </div>
  );
}

/** Deep-clone existing nested inputs so editing doesn't mutate stored state. */
function cloneInputs(saved) {
  const out = {};
  if (saved && typeof saved === 'object') {
    for (const [cid, fields] of Object.entries(saved)) {
      out[cid] = { ...fields };
    }
  }
  return out;
}
