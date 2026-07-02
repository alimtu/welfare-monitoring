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

export default function CascadeSelectField({ name, control, section }) {
  const categories = section.options || [];
  const subOptionsMap = section.options2 || {};

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={{ category: '', sub: '' }}
      render={({ field, fieldState }) => {
        const val = field.value || { category: '', sub: '' };
        const subEntries = val.category ? Object.entries(subOptionsMap[val.category] || {}) : [];

        const setCategory = (cat) => {
          field.onChange({ category: cat, sub: '' });
        };

        const setSub = (sub) => {
          field.onChange({ ...val, sub });
        };

        const catError = fieldState.error?.category?.message || fieldState.error?.message;
        const subError = fieldState.error?.sub?.message;

        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-grey-500 font-normal">
                {section.title}
                {section.required && <span className="text-danger-500 mr-0.5">*</span>}
              </Label>
              {section.placeholder && (
                <p className="text-[11px] text-grey-300 mt-0.5">{section.placeholder}</p>
              )}
              <Select dir="rtl" value={val.category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1" aria-invalid={!!catError}>
                  <SelectValue placeholder="انتخاب دسته" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat, i) => (
                    <SelectItem key={i} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {catError && (
                <p className="text-[11px] text-danger-500 mt-1">{catError}</p>
              )}
            </div>

            <div>
              <Label className="text-xs text-grey-500 font-normal">
                زیر‌دسته
                {section.required && <span className="text-danger-500 mr-0.5">*</span>}
              </Label>
              <Select dir="rtl" value={val.sub} onValueChange={setSub} disabled={!val.category}>
                <SelectTrigger className="mt-1" disabled={!val.category} aria-invalid={!!subError}>
                  <SelectValue placeholder="انتخاب زیر‌دسته" />
                </SelectTrigger>
                <SelectContent>
                  {subEntries.map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subError && (
                <p className="text-[11px] text-danger-500 mt-1">{subError}</p>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
