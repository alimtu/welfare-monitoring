import dayjs from 'dayjs';
import jalaliPlugin from 'jalali-plugin-dayjs';

dayjs.extend(jalaliPlugin);

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export const JALALI_WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function toJalali(date) {
  return dayjs(date).calendar('jalali');
}

export function formatJalali(date) {
  if (!date) return '';
  const { jYear, jMonth, jDay } = gregorianToJalali(date);
  return `${jDay} ${JALALI_MONTHS[jMonth]} ${jYear}`;
}

/**
 * Formats a Gregorian Date (or anything dayjs can parse) as a Jalali ISO-like
 * string: `YYYY/MM/DD` with zero-padding. Example: 1404/12/24
 */
export function formatJalaliISO(date) {
  if (!date) return '';
  const { jYear, jMonth, jDay } = gregorianToJalali(date);
  const mm = String(jMonth + 1).padStart(2, '0');
  const dd = String(jDay).padStart(2, '0');
  return `${jYear}/${mm}/${dd}`;
}

export function getJalaliMonthDays(jYear, jMonth) {
  const firstDay = dayjs(`${jYear}/${jMonth + 1}/1`, { jalali: true });
  const daysInMonth = firstDay.daysInMonth();
  const startDow = firstDay.day(); // 0=Sun ... 6=Sat

  const satBasedStart = (startDow + 1) % 7;

  const days = [];
  for (let i = 0; i < satBasedStart; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  return days;
}

export function jalaliToGregorian(jYear, jMonth, jDay) {
  return dayjs(`${jYear}/${jMonth + 1}/${jDay}`, { jalali: true }).toDate();
}

export function gregorianToJalali(date) {
  const d = dayjs(date).calendar('jalali');
  return {
    jYear: d.year(),
    jMonth: d.month(),
    jDay: d.date(),
  };
}

export { dayjs };
