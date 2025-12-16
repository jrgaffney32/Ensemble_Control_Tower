import { Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs = [], children }: PageHeaderProps) {
  return (
    <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
            <Home className="h-5 w-5 text-slate-600" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              {crumb.href ? (
                <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
          {breadcrumbs.length === 0 && (
            <h2 className="text-lg font-bold font-heading text-foreground">{title}</h2>
          )}
        </div>
      </div>
      
      {children && <div className="flex items-center gap-4">{children}</div>}
    </header>
  );
}
