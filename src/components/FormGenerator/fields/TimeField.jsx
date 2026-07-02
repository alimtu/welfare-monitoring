'use client';

import { useState, useCallback, memo } from 'react';
import { Controller } from 'react-hook-form';
import { ClockIcon } from 'lucide-react';
import { Label } from '../../ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import { DirectionProvider } from '../../ui/direction';
import { TimePickerV2Content } from './time-picker-v2/TimePickerV2Content';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toPersian = (str) => str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);

export default function TimeField({ name, control, section }) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [tempValue, setTempValue] = useState(field.value || '');

        const handleOpenChange = (open) => {
          if (open) setTempValue(field.value || '');
          setIsOpen(open);
        };

        const handleConfirm = () => {
          field.onChange(tempValue);
          setIsOpen(false);
        };

        const handleCancel = () => {
          setTempValue(field.value || '');
          setIsOpen(false);
        };

        return (
          <div>
            <Label className="text-xs text-grey-500 font-normal">
              {section.title}
              {section.required && <span className="text-danger-500 mr-0.5">*</span>}
            </Label>
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between h-10 rounded-lg border bg-white px-3 text-sm mt-1 transition-all focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none ${
                    fieldState.error ? 'border-danger-400 ring-1 ring-danger-100' : 'border-grey-200'
                  }`}
                >
                  {field.value ? (
                    <span className="text-grey-800 tabular-nums">{toPersian(field.value)}</span>
                  ) : (
                    <span className="text-grey-400">انتخاب ساعت</span>
                  )}
                  <ClockIcon className="size-4 text-grey-300" />
                </button>
              </PopoverTrigger>
              <DirectionProvider dir="rtl">
                <PopoverContent className="w-auto p-0" align="start">
                  <TimePickerV2Content
                    value={tempValue}
                    onChange={setTempValue}
                    showSeconds={false}
                    showNowButton={true}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                  />
                </PopoverContent>
              </DirectionProvider>
            </Popover>
            {fieldState.error && (
              <p className="text-[11px] text-danger-500 mt-1">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
