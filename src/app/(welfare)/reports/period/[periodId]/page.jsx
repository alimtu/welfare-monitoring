'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BackHeader } from '@/components/welfare/BackHeader';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { StatCard } from '@/components/welfare/StatCard';
import { IndicatorsRadar } from '@/components/welfare/IndicatorsRadar';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { INDICATORS, TOTAL_INDICATORS } from '@/lib/welfare/indicators';
import { calcOverallPeriodScore, calcAverageScore } from '@/lib/welfare/calculations';
import { toPersianDigits, formatNumber, formatValue, formatDate, scoreMeta } from '@/lib/welfare/format';
import { ListChecksIcon, CheckCircle2Icon, GaugeIcon } from 'lucide-react';

function BarTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-grey-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-grey-800">{d.fullName}</p>
      <p className="text-grey-500">امتیاز: {toPersianDigits(d.score)}</p>
    </div>
  );
}

export default function PeriodReportPage() {
  const { periodId } = useParams();
  const { periods, submissionsForPeriod } = useWelfare();
  const period = periods.find((p) => p.id === periodId);

  const data = useMemo(() => {
    if (!period) return null;
    const subs = submissionsForPeriod(period.id);
    const rows = INDICATORS.map((ind) => {
      const sub = subs.find((s) => s.indicatorId === ind.id && s.status === 'submitted');
      return { ind, sub, score: sub ? sub.finalScore : null };
    });
    return {
      rows,
      overall: calcOverallPeriodScore(subs),
      average: calcAverageScore(subs),
      submittedCount: rows.filter((r) => r.sub).length,
    };
  }, [period, submissionsForPeriod]);

  if (!period) {
    return (
      <div className="p-4">
        <EmptyState icon={SearchXIcon} title="دوره یافت نشد" action={<Button asChild><Link href="/reports">بازگشت</Link></Button>} />
      </div>
    );
  }

  const chartData = data.rows.map((r) => ({
    code: toPersianDigits(r.ind.code),
    fullName: r.ind.title,
    score: r.score || 0,
    hex: scoreMeta(r.score || 0).hex,
  }));
  const radarData = data.rows.map((r) => ({ code: r.ind.code, fullName: r.ind.title, score: r.score || 0 }));

  return (
    <div className="space-y-4 p-4">
      <BackHeader title="گزارش دوره" fallbackHref="/reports" />

      <div>
        <p className="text-sm font-bold text-grey-800">{period.title}</p>
        <p className="mt-0.5 text-xs text-grey-400">
          {formatDate(period.startDate)} تا {formatDate(period.endDate)}
        </p>
      </div>

      {/* Executive summary */}
      <div className="rounded-xl bg-primary-500 p-4 text-white">
        <p className="text-xs opacity-90">امتیاز کلی دوره</p>
        <p className="mt-1 text-3xl font-extrabold">
          {toPersianDigits(formatNumber(data.overall, 1))}
          <span className="text-base font-medium opacity-80"> / ۱۰</span>
        </p>
        <p className="mt-1 text-[11px] opacity-80">
          فرمول: مجموع (وزن × امتیاز) ÷ مجموع وزن‌ها
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatCard icon={ListChecksIcon} label="کل شاخص‌ها" value={toPersianDigits(TOTAL_INDICATORS)} />
        <StatCard icon={CheckCircle2Icon} label="ثبت‌شده" value={toPersianDigits(data.submittedCount)} accentClassName="bg-[#dcfce7] text-[#15803d]" />
        <StatCard icon={GaugeIcon} label="میانگین" value={toPersianDigits(formatNumber(data.average, 1))} accentClassName="bg-[#fef3c7] text-[#b45309]" />
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">امتیاز شاخص‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="code" tick={{ fontSize: 10, fill: '#676767' }} />
              <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8f8f8' }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">نمودار راداری</CardTitle>
        </CardHeader>
        <CardContent>
          <IndicatorsRadar data={radarData} />
        </CardContent>
      </Card>

      {/* Indicators table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">جدول شاخص‌ها</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-[11px]">کد</TableHead>
                  <TableHead className="text-right text-[11px]">شاخص</TableHead>
                  <TableHead className="text-center text-[11px]">وزن</TableHead>
                  <TableHead className="text-center text-[11px]">مقدار</TableHead>
                  <TableHead className="text-center text-[11px]">امتیاز</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map(({ ind, sub, score }) => (
                  <TableRow key={ind.id}>
                    <TableCell className="text-[11px] text-grey-500">{toPersianDigits(ind.code)}</TableCell>
                    <TableCell className="max-w-[130px] truncate text-[11px] text-grey-700">{ind.title}</TableCell>
                    <TableCell className="text-center text-[11px] text-grey-500">{toPersianDigits(ind.weight)}</TableCell>
                    <TableCell className="whitespace-nowrap text-center text-[11px] text-grey-600">
                      {sub
                        ? sub.indicatorType === 'checklist'
                          ? `${formatNumber(sub.percentage, 0)}٪`
                          : formatValue(sub.calculatedValue, sub.resultUnit)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {score != null ? (
                        <ScoreBadge score={score} showLabel={false} />
                      ) : (
                        <span className="text-[10px] text-grey-300">ثبت‌نشده</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
