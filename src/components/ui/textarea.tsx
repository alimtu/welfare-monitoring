import * as React from 'react';

import { cn } from '@/lib/utils';

function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (ch) => String(ch.charCodeAt(0) - 0x0660));
}

function Textarea({ className, onChange, ...props }: React.ComponentProps<'textarea'>) {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.target.value = toEnglishDigits(e.target.value);
      onChange?.(e);
    },
    [onChange],
  );

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-grey-400 flex min-h-[80px] w-full rounded-lg border border-grey-200 bg-white px-3 py-2.5 text-sm shadow-xs transition-all outline-none resize-none',
        'focus:border-primary-400 focus:ring-1 focus:ring-primary-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Textarea };
