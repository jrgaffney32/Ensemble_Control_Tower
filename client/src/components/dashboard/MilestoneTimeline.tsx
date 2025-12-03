import { Milestone } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  // Sort by date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
  );

  return (
    <div className="space-y-4 relative pl-2">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-border z-0" />

      {sortedMilestones.map((milestone, index) => {
        const date = parseISO(milestone.plannedDate);
        const isPast = new Date() > date;
        
        let icon = <Circle className="w-4 h-4 text-muted-foreground fill-background" />;
        let colorClass = "text-muted-foreground";
        let lineClass = "bg-border";

        if (milestone.status === 'completed') {
          icon = <CheckCircle2 className="w-5 h-5 text-status-green fill-background z-10 relative" />;
          colorClass = "text-foreground font-medium";
        } else if (milestone.status === 'delayed') {
          icon = <AlertCircle className="w-5 h-5 text-status-red fill-background z-10 relative" />;
          colorClass = "text-status-red font-medium";
        } else if (milestone.status === 'on-track') {
          icon = <Clock className="w-5 h-5 text-primary fill-background z-10 relative" />;
          colorClass = "text-primary font-medium";
        } else {
          // Pending
           icon = <Circle className="w-5 h-5 text-muted-foreground bg-background z-10 relative border-2 border-muted-foreground rounded-full p-[2px]" />;
        }

        return (
          <div key={milestone.id} className="flex gap-3 items-start relative group">
            <div className="mt-0.5 bg-background">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className={cn("text-sm truncate pr-2", colorClass)}>
                  {milestone.title}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                  {format(date, 'MMM d')}
                </span>
              </div>
              {milestone.actualDate && milestone.actualDate !== milestone.plannedDate && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Actual: <span className={cn(milestone.status === 'delayed' ? 'text-status-red' : '')}>{format(parseISO(milestone.actualDate), 'MMM d')}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
