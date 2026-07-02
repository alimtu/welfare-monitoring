'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../../ui/button';
import { cn } from '../../../../lib/utils';

const toPersianDigits = (num) => {
  const pd = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => pd[parseInt(d)]);
};

export const TimePickerV2Content = memo(function TimePickerV2Content({
  value,
  onChange,
  minuteInterval = 1,
  use12Hour = false,
  className,
  disabled = false,
  startHour,
  endHour,
  onConfirm,
  onCancel,
  showConfirmButtons = true,
  showSeconds = false,
  showNowButton = true,
}) {
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);

  const [selectedTime, setSelectedTime] = useState(() => {
    if (value) {
      const parts = value.split(':');
      return {
        hours: parseInt(parts[0]) || 0,
        minutes: parseInt(parts[1]) || 0,
        seconds: parseInt(parts[2]) || 0,
      };
    }
    return { hours: 10, minutes: 0, seconds: 0 };
  });

  const hourOptions = useMemo(() => {
    const start = startHour ?? (use12Hour ? 1 : 0);
    const end = endHour ?? (use12Hour ? 12 : 23);
    const opts = [];
    for (let i = start; i <= end; i++) opts.push(i);
    return opts;
  }, [use12Hour, startHour, endHour]);

  const minuteOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 60; i += minuteInterval) opts.push(i);
    return opts;
  }, [minuteInterval]);

  const secondOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 60; i++) opts.push(i);
    return opts;
  }, []);

  const scrollToSelected = useCallback((containerRef, val, options) => {
    if (!containerRef.current) return;
    const index = options.indexOf(val);
    if (index === -1) return;
    const container = containerRef.current;
    const buttons = container.querySelectorAll('button');
    if (!buttons.length || index >= buttons.length) return;
    const target = buttons[index];
    const scrollTop = target.offsetTop + target.offsetHeight / 2 - container.clientHeight / 2;
    const max = container.scrollHeight - container.clientHeight;
    container.scrollTo({ top: Math.max(0, Math.min(scrollTop, max)), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const ts = showSeconds
      ? `${String(selectedTime.hours).padStart(2, '0')}:${String(selectedTime.minutes).padStart(2, '0')}:${String(selectedTime.seconds).padStart(2, '0')}`
      : `${String(selectedTime.hours).padStart(2, '0')}:${String(selectedTime.minutes).padStart(2, '0')}`;
    onChange?.(ts);
  }, [selectedTime, onChange, showSeconds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToSelected(hoursRef, selectedTime.hours, hourOptions);
      scrollToSelected(minutesRef, selectedTime.minutes, minuteOptions);
      if (showSeconds) scrollToSelected(secondsRef, selectedTime.seconds, secondOptions);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, hourOptions, minuteOptions, secondOptions, showSeconds, scrollToSelected, selectedTime.hours, selectedTime.minutes, selectedTime.seconds]);

  const handleSelect = useCallback((type, val) => {
    if (disabled) return;
    setSelectedTime((prev) => ({ ...prev, [type]: val }));
    setTimeout(() => {
      if (type === 'hours') scrollToSelected(hoursRef, val, hourOptions);
      else if (type === 'minutes') scrollToSelected(minutesRef, val, minuteOptions);
      else scrollToSelected(secondsRef, val, secondOptions);
    }, 50);
  }, [disabled, scrollToSelected, hourOptions, minuteOptions, secondOptions]);

  const handleNow = useCallback(() => {
    if (disabled) return;
    const now = new Date();
    const t = { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() };
    setSelectedTime(t);
    setTimeout(() => {
      scrollToSelected(hoursRef, t.hours, hourOptions);
      scrollToSelected(minutesRef, t.minutes, minuteOptions);
      if (showSeconds) scrollToSelected(secondsRef, t.seconds, secondOptions);
    }, 100);
  }, [disabled, scrollToSelected, hourOptions, minuteOptions, secondOptions, showSeconds]);

  const handleWheel = useCallback((e) => {
    e.stopPropagation();
    const c = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = c;
    if ((e.deltaY < 0 && scrollTop === 0) || (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)) {
      e.preventDefault();
    }
  }, []);

  const stopProp = useCallback((e) => e.stopPropagation(), []);

  const renderColumn = (label, ref, options, type, selectedVal) => (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="text-[11px] font-medium text-center mb-1.5 text-grey-400">{label}</div>
      <div
        ref={ref}
        className="rounded-lg bg-grey-50/50 max-h-36 overflow-y-auto touch-pan-y"
        onWheel={handleWheel}
        onTouchStart={stopProp}
        onTouchMove={stopProp}
        style={{ overscrollBehavior: 'contain', scrollbarWidth: 'none' }}
      >
        {options.map((v) => (
          <button
            key={`${type}-${v}`}
            type="button"
            onClick={() => handleSelect(type, v)}
            disabled={disabled}
            className={cn(
              'w-full py-1.5 text-center text-sm transition-colors rounded-md',
              selectedVal === v
                ? 'bg-primary-500 text-white font-medium'
                : 'text-grey-600 hover:bg-grey-100',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {toPersianDigits(v)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={cn('flex flex-col gap-3 p-3 rounded-lg w-56', disabled && 'opacity-60', className)}
      dir="rtl"
    >
      <div className="flex gap-1.5">
        {showSeconds && renderColumn('ثانیه', secondsRef, secondOptions, 'seconds', selectedTime.seconds)}
        {renderColumn('دقیقه', minutesRef, minuteOptions, 'minutes', selectedTime.minutes)}
        {renderColumn('ساعت', hoursRef, hourOptions, 'hours', selectedTime.hours)}
      </div>

      {showConfirmButtons && (
        <div className="flex items-center justify-between pt-2 border-t border-grey-100">
          <div className="flex gap-1.5">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={disabled} className="h-7 px-3 text-xs">
                انصراف
              </Button>
            )}
            {onConfirm && (
              <Button type="button" size="sm" onClick={onConfirm} disabled={disabled} className="h-7 px-3 text-xs">
                تایید
              </Button>
            )}
          </div>
          {showNowButton && (
            <Button type="button" variant="ghost" size="sm" onClick={handleNow} disabled={disabled} className="h-7 px-2 text-xs text-primary-500 hover:text-primary-600">
              اکنون
            </Button>
          )}
        </div>
      )}
    </div>
  );
});
