'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { toPersianDigits, formatNumber, scoreMeta } from '@/lib/welfare/format';

function ContributionTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-grey-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-grey-800">{d.fullName}</p>
      <p className="text-grey-500">
        وزن {toPersianDigits(d.weight)} × امتیاز {toPersianDigits(d.score)} ={' '}
        {toPersianDigits(formatNumber(d.weighted, 0))}
      </p>
      <p className="text-grey-400">ظرفیت بهبود: {toPersianDigits(d.gap)} امتیاز</p>
    </div>
  );
}

/**
 * Horizontal bars of weight × score per indicator, biggest contributor first —
 * makes it obvious which indicators are actually moving the overall score.
 * @param {{data: Array<{code:string, fullName:string, weight:number, score:number, weighted:number, gap:number}>}} props
 */
export function WeightedContributionChart({ data }) {
  const chartData = data.map((d) => ({ ...d, code: toPersianDigits(d.code) }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 22)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
        <YAxis
          type="category"
          dataKey="code"
          tick={{ fontSize: 10, fill: '#676767' }}
          width={38}
          interval={0}
        />
        <Tooltip content={<ContributionTooltip />} cursor={{ fill: '#f8f8f8' }} />
        <Bar dataKey="weighted" radius={[0, 4, 4, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={scoreMeta(d.score).hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
