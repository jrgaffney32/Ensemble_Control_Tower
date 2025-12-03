import { Project } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { FinancialChart } from "./FinancialChart";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="w-full overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="text-xl font-bold text-foreground tracking-tight font-heading">
                {project.name}
              </CardTitle>
              <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200">
                {project.valueStream}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Owner: {project.owner}</p>
          </div>
          
          {/* Status Matrix - Top Right Summary */}
          <div className="flex gap-6 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Cost</span>
              <StatusBadge status={project.status.cost} size="md" showLabel={false} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Benefit</span>
              <StatusBadge status={project.status.benefit} size="md" showLabel={false} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Time</span>
              <StatusBadge status={project.status.timeline} size="md" showLabel={false} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Scope</span>
              <StatusBadge status={project.status.scope} size="md" showLabel={false} />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-12 gap-6 p-6">
        
        {/* Column 1: Overview & KPIs (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Overview</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Operational KPIs</h4>
            <div className="grid grid-cols-2 gap-3">
              {project.kpis.map((kpi, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-md border border-slate-100">
                  <p className="text-xs text-muted-foreground font-medium truncate mb-1" title={kpi.label}>{kpi.label}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold text-foreground">{kpi.value}</span>
                    <span className={cn(
                      "text-xs mb-1 flex items-center",
                      kpi.trend === 'up' ? "text-status-green" : 
                      kpi.trend === 'down' ? "text-status-red" : "text-muted-foreground"
                    )}>
                      {kpi.trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                      {kpi.trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {kpi.trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Target: {kpi.target}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Milestones (4 cols) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 border-l border-slate-100 pl-0 md:pl-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Major Milestones</h4>
            <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">Timeline</span>
          </div>
          <div className="pr-2 max-h-[250px] overflow-y-auto scrollbar-thin">
            <MilestoneTimeline milestones={project.milestones} />
          </div>
        </div>

        {/* Column 3: Financials (4 cols) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 border-l border-slate-100 pl-0 md:pl-6 flex flex-col">
          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">Financial Performance</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Budget vs Actual</p>
              <div className="text-sm font-semibold font-mono">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.financials.currency, notation: "compact" }).format(project.financials.actualCost)} 
                <span className="text-muted-foreground font-normal"> / </span>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.financials.currency, notation: "compact" }).format(project.financials.budget)}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Projected Benefit</p>
              <div className="text-sm font-semibold font-mono text-status-green">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.financials.currency, notation: "compact" }).format(project.financials.projectedBenefit)}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[120px]">
            <FinancialChart financials={project.financials} />
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
