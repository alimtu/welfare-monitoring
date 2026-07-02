'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ListChecksIcon,
  CheckCircle2Icon,
  GaugeIcon,
  AwardIcon,
  PlusIcon,
  FileBarChartIcon,
  CalendarPlusIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/welfare/StatCard';
import { IndicatorsRadar } from '@/components/welfare/IndicatorsRadar';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { EmptyState } from '@/components/welfare/EmptyState';
import { useWelfare } from '@/lib/welfare/WelfareContext';
import { INDICATORS, TOTAL_INDICATORS } from '@/lib/welfare/indicators';
import { calcAverageScore, calcOverallPeriodScore } from '@/lib/welfare/calculations';
import { formatNumber, toPersianDigits, formatDateTime, scoreMeta } from '@/lib/welfare/format';

export default function DashboardPage() {
  const { currentPeriod, submissionsForPeriod } = useWelfare();

  const periodSubmissions = useMemo(
    () => (currentPeriod ? submissionsForPeriod(currentPeriod.id) : []),
    [currentPeriod, submissionsForPeriod],
  );

  const stats = useMemo(() => {
    const submitted = periodSubmissions.filter((s) => s.status === 'submitted');
    const submittedIndicatorIds = new Set(submitted.map((s) => s.indicatorId));
    return {
      submittedCount: submittedIndicatorIds.size,
      averageScore: calcAverageScore(periodSubmissions),
      overallScore: calcOverallPeriodScore(periodSubmissions),
      completion: (submittedIndicatorIds.size / TOTAL_INDICATORS) * 100,
    };
  }, [periodSubmissions]);

  const radarData = useMemo(
    () =>
      INDICATORS.map((ind) => {
        const sub = periodSubmissions.find((s) => s.indicatorId === ind.id && s.status === 'submitted');
        return { code: ind.code, fullName: ind.title, score: sub ? sub.finalScore : 0 };
      }),
    [periodSubmissions],
  );

  const recent = useMemo(
    () =>
      [...periodSubmissions]
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5),
    [periodSubmissions],
  );

  if (!currentPeriod) {
    return (
      <EmptyState
        icon={CalendarPlusIcon}
        title="دوره ارزیابی فعالی وجود ندارد"
        description="برای شروع، یک دوره ارزیابی ایجاد و آن را فعال کنید."
        action={
          <Button asChild>
            <Link href="/periods">مدیریت دوره‌ها</Link>
          </Button>
        }
      />
    );
  }

  const overallMeta = scoreMeta(Math.round(stats.overallScore) || 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-grey-800">داشبورد</h1>
        <span className="text-xs text-grey-400">{currentPeriod.title}</span>
      </div>

      {/* Overall score hero */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-grey-500">امتیاز کلی دوره</p>
              <p className="mt-1 text-3xl font-extrabold text-grey-800">
                {toPersianDigits(formatNumber(stats.overallScore, 1))}
                <span className="text-base font-medium text-grey-400"> / ۱۰</span>
              </p>
            </div>
            <span
              className={`flex size-16 items-center justify-center rounded-2xl text-2xl font-extrabold ${overallMeta.bg} ${overallMeta.text}`}
            >
              {toPersianDigits(Math.round(stats.overallScore))}
            </span>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-grey-500">
              <span>تکمیل شاخص‌ها</span>
              <span>
                {toPersianDigits(stats.submittedCount)} از {toPersianDigits(TOTAL_INDICATORS)}
              </span>
            </div>
            <Progress value={stats.completion} />
          </div>
        </CardContent>
      </Card>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={ListChecksIcon} label="کل شاخص‌ها" value={toPersianDigits(TOTAL_INDICATORS)} />
        <StatCard
          icon={CheckCircle2Icon}
          label="ثبت‌شده"
          value={toPersianDigits(stats.submittedCount)}
          accentClassName="bg-[#dcfce7] text-[#15803d]"
        />
        <StatCard
          icon={GaugeIcon}
          label="میانگین امتیاز"
          value={toPersianDigits(formatNumber(stats.averageScore, 1))}
          accentClassName="bg-[#fef3c7] text-[#b45309]"
        />
        <StatCard
          icon={AwardIcon}
          label="درصد تکمیل"
          value={`${toPersianDigits(formatNumber(stats.completion, 0))}٪`}
          accentClassName="bg-primary-50 text-primary-500"
        />
      </div>

      {/* Radar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">نمودار راداری شاخص‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <IndicatorsRadar data={radarData} />
        </CardContent>
      </Card>

      {/* Recent submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">ثبت‌های اخیر</CardTitle>
          <Link href="/submissions" className="text-xs text-primary-500 hover:text-primary-600">
            مشاهده همه
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-4 text-center text-xs text-grey-400">هنوز ثبتی انجام نشده است.</p>
          ) : (
            <ul className="divide-y divide-grey-100">
              {recent.map((s) => (
                <li key={s.id}>
                  <Link href={`/submissions/${s.id}`} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-grey-800">{s.indicatorTitle}</p>
                      <p className="mt-0.5 text-[10px] text-grey-400">{formatDateTime(s.submittedAt)}</p>
                    </div>
                    <ScoreBadge score={s.finalScore} showLabel={false} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-11">
          <Link href="/indicators">
            <PlusIcon className="size-4" />
            ثبت شاخص جدید
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11">
          <Link href={`/reports/period/${currentPeriod.id}`}>
            <FileBarChartIcon className="size-4" />
            مشاهده گزارش
          </Link>
        </Button>
      </div>
    </div>
  );
}
