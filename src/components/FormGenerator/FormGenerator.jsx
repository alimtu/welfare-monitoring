'use client';

import { ChevronLeftIcon, ClipboardListIcon } from 'lucide-react';
import FormFlow from './FormFlow';

export default function FormGenerator({ forms, activeForm, onSelectForm }) {
  if (!forms || forms.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-grey-400">فرمی برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  if (activeForm) {
    return <FormFlow form={activeForm} onBack={() => onSelectForm(null)} />;
  }

  return (
    <div className="space-y-2">
      {forms.map((form) => (
        <button
          key={form.formId}
          type="button"
          onClick={() => onSelectForm(form)}
          className="flex w-full items-center gap-3 rounded-xl border border-grey-100 bg-white p-4 text-right transition-all active:scale-[0.98] hover:border-grey-200"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <ClipboardListIcon className="size-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-grey-800 truncate">{form.title}</p>
            <p className="text-xs text-grey-400 mt-0.5">{form.steps?.length || 0} مرحله</p>
          </div>
          <ChevronLeftIcon className="size-4 text-grey-300 shrink-0" />
        </button>
      ))}
    </div>
  );
}
