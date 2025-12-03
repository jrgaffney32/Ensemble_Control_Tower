import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis } from "recharts";
import { KPI } from "@/lib/mockData";

interface KPITrendChartProps {
  data: KPI['history'];
  color?: string;
}

export function KPITrendChart({ data, color = "hsl(var(--primary))" }: KPITrendChartProps) {
  return (
    <div className="h-[60px] w-full -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <YAxis type="number" domain={['dataMin - 5', 'dataMax + 5']} hide />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
            interval={1}
            height={15}
          />
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
