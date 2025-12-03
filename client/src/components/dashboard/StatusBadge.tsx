import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'red' | 'yellow' | 'green';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusBadge({ status, label, size = 'md', showLabel = true }: StatusBadgeProps) {
  const colorMap = {
    red: "bg-status-red text-white border-red-600",
    yellow: "bg-status-yellow text-black border-yellow-500",
    green: "bg-status-green text-white border-green-700",
  };

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          "rounded-full shadow-sm border border-white/20",
          colorMap[status],
          sizeClasses[size]
        )} 
      />
      {showLabel && label && (
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
