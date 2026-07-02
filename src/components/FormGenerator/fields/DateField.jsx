'use client';

import { useState, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import { DirectionProvider } from '../../ui/direction';
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS_SHORT,
  getJalaliMonthDays,
  jalaliToGregorian,
  gregorianToJalali,
  formatJalali,
  dayjs,
} from '../../../lib/utils/jalali';

function JalaliCalendar({ selected, onSelect }) {
  const today = dayjs().calendar('jalali');
  const todayJY = today.year();
  const todayJM = today.month();
  const todayJD = today.date();

  const initial = selected ? gregorianToJalali(selected) : { jYear: todayJY, jMonth: todayJM };
  const [viewYear, setViewYear] = useState(initial.jYear);
  const [viewMonth, setViewMonth] = useState(initial.jMonth);

  const selJalali = selected ? gregorianToJalali(selected) : null;
  const days = useMemo(() => getJalaliMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isSelected = (d) =>
    selJalali && selJalali.jYear === viewYear && selJalali.jMonth === viewMonth && selJalali.jDay === d;

  const isToday = (d) =>
    todayJY === viewYear && todayJM === viewMonth && todayJD === d;

  return (
    <div className="w-[280px]" dir="rtl">
      <div className="flex items-center justify-between px-1 pb-3">
        <button type="button" onClick={prevMonth} className="p-1 text-grey-400 hover:text-grey-600">
          <ChevronRightIcon className="size-4" />
        </button>
        <span className="text-sm font-semibold text-grey-700">
          {JALALI_MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} className="p-1 text-grey-400 hover:text-grey-600">
          <ChevronLeftIcon className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {JALALI_WEEKDAYS_SHORT.map((d, idx) => (
          <div key={d} className={`text-center text-[10px] py-1 ${idx === 6 ? 'text-danger-400' : 'text-grey-400'}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const sel = isSelected(d);
          const tod = isToday(d);
          const isFriday = i % 7 === 6;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(jalaliToGregorian(viewYear, viewMonth, d))}
              className={`relative h-8 rounded-md text-sm transition-colors ${
                sel
                  ? 'bg-primary-500 text-white font-medium'
                  : tod
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : isFriday
                      ? 'text-danger-400 hover:bg-danger-50'
                      : 'text-grey-700 hover:bg-grey-50'
              }`}
            >
              {d}
              {tod && !sel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateField({ name, control, section }) {
  const { trigger } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field, fieldState }) => {
        const [isOpen, setIsOpen] = useState(false);

        const handleSelect = (date) => {
          field.onChange(date);
          trigger(name);
          setIsOpen(false);
        };

        const handleToday = () => {
          handleSelect(new Date());
        };

        return (
          <div>
            <Label className="text-xs text-grey-500 font-normal">
              {section.title}
              {section.required && <span className="text-danger-500 mr-0.5">*</span>}
            </Label>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onBlur={field.onBlur}
                  aria-invalid={!!fieldState.error}
                  className={`flex w-full items-center justify-between h-10 rounded-lg border bg-white px-3 text-sm mt-1 transition-all focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-none ${
                    fieldState.error ? 'border-danger-400 ring-1 ring-danger-100' : 'border-grey-200'
                  }`}
                >
                  {field.value ? (
                    <span className="text-grey-800">{formatJalali(field.value)}</span>
                  ) : (
                    <span className="text-grey-400">{section.placeholder || 'انتخاب تاریخ'}</span>
                  )}
                  <CalendarIcon className="size-4 text-grey-300" />
                </button>
              </PopoverTrigger>
              <DirectionProvider dir="rtl">
                <PopoverContent className="w-auto p-3" align="start">
                  <JalaliCalendar
                    selected={field.value}
                    onSelect={handleSelect}
                  />
                  <div className="flex justify-end pt-3 mt-3 border-t border-grey-100" dir="rtl">
                    <Button type="button" variant="ghost" size="sm" onClick={handleToday} className="h-7 px-2 text-xs text-primary-500 hover:text-primary-600">
                      امروز
                    </Button>
                  </div>
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
