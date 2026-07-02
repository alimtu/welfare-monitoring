'use client';

import { Separator } from './separator';
import { cn } from '@/lib/utils';

export function Divider({ label, className, orientation = 'horizontal', ...props }) {
  if (!label) {
    return <Separator orientation={orientation} className={cn('my-4', className)} {...props} />;
  }

  return (
    <div className={cn('flex items-center gap-3 my-4', className)} {...props}>
      <Separator className="flex-1" />
      <span className="text-xs text-grey-400 whitespace-nowrap">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
