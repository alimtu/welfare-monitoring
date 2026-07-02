'use client';

import { Controller } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

export default function TextField({ name, control, section }) {
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
          </Label>
          <Input
            id={name}
            {...field}
            placeholder={section.placeholder || section.title}
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
