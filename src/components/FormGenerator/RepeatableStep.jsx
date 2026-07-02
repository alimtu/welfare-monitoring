'use client';

import { useFieldArray } from 'react-hook-form';
import { PlusIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import FieldRenderer from './FieldRenderer';

export default function RepeatableStep({ step, control }) {
  const arrayName = `rows_${step.stepId}`;
  const sections = step.sections || [];
  const maxRows = step.numrow;

  const { fields, append, remove } = useFieldArray({
    control,
    name: arrayName,
  });

  if (fields.length === 0) {
    append({});
  }

  const addRow = () => {
    if (fields.length < maxRows) append({});
  };

  const removeRow = (index) => {
    if (fields.length > 1) remove(index);
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-xl border border-grey-100 bg-white overflow-hidden"
        >
          <div className="flex items-center justify-between bg-grey-25 px-3 py-2 border-b border-grey-100">
            <span className="text-xs font-medium text-grey-600">
              ردیف {index + 1}
            </span>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="flex items-center gap-1 text-[11px] text-danger-500 hover:text-danger-600 transition-colors"
              >
                <XIcon className="size-3.5" />
                <span>حذف</span>
              </button>
            )}
          </div>

          <div className="space-y-4 p-3">
            {sections.map((section) => (
              <FieldRenderer
                key={section.sectionId}
                section={section}
                control={control}
                namePrefix={`${arrayName}.${index}.`}
              />
            ))}
          </div>
        </div>
      ))}

      {fields.length < maxRows && (
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          className="w-full h-10 gap-1.5 border-dashed"
        >
          <PlusIcon className="size-4" />
          <span>افزودن ردیف</span>
          <span className="text-grey-400 text-[11px] mr-1">
            ({fields.length} از {maxRows})
          </span>
        </Button>
      )}
    </div>
  );
}
