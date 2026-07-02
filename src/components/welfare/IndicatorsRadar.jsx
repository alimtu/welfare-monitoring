'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { toPersianDigits } from '@/lib/welfare/format';

function RadarTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-grey-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-grey-800">{d.fullName}</p>
      <p className="text-grey-500">امتیاز: {toPersianDigits(d.score)} از ۱۰</p>
    </div>
  );
}

/**
 * Radar chart of all 13 indicator scores (0–10). Axis labels use the indicator
 * code numbers; the tooltip shows the full Persian name.
 * @param {{data: Array<{code:string, fullName:string, score:number}>}} props
 */
export function IndicatorsRadar({ data }) {
  const chartData = data.map((d) => ({ ...d, code: toPersianDigits(d.code) }));
  return (
    <ResponsiveContainer width="100%" height={290}>
      <RadarChart data={chartData} outerRadius="72%">
        <PolarGrid stroke="#e6e6e6" />
        <PolarAngleAxis dataKey="code" tick={{ fontSize: 11, fill: '#676767' }} />
        <PolarRadiusAxis domain={[0, 10]} tickCount={3} tick={{ fontSize: 9, fill: '#9a9a9a' }} />
        <Radar dataKey="score" stroke="#244a9a" fill="#244a9a" fillOpacity={0.3} />
        <Tooltip content={<RadarTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
