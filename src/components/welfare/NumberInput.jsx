'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/lib/welfare/format';

/**
 * Numeric input that displays digits grouped by 3 (thousands separators) using
 * Persian digits, while reporting the raw numeric string to `onChange`.
 *
 * Uses type="text" (a native number input can't render separators). Input is
 * normalized on every keystroke: Persian/Arabic digits -> Latin, non-numeric
 * characters stripped, at most one decimal point kept.
 *
 * @param {{ value: string|number, onChange: (raw: string) => void, unit?: string,
 *           id?: string, placeholder?: string, className?: string }} props
 */
export function NumberInput({ value, onChange, unit, id, placeholder = '۰', className }) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={formatGrouped(value)}
        onChange={(e) => onChange(normalizeNumeric(e.target.value))}
        className={cn(unit && 'pl-16', className)}
      />
      {unit && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-grey-400">
          {unit}
        </span>
      )}
    </div>
  );
}

const LATIN = '0123456789';

/** Convert Persian (۰-۹) and Arabic-Indic (٠-٩) digits to Latin. */
function toLatinDigits(s) {
  return String(s)
    .replace(/[۰-۹]/g, (d) => LATIN['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
    .replace(/[٠-٩]/g, (d) => LATIN['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
}

/** Strip a display string down to a raw numeric string (Latin digits, one dot). */
export function normalizeNumeric(str) {
  let s = toLatinDigits(str).replace(/[^0-9.]/g, '');
  const i = s.indexOf('.');
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '');
  return s;
}

/** Group the integer part by 3 and render with Persian digits. */
export function formatGrouped(raw) {
  if (raw === '' || raw == null) return '';
  const str = String(raw);
  const hasDot = str.includes('.');
  const [intPart, ...rest] = str.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toPersianDigits(hasDot ? `${grouped}.${rest.join('')}` : grouped);
}
