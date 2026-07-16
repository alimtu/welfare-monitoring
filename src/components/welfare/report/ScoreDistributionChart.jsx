'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SCORE_LEVELS } from '@/lib/welfare/indicators';
import { toPersianDigits, scoreMeta } from '@/lib/welfare/format';

/**
 * Stacked bar: how many of the 13 indicators landed at each score level
 * (۱۰/۷/۴/۱) in each period — shows the composition shifting over time.
 * @param {{data: Array<{name:string, s10:number, s7:number, s4:number, s1:number}>}} props
 */
export function ScoreDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#676767' }} interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9a9a9a' }} tickFormatter={toPersianDigits} />
        <Tooltip
          formatter={(value, name) => [toPersianDigits(value) + ' شاخص', `امتیاز ${toPersianDigits(name)}`]}
        />
        <Legend
          formatter={(value) => (
            <span className="text-[10px] text-grey-500">امتیاز {toPersianDigits(value)}</span>
          )}
          iconSize={8}
          wrapperStyle={{ fontSize: 10 }}
        />
        {SCORE_LEVELS.map((lvl) => (
          <Bar
            key={lvl}
            dataKey={`s${lvl}`}
            name={String(lvl)}
            stackId="scores"
            fill={scoreMeta(lvl).hex}
            radius={lvl === SCORE_LEVELS[0] ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
