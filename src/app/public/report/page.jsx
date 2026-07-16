'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  PrinterIcon,
  AwardIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  CalendarCheckIcon,
  ListChecksIcon,
  CheckCircle2Icon,
  GaugeIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { ScoreBadge } from '@/components/welfare/ScoreBadge';
import { StatCard } from '@/components/welfare/StatCard';
import { IndicatorsRadar } from '@/components/welfare/IndicatorsRadar';
import { INDICATORS, TOTAL_INDICATORS } from '@/lib/welfare/indicators';
import { SAMPLE_DATASET } from '@/lib/welfare/sampleData';
import { buildReport, indicatorTrend } from '@/lib/welfare/sampleReport';
import {
  toPersianDigits,
  formatNumber,
  formatValue,
  formatDate,
  formatDateTime,
  scoreMeta,
} from '@/lib/welfare/format';

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

function subValueText(sub) {
  if (!sub) return '—';
  return sub.indicatorType === 'checklist'
    ? `${formatNumber(sub.percentage, 0)}٪`
    : formatValue(sub.calculatedValue, sub.resultUnit);
}

export default function PublicReportPage() {
  const report = useMemo(() => buildReport(SAMPLE_DATASET.bundle), []);

  const [periodId, setPeriodId] = useState(() => {
    const active = report.periods.find((p) => p.status === 'active');
    return (active || report.periods[report.periods.length - 1] || report.periods[0])?.id || '';
  });
  const [indId, setIndId] = useState(INDICATORS[0].id);

  const period = report.periods.find((p) => p.id === periodId) || null;

  // Computed after mount so the prerendered HTML and client render agree.
  const [generatedAt, setGeneratedAt] = useState('');
  useEffect(() => {
    setGeneratedAt(formatDateTime(new Date().toISOString()));
  }, []);

  const barData = useMemo(
    () =>
      (period?.rows || []).map((r) => ({
        code: toPersianDigits(r.ind.code),
        fullName: r.ind.title,
        score: r.score || 0,
        hex: scoreMeta(r.score || 0).hex,
      })),
    [period],
  );
  const radarData = useMemo(
    () => (period?.rows || []).map((r) => ({ code: r.ind.code, fullName: r.ind.title, score: r.score || 0 })),
    [period],
  );
  const indTrend = useMemo(() => indicatorTrend(report, indId), [report, indId]);
  const selectedIndicator = INDICATORS.find((i) => i.id === indId);

  const overallMeta = period ? scoreMeta(Math.round(period.overall) || 0) : null;
  const { insights } = report;

  if (report.periods.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-grey-500">داده‌ای برای گزارش موجود نیست.</div>
    );
  }

  return (
    <div id="public-report" className="space-y-4 p-4">
      {/* Branded header + print action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <img src="/icons/logo.png" alt="" className="size-9 shrink-0 rounded object-contain" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-grey-800">پایش رفاه دانشگاهی</p>
            <p className="text-[11px] text-grey-400">گزارش عمومی داده نمونه</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => window.print()} className="print:hidden">
          <PrinterIcon className="size-4" />
          خروجی PDF
        </Button>
      </div>

      <div className="rounded-lg bg-grey-50 px-3 py-2 text-[11px] text-grey-500">
        <p>{SAMPLE_DATASET.description}</p>
        <p className="mt-0.5">
          {toPersianDigits(report.totals.periodCount)} دوره ارزیابی ·{' '}
          {toPersianDigits(report.totals.submissionCount)} شاخص ثبت‌شده
          {generatedAt && ` · تهیه: ${generatedAt}`}
        </p>
      </div>

      {/* ── Overview: overall score across periods ─────────────────── */}
      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-sm">روند امتیاز کلی دوره‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={report.overallTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#676767' }} interval={0} />
              <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
              <Tooltip formatter={(v) => [toPersianDigits(v), 'امتیاز کلی']} />
              <Line type="monotone" dataKey="score" stroke="#244a9a" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            {report.periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodId(p.id)}
                className={`rounded-lg border px-2 py-1.5 text-right transition-colors ${
                  p.id === periodId ? 'border-primary-300 bg-primary-50' : 'border-grey-100 hover:bg-grey-50'
                }`}
              >
                <span className="block truncate text-grey-600">{p.title}</span>
                <span className="font-bold text-grey-800">{toPersianDigits(formatNumber(p.overall, 1))}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Insights ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 break-inside-avoid">
        {insights.best && (
          <InsightCard
            icon={AwardIcon}
            accent="bg-[#dcfce7] text-[#15803d]"
            label="قوی‌ترین شاخص"
            title={`${toPersianDigits(insights.best.ind.code)}. ${insights.best.ind.title}`}
            value={`میانگین ${toPersianDigits(formatNumber(insights.best.avg, 1))}`}
          />
        )}
        {insights.worst && (
          <InsightCard
            icon={AlertTriangleIcon}
            accent="bg-[#fee2e2] text-[#b91c1c]"
            label="ضعیف‌ترین شاخص"
            title={`${toPersianDigits(insights.worst.ind.code)}. ${insights.worst.ind.title}`}
            value={`میانگین ${toPersianDigits(formatNumber(insights.worst.avg, 1))}`}
          />
        )}
        {insights.mostImproved && (
          <InsightCard
            icon={TrendingUpIcon}
            accent="bg-[#dbeafe] text-[#1d4ed8]"
            label="بیشترین بهبود"
            title={`${toPersianDigits(insights.mostImproved.ind.code)}. ${insights.mostImproved.ind.title}`}
            value={
              insights.mostImproved.delta > 0
                ? `+${toPersianDigits(formatNumber(insights.mostImproved.delta, 1))} امتیاز`
                : 'بدون بهبود'
            }
          />
        )}
        {insights.bestPeriod && (
          <InsightCard
            icon={CalendarCheckIcon}
            accent="bg-[#fef3c7] text-[#b45309]"
            label="بهترین دوره"
            title={insights.bestPeriod.title}
            value={`امتیاز ${toPersianDigits(formatNumber(insights.bestPeriod.overall, 1))}`}
          />
        )}
      </div>

      {/* ── Period drill-down ───────────────────────────────────────── */}
      <Card className="break-inside-avoid">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-sm">گزارش دوره</CardTitle>
          <Select value={periodId} onValueChange={setPeriodId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {report.periods.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {period && (
            <>
              <p className="text-[11px] text-grey-400">
                {formatDate(period.startDate)} تا {formatDate(period.endDate)}
              </p>

              {/* Executive summary */}
              <div className="rounded-xl bg-primary-500 p-4 text-white">
                <p className="text-xs opacity-90">امتیاز کلی دوره</p>
                <p className="mt-1 text-3xl font-extrabold">
                  {toPersianDigits(formatNumber(period.overall, 1))}
                  <span className="text-base font-medium opacity-80"> / ۱۰</span>
                </p>
                <p className="mt-1 text-[11px] opacity-80">فرمول: مجموع (وزن × امتیاز) ÷ مجموع وزن‌ها</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <StatCard icon={ListChecksIcon} label="کل شاخص‌ها" value={toPersianDigits(TOTAL_INDICATORS)} />
                <StatCard
                  icon={CheckCircle2Icon}
                  label="ثبت‌شده"
                  value={toPersianDigits(period.submittedCount)}
                  accentClassName="bg-[#dcfce7] text-[#15803d]"
                />
                <StatCard
                  icon={GaugeIcon}
                  label="میانگین"
                  value={toPersianDigits(formatNumber(period.average, 1))}
                  accentClassName="bg-[#fef3c7] text-[#b45309]"
                />
              </div>

              {/* Bar chart */}
              <div>
                <p className="mb-1 text-xs font-medium text-grey-600">امتیاز شاخص‌ها</p>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={barData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="code" tick={{ fontSize: 10, fill: '#676767' }} interval={0} />
                    <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8f8f8' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {barData.map((d, i) => (
                        <Cell key={i} fill={d.hex} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar */}
              <div>
                <p className="mb-1 text-xs font-medium text-grey-600">نمودار راداری</p>
                <IndicatorsRadar data={radarData} />
              </div>

              {/* Table */}
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
                    {period.rows.map(({ ind, sub, score }) => (
                      <TableRow key={ind.id}>
                        <TableCell className="text-[11px] text-grey-500">{toPersianDigits(ind.code)}</TableCell>
                        <TableCell className="max-w-[130px] truncate text-[11px] text-grey-700">{ind.title}</TableCell>
                        <TableCell className="text-center text-[11px] text-grey-500">{toPersianDigits(ind.weight)}</TableCell>
                        <TableCell className="whitespace-nowrap text-center text-[11px] text-grey-600">{subValueText(sub)}</TableCell>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Per-indicator trend across periods ──────────────────────── */}
      <Card className="break-inside-avoid">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-sm">روند تک‌شاخص در دوره‌ها</CardTitle>
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
        <CardContent className="space-y-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={indTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#676767' }} interval={0} />
              <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
              <Tooltip formatter={(v) => [toPersianDigits(v), 'امتیاز']} />
              <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
          {selectedIndicator && <p className="text-[11px] text-grey-400">{selectedIndicator.title}</p>}
        </CardContent>
      </Card>

      <p className="pb-2 text-center text-[10px] text-grey-300">
        این گزارش از داده نمونه تهیه شده و صرفاً جهت نمایش است.
      </p>
    </div>
  );
}

function InsightCard({ icon: Icon, accent, label, title, value }) {
  return (
    <div className="rounded-xl border border-grey-100 p-3">
      <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="size-4" />
      </div>
      <p className="text-[10px] text-grey-400">{label}</p>
      <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-grey-800">{title}</p>
      <p className="mt-1 text-[11px] text-grey-500">{value}</p>
    </div>
  );
}
