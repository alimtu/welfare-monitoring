'use client';

import { Controller } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export default function NumberField({ name, control, section }) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState }) => (
        <div>
          <Label htmlFor={name} className="text-xs text-grey-500 font-normal">
            {section.title}
            {section.required && <span className="text-danger-500 mr-0.5">*</span>}
            {section.placeholder && (
              <span className="text-grey-300 mr-1">({section.placeholder})</span>
            )}
          </Label>
          <Input
            id={name}
            type="number"
            inputMode="decimal"
            {...field}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={section.placeholder || '0'}
            aria-invalid={!!fieldState.error}
            className="mt-1"
          />
          {fieldState.error && (
            <p className="text-[11px] text-danger-500 mt-1">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
