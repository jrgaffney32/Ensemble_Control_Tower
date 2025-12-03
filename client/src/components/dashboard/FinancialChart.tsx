import { Financials } from "@/lib/mockData";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface FinancialChartProps {
  financials: Financials;
}

export function FinancialChart({ financials }: FinancialChartProps) {
  const data = [
    {
      name: "Cost",
      Budget: financials.budget,
      Actual: financials.actualCost,
    },
    {
      name: "Benefit",
      Budget: financials.projectedBenefit, // Using "Budget" as "Projected" for the chart label consistency
      Actual: financials.actualBenefit,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: financials.currency,
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  };

  // Casting to any to bypass strict type check in this specific Recharts version setup
  // while maintaining the visual requirement of specific corner rounding
  const radius: any = [0, 4, 4, 0];

  return (
    <div className="h-[140px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barSize={12} barGap={4}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={50}
            tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}}
          />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Bar dataKey="Budget" name="Planned" fill="hsl(var(--muted))" radius={radius} />
          <Bar dataKey="Actual" name="Actual">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 
                  ? (entry.Actual > entry.Budget ? 'hsl(var(--status-red))' : 'hsl(var(--primary))') // Cost: Red if over budget
                  : (entry.Actual < entry.Budget * 0.2 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--status-green))') // Benefit: Green if substantial
                } 
                radius={radius}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-end gap-4 text-xs text-muted-foreground mt-1 px-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted" /> Planned
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" /> Actual
        </div>
      </div>
    </div>
  );
}
