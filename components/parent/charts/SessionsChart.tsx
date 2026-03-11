'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SessionsChartProps {
  data: { date: string; sessions: number }[];
}

export function SessionsChart({ data }: SessionsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-white/30 text-sm">
        Sem dados ainda
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#sessionGradient)"
            name="Sessoes"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
