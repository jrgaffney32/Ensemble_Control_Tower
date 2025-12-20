import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PieChart, Calendar, TrendingUp, FileText, AlertCircle, ListOrdered, LogOut, Shield, Users, Building2, Grid3X3, Target, Home, Bell, Filter, Search, BarChart3, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUserRole } from "@/hooks/use-user-role";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  headerActions?: ReactNode;
}

const NAV_ITEMS = [
  { path: "/", label: "Portfolio Overview", icon: LayoutDashboard },
  { path: "/requests", label: "Project Requests", icon: FileText },
  { path: "/issues", label: "Issues", icon: AlertCircle },
  { path: "/budget", label: "Budget Requests", icon: PieChart },
  { path: "/roadmap", label: "Roadmap", icon: Calendar },
  { path: "/priorities", label: "Value Stream Priorities", icon: ListOrdered },
  { path: "/cost-centers", label: "Cost Center Breakout", icon: Building2 },
  { path: "/pod-velocity", label: "Pod Velocity & Quality", icon: TrendingUp },
  { path: "/demand-capacity", label: "Demand vs. Capacity", icon: BarChart3 },
  { path: "/pod-performance", label: "Pod Performance", icon: BarChart3 },
  { path: "/projects", label: "All Projects", icon: FolderOpen },
];

const ADMIN_NAV_ITEMS = [
  { path: "/admin/master-grid", label: "Master Grid", icon: Grid3X3 },
  { path: "/admin/milestone-grid", label: "Milestone Grid", icon: Target },
  { path: "/admin", label: "Admin Panel", icon: Shield },
  { path: "/admin/users", label: "User Management", icon: Users },
];

export function AppLayout({ 
  children, 
  title = "Ensemble Control Tower",
  subtitle,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  headerActions
}: AppLayoutProps) {
  const [location] = useLocation();
  const { user, role, isControlTower } = useUserRole();

  const getRoleBadge = () => {
    switch (role) {
      case 'control_tower':
        return <Badge className="bg-purple-600 text-xs">Control Tower</Badge>;
      case 'sto':
        return <Badge className="bg-blue-600 text-xs">STO</Badge>;
      case 'slt':
        return <Badge className="bg-slate-600 text-xs">SLT</Badge>;
      default:
        return null;
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    if (path === "/projects") {
      return location === "/projects" || location.startsWith("/project/");
    }
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      <aside className="w-64 bg-[#1e2a3b] text-slate-300 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/">
            <div className="flex flex-col gap-2 text-white mb-8 cursor-pointer hover:opacity-80">
              <img src="/attached_assets/ensemble-logo-singleline-standard-1738760348662_1765935308200.jpg" alt="Ensemble" className="h-5" />
              <span className="text-[10px] font-medium opacity-70 tracking-widest uppercase">Control Tower</span>
            </div>
          </Link>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-white/5 hover:text-white ${
                    isActive(path) ? 'text-white bg-white/10 hover:bg-white/20' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {label}
                </Button>
              </Link>
            ))}
            {isControlTower && ADMIN_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-white/5 hover:text-white ${
                    isActive(path) ? 'text-white bg-white/10 hover:bg-white/20' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </p>
              {getRoleBadge()}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10" 
            data-testid="button-logout"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/gate";
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold font-heading text-foreground">{title}</h2>
            {subtitle && <Badge variant="outline" className="text-xs">{subtitle}</Badge>}
          </div>
          
          <div className="flex items-center gap-4">
            {showSearch && onSearchChange && (
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search initiatives..." 
                  className="pl-9 bg-slate-50 border-slate-200"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            {headerActions}
            <Button variant="outline" size="icon" className="border-slate-200">
              <Filter className="h-4 w-4 text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="border-slate-200 relative">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-status-red rounded-full border border-white"></span>
            </Button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
