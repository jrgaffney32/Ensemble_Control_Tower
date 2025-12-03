import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { KPI } from "@/lib/mockData";

interface KPITrendChartProps {
  data: KPI['history'];
  color?: string;
}

export function KPITrendChart({ data, color = "hsl(var(--primary))" }: KPITrendChartProps) {
  return (
    <div className="h-[35px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis type="number" domain={['dataMin - 5', 'dataMax + 5']} hide />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            fillOpacity={1} 
            fill={`url(#gradient-${color})`} 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
