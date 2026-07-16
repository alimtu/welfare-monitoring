'use client';

import { useMemo, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { comparePeriods } from '@/lib/welfare/sampleReport';
import { toPersianDigits, formatNumber } from '@/lib/welfare/format';

const COLOR_A = '#9a9a9a';
const COLOR_B = '#244a9a';

function CompareTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-grey-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-grey-800">{d.fullName}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {toPersianDigits(p.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

/** Compact list of the biggest movers between the two periods. */
function MoverList({ title, rows, tone, Icon }) {
  if (!rows.length) return null;
  return (
    <div>
      <p className={`mb-1 flex items-center gap-1 text-[11px] font-medium ${tone}`}>
        <Icon className="size-3.5" />
        {title}
      </p>
      <ul className="space-y-0.5">
        {rows.slice(0, 3).map((r) => (
          <li key={r.ind.id} className="flex items-center justify-between gap-2 text-[11px] text-grey-600">
            <span className="truncate">
              {toPersianDigits(r.ind.code)}. {r.ind.title}
            </span>
            <span className={`shrink-0 font-medium ${tone}`}>
              {r.delta > 0 ? '+' : '−'}
              {toPersianDigits(Math.abs(r.delta))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Side-by-side comparison of any two periods: overlaid radar, grouped bars per
 * indicator, and the biggest gains/losses between them.
 * @param {{report: Object}} props
 */
export function PeriodComparison({ report }) {
  const periods = report.periods;
  const [aId, setAId] = useState(periods[0]?.id || '');
  const [bId, setBId] = useState(periods[periods.length - 1]?.id || '');

  const cmp = useMemo(() => comparePeriods(report, aId, bId), [report, aId, bId]);

  const chartData = useMemo(
    () =>
      cmp.rows.map((r) => ({
        code: toPersianDigits(r.ind.code),
        fullName: r.ind.title,
        a: r.scoreA ?? 0,
        b: r.scoreB ?? 0,
      })),
    [cmp],
  );

  if (periods.length < 2) return null;

  const overallDelta =
    cmp.a && cmp.b ? cmp.b.overall - cmp.a.overall : null;

  return (
    <div className="space-y-3">
      {/* Period pickers */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[10px] text-grey-400">دوره مبنا</p>
          <Select value={aId} onValueChange={setAId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-1 text-[10px] text-grey-400">دوره مقایسه</p>
          <Select value={bId} onValueChange={setBId}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall delta headline */}
      {overallDelta != null && (
        <div
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            overallDelta > 0
              ? 'bg-[#dcfce7] text-[#15803d]'
              : overallDelta < 0
                ? 'bg-[#fee2e2] text-[#b91c1c]'
                : 'bg-grey-100 text-grey-600'
          }`}
        >
          امتیاز کلی: {toPersianDigits(formatNumber(cmp.a.overall, 1))} →{' '}
          {toPersianDigits(formatNumber(cmp.b.overall, 1))}
          {overallDelta !== 0 &&
            ` (${overallDelta > 0 ? '+' : '−'}${toPersianDigits(formatNumber(Math.abs(overallDelta), 1))})`}
        </div>
      )}

      {/* Overlaid radar */}
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={chartData} outerRadius="70%">
          <PolarGrid stroke="#e6e6e6" />
          <PolarAngleAxis dataKey="code" tick={{ fontSize: 10, fill: '#676767' }} />
          <PolarRadiusAxis domain={[0, 10]} tickCount={3} tick={{ fontSize: 9, fill: '#9a9a9a' }} />
          <Radar name={cmp.a?.title || ''} dataKey="a" stroke={COLOR_A} fill={COLOR_A} fillOpacity={0.18} />
          <Radar name={cmp.b?.title || ''} dataKey="b" stroke={COLOR_B} fill={COLOR_B} fillOpacity={0.28} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <Tooltip content={<CompareTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Grouped bars */}
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis dataKey="code" tick={{ fontSize: 9, fill: '#676767' }} interval={0} />
          <YAxis domain={[0, 10]} tickCount={6} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
          <Tooltip content={<CompareTooltip />} cursor={{ fill: '#f8f8f8' }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <Bar name={cmp.a?.title || ''} dataKey="a" fill={COLOR_A} radius={[3, 3, 0, 0]} />
          <Bar name={cmp.b?.title || ''} dataKey="b" fill={COLOR_B} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Biggest movers */}
      <div className="grid grid-cols-1 gap-3 border-t border-grey-100 pt-3 sm:grid-cols-2">
        <MoverList title="بیشترین رشد" rows={cmp.gains} tone="text-[#15803d]" Icon={TrendingUpIcon} />
        <MoverList title="بیشترین افت" rows={cmp.losses} tone="text-[#b91c1c]" Icon={TrendingDownIcon} />
        {cmp.gains.length === 0 && cmp.losses.length === 0 && (
          <p className="text-[11px] text-grey-400">تفاوتی بین این دو دوره وجود ندارد.</p>
        )}
      </div>
    </div>
  );
}
