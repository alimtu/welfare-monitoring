'use client';

import { InboxIcon } from 'lucide-react';

/**
 * Friendly empty-state block with an optional action button/link.
 * @param {{icon?:Function, title:string, description?:string, action?:React.ReactNode}} props
 */
export function EmptyState({ icon: Icon = InboxIcon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-grey-50">
        <Icon className="size-6 text-grey-400" />
      </div>
      <p className="text-sm font-semibold text-grey-700">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs leading-relaxed text-grey-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
