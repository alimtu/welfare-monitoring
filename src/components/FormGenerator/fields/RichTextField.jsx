'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { Label } from '../../ui/label';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

export default function RichTextField({ name, control, section }) {
  const modules = useMemo(() => ({ toolbar: TOOLBAR_OPTIONS }), []);

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

          <div
            className={`quill-wrapper mt-1.5 ${
              fieldState.error ? 'quill-error' : ''
            }`}
          >
            <ReactQuill
              theme="snow"
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              modules={modules}
              placeholder={section.placeholder || section.title}
            />
          </div>

          {fieldState.error && (
            <p className="text-[11px] text-danger-500 mt-1">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
