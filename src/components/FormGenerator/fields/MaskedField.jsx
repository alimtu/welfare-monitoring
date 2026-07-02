'use client';

import { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

const SEPARATOR_STATIC = /^[\-./:\s#]+$/;

function countEditableBefore(mask, index) {
  let count = 0;
  for (let i = 0; i < index; i++) {
    if (mask[i] === '9' || mask[i] === '*') count++;
  }
  return count;
}

function maskToPattern(mask) {
  if (!mask) return null;
  const pattern = [...String(mask)]
    .map((ch) => {
      if (ch === '9') return '\\d';
      if (ch === '*') return '.';
      return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${pattern}$`);
}

function extractFillable(input, mask) {
  const maskStr = String(mask);
  const fillable = [];
  let inputPos = 0;
  let maskPos = 0;

  while (maskPos < maskStr.length && inputPos < input.length) {
    const maskChar = maskStr[maskPos];

    if (maskChar !== '9' && maskChar !== '*') {
      if (input[inputPos] === maskChar) {
        inputPos++;
      }
      maskPos++;
      continue;
    }

    const valueChar = input[inputPos];
    if (maskChar === '9') {
      if (!/\d/.test(valueChar)) break;
      fillable.push(valueChar);
    } else {
      fillable.push(valueChar);
    }
    inputPos++;
    maskPos++;
  }

  return fillable;
}

function applyMaskFromFillable(fillable, mask) {
  const maskStr = String(mask);
  let result = '';
  let fillableIdx = 0;
  let maskIdx = 0;

  while (maskIdx < maskStr.length) {
    const maskChar = maskStr[maskIdx];

    if (maskChar === '9' || maskChar === '*') {
      if (fillableIdx >= fillable.length) break;
      if (maskChar === '9' && !/\d/.test(fillable[fillableIdx])) break;
      result += fillable[fillableIdx++];
      maskIdx++;
      continue;
    }

    const staticStart = maskIdx;
    let staticRun = '';
    while (maskIdx < maskStr.length && maskStr[maskIdx] !== '9' && maskStr[maskIdx] !== '*') {
      staticRun += maskStr[maskIdx];
      maskIdx++;
    }

    const editableBefore = countEditableBefore(maskStr, staticStart);
    const slotsBeforeFilled = fillableIdx >= editableBefore;
    const showStatic = slotsBeforeFilled && (
      SEPARATOR_STATIC.test(staticRun) || fillableIdx < fillable.length
    );

    if (showStatic) {
      result += staticRun;
    }
  }

  return result;
}

function applyMask(value, mask) {
  if (!mask) return value;
  const fillable = extractFillable(value, mask);
  return applyMaskFromFillable(fillable, mask);
}

function isNumericOnlyMask(mask) {
  if (!mask) return false;
  return !mask.includes('*') && [...String(mask)].every((ch) => ch === '9' || SEPARATOR_STATIC.test(ch));
}

export default function MaskedField({ name, control, section }) {
  const mask = section.option ? String(section.option) : null;
  const maxLen = mask ? mask.length : undefined;
  const regex = maskToPattern(mask);
  const inputMode = useMemo(() => (isNumericOnlyMask(mask) ? 'numeric' : 'text'), [mask]);

  const handleChange = useCallback(
    (e, fieldOnChange) => {
      const raw = e.target.value;
      if (mask) {
        fieldOnChange(applyMask(raw, mask));
      } else {
        fieldOnChange(raw);
      }
    },
    [mask],
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      rules={
        regex
          ? { pattern: { value: regex, message: `فرمت ${section.title} صحیح نیست` } }
          : undefined
      }
      render={({ field, fieldState }) => (
        <div>
          <Label htmlFor={name} className="text-xs text-grey-500 font-normal">
            {section.title}
            {section.required && <span className="text-danger-500 mr-0.5">*</span>}
          </Label>
          {section.placeholder && (
            <p className="text-[11px] text-grey-300 mt-0.5">{section.placeholder}</p>
          )}
          <Input
            id={name}
            value={field.value}
            onChange={(e) => handleChange(e, field.onChange)}
            onBlur={field.onBlur}
            placeholder={mask || section.placeholder || section.title}
            inputMode={inputMode}
            maxLength={maxLen}
            dir="ltr"
            aria-invalid={!!fieldState.error}
            className="mt-1 tracking-widest"
          />
          {fieldState.error && (
            <p className="text-[11px] text-danger-500 mt-1">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
