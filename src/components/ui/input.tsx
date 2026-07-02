import * as React from 'react';

import { cn } from '@/lib/utils/index';

function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660));
}

function Input({ className, type, onChange, ...props }: React.ComponentProps<'input'>) {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = toEnglishDigits(e.target.value);
      onChange?.(e);
    },
    [onChange],
  );

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-grey-400 flex h-10 w-full min-w-0 rounded-lg border border-grey-200 bg-white px-3 py-2 text-sm shadow-xs transition-all outline-none',
        'focus:border-primary-400 focus:ring-1 focus:ring-primary-200',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-danger-400 aria-invalid:ring-1 aria-invalid:ring-danger-100',
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Input };
