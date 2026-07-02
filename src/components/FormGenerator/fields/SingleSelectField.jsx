'use client';

import { Controller } from 'react-hook-form';
import { Label } from '../../ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../ui/select';

export default function SingleSelectField({ name, control, section }) {
  const options = section.options || {};
  const entries = Array.isArray(options)
    ? options.map((label, i) => [String(i), label])
    : Object.entries(options);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState }) => (
        <div>
          <Label className="text-xs text-grey-500 font-normal">
            {section.title}
            {section.required && <span className="text-danger-500 mr-0.5">*</span>}
          </Label>
          {section.placeholder && (
            <p className="text-[11px] text-grey-300 mt-0.5">{section.placeholder}</p>
          )}
          <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="mt-1" aria-invalid={!!fieldState.error}>
              <SelectValue placeholder="انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {entries.map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error && (
            <p className="text-[11px] text-danger-500 mt-1">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
