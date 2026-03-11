'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { subjects as subjectConfigs } from '@/lib/subjects/config';

interface SubjectsChartProps {
  data: Record<string, number>;
}

export function SubjectsChart({ data }: SubjectsChartProps) {
  const chartData = Object.entries(data).map(([subject, count]) => {
    const config = subjectConfigs.find((s) => s.id === subject || s.name === subject);
    return {
      name: config?.name || subject,
      value: count,
      color: config?.color || '#6B7280',
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-white/30 text-sm">
        Sem dados ainda
      </div>
    );
  }

  return (
    <div className="h-48 flex items-center">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.8} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-white/60 flex-1 truncate">{item.name}</span>
            <span className="text-white font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
