'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackHeader } from '@/components/welfare/BackHeader';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { INDICATORS, getIndicator } from '@/lib/welfare/indicators';
import { calcOverallPeriodScore } from '@/lib/welfare/calculations';
import { toPersianDigits, formatNumber } from '@/lib/welfare/format';

export default function TrendsPage() {
  const { periods, submissions, submissionsForPeriod } = useWelfare();

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [periods],
  );

  const [indId, setIndId] = useState(() => {
    const withData = INDICATORS.find((ind) =>
      submissions.some((s) => s.indicatorId === ind.id && s.status === 'submitted'),
    );
    return (withData || INDICATORS[0]).id;
  });

  const overallTrend = useMemo(
    () =>
      sortedPeriods.map((p) => ({
        name: p.title,
        score: Number(calcOverallPeriodScore(submissionsForPeriod(p.id)).toFixed(2)),
      })),
    [sortedPeriods, submissionsForPeriod],
  );

  const indicator = getIndicator(indId);
  const indTrend = useMemo(
    () =>
      sortedPeriods.map((p) => {
        const sub = submissionsForPeriod(p.id).find(
          (s) => s.indicatorId === indId && s.status === 'submitted',
        );
        return { name: p.title, score: sub ? sub.finalScore : null };
      }),
    [sortedPeriods, submissionsForPeriod, indId],
  );

  const withData = indTrend.filter((d) => d.score != null);
  const highlight =
    withData.length >= 2 ? withData[withData.length - 1].score - withData[0].score : null;

  if (sortedPeriods.length < 2) {
    return (
      <div className="space-y-4 p-4">
        <BackHeader title="تحلیل روند" fallbackHref="/reports" />
        <EmptyState
          icon={TrendingUpIcon}
          title="داده کافی برای تحلیل روند نیست"
          description="برای مقایسه روند، حداقل به دو دوره ارزیابی نیاز است."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <BackHeader title="تحلیل روند" fallbackHref="/reports" />

      {/* Overall score trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">روند امتیاز کلی دوره‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={overallTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#676767' }} />
              <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
              <Tooltip formatter={(v) => [toPersianDigits(v), 'امتیاز']} />
              <Line type="monotone" dataKey="score" stroke="#244a9a" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-indicator trend */}
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-sm">روند تک‌شاخص</CardTitle>
          <Select value={indId} onValueChange={setIndId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDICATORS.map((ind) => (
                <SelectItem key={ind.id} value={ind.id} className="text-xs">
                  {toPersianDigits(ind.code)}. {ind.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3">
          {highlight != null && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                highlight > 0
                  ? 'bg-[#dcfce7] text-[#15803d]'
                  : highlight < 0
                    ? 'bg-[#fee2e2] text-[#b91c1c]'
                    : 'bg-grey-100 text-grey-600'
              }`}
            >
              {highlight > 0 ? (
                <TrendingUpIcon className="size-4" />
              ) : highlight < 0 ? (
                <TrendingDownIcon className="size-4" />
              ) : (
                <MinusIcon className="size-4" />
              )}
              {highlight > 0
                ? `بهبود ${toPersianDigits(Math.abs(highlight))} امتیازی نسبت به اولین دوره`
                : highlight < 0
                  ? `کاهش ${toPersianDigits(Math.abs(highlight))} امتیازی نسبت به اولین دوره`
                  : 'بدون تغییر نسبت به اولین دوره'}
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={indTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#676767' }} />
              <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
              <Tooltip formatter={(v) => [toPersianDigits(v), 'امتیاز']} />
              <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
          {indicator && <p className="text-[11px] text-grey-400">{indicator.title}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
