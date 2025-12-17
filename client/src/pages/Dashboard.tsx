import { useState, useMemo } from "react";
import { groupedInitiatives, formatCurrency, type GroupedInitiative } from "@/lib/initiatives";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, TrendingUp, Clock, AlertTriangle, FileCheck, GitPullRequest, FileText, AlertCircle, Home, ListOrdered, LogOut, Shield, Users, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUserRole } from "@/hooks/use-user-role";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, role, isControlTower, canEdit } = useUserRole();
  
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

  const stats = useMemo(() => {
    const totalBudget = groupedInitiatives.reduce((sum, i) => sum + i.budgetedCost, 0);
    const totalBenefit = groupedInitiatives.reduce((sum, i) => sum + i.targetedBenefit, 0);
    const newProjects = groupedInitiatives.filter(i => i.lGate === 'L0').length;
    const backlogProjects = groupedInitiatives.filter(i => ['L1', 'L2'].includes(i.lGate)).length;
    const activeProjects = groupedInitiatives.filter(i => ['L3', 'L4', 'L5'].includes(i.lGate)).length;
    const shippedProjects = groupedInitiatives.filter(i => i.lGate === 'L6').length;
    
    const byValueStream: Record<string, number> = {};
    const byLGate: Record<string, number> = {};
    groupedInitiatives.forEach(i => {
      byValueStream[i.valueStream] = (byValueStream[i.valueStream] || 0) + 1;
      byLGate[i.lGate] = (byLGate[i.lGate] || 0) + 1;
    });
    
    return { totalBudget, totalBenefit, newProjects, backlogProjects, activeProjects, shippedProjects, byValueStream, byLGate };
  }, []);

  const filteredInitiatives = useMemo(() => {
    return groupedInitiatives.filter(i => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.valueStream.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 20);
  }, [searchTerm]);


  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-3 text-white mb-8 cursor-pointer hover:opacity-80">
              <img src="/attached_assets/ensemblehp_logo2_1765915775273.jpeg" alt="Ensemble" className="w-8 h-8 rounded-lg" />
              <h1 className="font-heading font-bold text-xl tracking-tight">ENSEMBLE<br/><span className="text-xs font-normal opacity-70 tracking-widest">CONTROL TOWER</span></h1>
            </div>
          </Link>
          
          <nav className="space-y-1">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Portfolio Overview
              </Button>
            </Link>
            <Link href="/requests">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <FileText className="w-4 h-4 mr-3" />
                Project Requests
              </Button>
            </Link>
            <Link href="/issues">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <AlertCircle className="w-4 h-4 mr-3" />
                Issues
              </Button>
            </Link>
            <Link href="/budget">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <PieChart className="w-4 h-4 mr-3" />
                Budget Requests
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <Calendar className="w-4 h-4 mr-3" />
                Roadmap
              </Button>
            </Link>
            <Link href="/priorities">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <ListOrdered className="w-4 h-4 mr-3" />
                Value Stream Priorities
              </Button>
            </Link>
            {isControlTower && (
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                  <Users className="w-4 h-4 mr-3" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </p>
              {getRoleBadge()}
            </div>
          </div>
          <a href="/api/logout">
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold font-heading text-foreground">Ensemble Control Tower</h2>
            <Badge variant="outline" className="text-xs">Strategic Funding Lane</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search initiatives..." 
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="border-slate-200">
              <Filter className="h-4 w-4 text-slate-600" />
            </Button>
            <Button variant="outline" size="icon" className="border-slate-200 relative">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-status-red rounded-full border border-white"></span>
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Budgeted Cost</p>
              <p className="text-2xl font-bold text-foreground font-mono">{formatCurrency(stats.totalBudget)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span>{groupedInitiatives.length} initiatives</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Targeted Benefit</p>
              <p className="text-2xl font-bold text-foreground font-mono">{formatCurrency(stats.totalBenefit)}</p>
              <div className="flex items-center gap-1 text-xs text-status-green mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Projected savings</span>
              </div>
            </div>
             <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Backlog</p>
              <p className="text-2xl font-bold text-amber-600 font-mono">{stats.backlogProjects}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>L1-L2 Stages</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Projects</p>
              <p className="text-2xl font-bold text-blue-600 font-mono">{stats.activeProjects}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span>L3-L5 Stages</span>
              </div>
            </div>

            {/* New Tiles */}
            <Link href="/issues">
              <div className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escalated Issues</p>
                  <Badge variant="outline" className="text-[10px]">Illustrative</Badge>
                </div>
                <p className="text-2xl font-bold text-status-red font-mono">3</p>
                <div className="flex items-center gap-1 text-xs text-status-red mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Need attention</span>
                </div>
              </div>
            </Link>
            <Link href="/requests">
              <div className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Approvals</p>
                  <Badge variant="outline" className="text-[10px]">Illustrative</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground font-mono">5</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <FileCheck className="w-3 h-3" />
                  <span>New requests</span>
                </div>
              </div>
            </Link>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intake Forms</p>
              <p className="text-2xl font-bold text-slate-400 font-mono">-</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <FileText className="w-3 h-3" />
                <span>No forms submitted</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stage Gates</p>
              <p className="text-2xl font-bold text-slate-400 font-mono">-</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <GitPullRequest className="w-3 h-3" />
                <span>No gates pending</span>
              </div>
            </div>
          </div>

          {/* Value Stream Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  By Value Stream
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {Object.entries(stats.byValueStream)
                    .sort((a, b) => b[1] - a[1])
                    .map(([stream, count], idx) => {
                      const maxCount = Math.max(...Object.values(stats.byValueStream));
                      const percentage = (count / maxCount) * 100;
                      const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={stream} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{stream}</span>
                            <span className="text-sm font-bold text-foreground">{count}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  By L-Gate Stage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-end justify-between gap-2 h-32">
                  {['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map((gate) => {
                    const count = stats.byLGate[gate] || 0;
                    const maxCount = Math.max(...Object.values(stats.byLGate), 1);
                    const height = (count / maxCount) * 100;
                    const gateColors: Record<string, string> = {
                      'L0': 'bg-purple-400',
                      'L1': 'bg-amber-400',
                      'L2': 'bg-amber-500',
                      'L3': 'bg-blue-400',
                      'L4': 'bg-blue-500',
                      'L5': 'bg-blue-600',
                      'L6': 'bg-green-500',
                    };
                    return (
                      <div key={gate} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-foreground">{count}</span>
                        <div className="w-full bg-slate-100 rounded-t-md relative" style={{ height: '80px' }}>
                          <div 
                            className={`absolute bottom-0 w-full ${gateColors[gate]} rounded-t-md transition-all duration-500`} 
                            style={{ height: `${height}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{gate}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-purple-400" />
                    <span className="text-xs text-muted-foreground">New</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500" />
                    <span className="text-xs text-muted-foreground">Backlog</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-xs text-muted-foreground">Shipped</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Initiative List by Value Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading text-foreground">Initiatives by Value Stream</h3>
              <div className="flex gap-2">
                 <Link href="/pod-velocity"><Button variant="outline" size="sm" className="text-xs">KPI Dashboard</Button></Link>
                 <Link href="/demand-capacity"><Button variant="outline" size="sm" className="text-xs">Demand vs. Capacity</Button></Link>
                 <Link href="/roadmap"><Button variant="outline" size="sm" className="text-xs">Roadmap View</Button></Link>
                 <Link href="/priorities"><Button variant="outline" size="sm" className="text-xs">Priorities</Button></Link>
              </div>
            </div>

            {Object.entries(stats.byValueStream)
              .sort((a, b) => b[1] - a[1])
              .map(([valueStream, count]) => {
                const streamInits = filteredInitiatives.filter(i => i.valueStream === valueStream).slice(0, 5);
                if (streamInits.length === 0) return null;
                return (
                  <div key={valueStream} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">{valueStream}</h4>
                        <Badge variant="outline">{count} initiatives</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Budget: {formatCurrency(groupedInitiatives.filter(i => i.valueStream === valueStream).reduce((s, i) => s + i.budgetedCost, 0))}
                      </div>
                    </div>
                    <div className="divide-y">
                      {streamInits.map(init => (
                        <Link key={init.ids[0]} href={`/project/${init.ids[0]}`}>
                          <div className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between" data-testid={`row-initiative-${init.ids[0]}`}>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Cost: Green" />
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Benefit: Green" />
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Timeline: Green" />
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Scope: Green" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{init.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {init.costCenter || 'No cost center'}
                                  {init.milestones.length > 0 && ` • ${init.milestones.length} ms`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline">{init.lGate}</Badge>
                              <div className="text-right w-24">
                                <div className="text-xs text-muted-foreground">Cost</div>
                                <span className="text-sm font-mono">
                                  {init.budgetedCost > 0 ? formatCurrency(init.budgetedCost) : '-'}
                                </span>
                              </div>
                              <div className="text-right w-24">
                                <div className="text-xs text-muted-foreground">Benefit</div>
                                <span className="text-sm font-mono text-green-600">
                                  {init.targetedBenefit > 0 ? formatCurrency(init.targetedBenefit) : '-'}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {count > 5 && (
                      <div className="p-2 text-center border-t">
                        <Link href="/projects">
                          <Button variant="ghost" size="sm" className="text-xs">View all {count} in {valueStream}</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

        </div>
      </main>
    </div>
  );
}
