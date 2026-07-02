'use client';

import { FileTextIcon } from 'lucide-react';
import { toPersianDigits } from '@/lib/welfare/format';

const TYPE_LABEL = { direct: 'فرمول مستقیم', checklist: 'چک‌لیست' };

/** Info header shown at the top of a submission page. */
export function IndicatorInfo({ indicator }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-600">
          شاخص {toPersianDigits(indicator.code)}
        </span>
        <span className="rounded-md bg-grey-100 px-2 py-0.5 text-[11px] text-grey-600">
          {TYPE_LABEL[indicator.type]}
        </span>
        <span className="rounded-md bg-grey-100 px-2 py-0.5 text-[11px] text-grey-600">
          وزن {toPersianDigits(indicator.weight)}
        </span>
      </div>

      <h1 className="text-base font-bold text-grey-800">{indicator.title}</h1>

      {indicator.definition && (
        <p className="text-xs leading-relaxed text-grey-500">{indicator.definition}</p>
      )}

      {indicator.formulaDisplay && (
        <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-3">
          <p className="mb-1 text-[11px] font-medium text-grey-500">فرمول محاسبه</p>
          <p className="text-xs font-semibold text-primary-700" dir="rtl">
            {indicator.formulaDisplay}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-[#dcfce7] px-3 py-2">
        <span className="text-[11px] font-medium text-[#15803d]">استاندارد مطلوب:</span>
        <span className="text-xs font-semibold text-[#166534]">{indicator.optimalStandard}</span>
      </div>

      {indicator.requiredDocuments?.length > 0 && (
        <div className="rounded-lg border border-grey-100 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-grey-500">
            <FileTextIcon className="size-3.5" />
            مستندات پیشنهادی
          </div>
          <ul className="list-inside list-disc space-y-0.5 text-[11px] text-grey-500">
            {indicator.requiredDocuments.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
