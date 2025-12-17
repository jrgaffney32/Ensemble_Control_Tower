import { useState, useMemo } from "react";
import { groupedInitiatives, formatCurrency, type GroupedInitiative } from "@/lib/initiatives";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, TrendingUp, Clock, AlertTriangle, FileCheck, GitPullRequest, FileText, AlertCircle, Home, ListOrdered, LogOut, Shield, Users, ChevronRight, ChevronDown, MessageSquare, ClipboardList, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUserRole } from "@/hooks/use-user-role";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const LGATE_ORDER = ['L6', 'L5', 'L4', 'L3', 'L2', 'L1', 'L0', 'Rejected'];

const sortByLGate = (a: GroupedInitiative, b: GroupedInitiative) => {
  return LGATE_ORDER.indexOf(a.lGate) - LGATE_ORDER.indexOf(b.lGate);
};

const mockPendingItems: Record<string, { issues: number; requests: number; gateChanges: number }> = {};
groupedInitiatives.forEach((init, idx) => {
  mockPendingItems[init.ids[0]] = {
    issues: idx % 5 === 0 ? Math.floor(Math.random() * 3) + 1 : 0,
    requests: idx % 4 === 0 ? Math.floor(Math.random() * 2) + 1 : 0,
    gateChanges: idx % 7 === 0 ? 1 : 0,
  };
});

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStreams, setExpandedStreams] = useState<Record<string, boolean>>({});
  const { user, role, isControlTower, canEdit } = useUserRole();
  
  const toggleStream = (stream: string) => {
    setExpandedStreams(prev => ({ ...prev, [stream]: !prev[stream] }));
  };
  
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
      <aside className="w-64 bg-[#1e2a3b] text-slate-300 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/">
            <div className="flex flex-col gap-2 text-white mb-8 cursor-pointer hover:opacity-80">
              <img src="/attached_assets/ensemble-logo-singleline-standard-1738760348662_1765935308200.jpg" alt="Ensemble" className="h-5" />
              <span className="text-[10px] font-medium opacity-70 tracking-widest uppercase">Control Tower</span>
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
            <Link href="/cost-centers">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <Building2 className="w-4 h-4 mr-3" />
                Cost Center Breakout
              </Button>
            </Link>
            <Link href="/pod-velocity">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <TrendingUp className="w-4 h-4 mr-3" />
                Pod Velocity & Quality
              </Button>
            </Link>
            {isControlTower && (
              <>
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                    <Shield className="w-4 h-4 mr-3" />
                    Admin Panel
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                    <Users className="w-4 h-4 mr-3" />
                    User Management
                  </Button>
                </Link>
              </>
            )}
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
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Budgeted Cost</p>
              <p className="text-2xl font-bold text-slate-700 font-mono">{formatCurrency(stats.totalBudget)}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <span>{groupedInitiatives.length} initiatives</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Targeted Benefit</p>
              <p className="text-2xl font-bold text-[#2d8a6e] font-mono">{formatCurrency(stats.totalBenefit)}</p>
              <div className="flex items-center gap-1 text-xs text-[#2d8a6e] mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>Projected savings</span>
              </div>
            </div>
             <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Backlog</p>
              <p className="text-2xl font-bold text-slate-600 font-mono">{stats.backlogProjects}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>L1-L2 Stages</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Projects</p>
              <p className="text-2xl font-bold text-[#2d4a7c] font-mono">{stats.activeProjects}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <span>L3-L5 Stages</span>
              </div>
            </div>

            {/* New Tiles */}
            <Link href="/issues">
              <div className="bg-white p-4 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escalated Issues</p>
                  <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">Illustrative</Badge>
                </div>
                <p className="text-2xl font-bold text-[#c45850] font-mono">3</p>
                <div className="flex items-center gap-1 text-xs text-[#c45850] mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Need attention</span>
                </div>
              </div>
            </Link>
            <Link href="/requests">
              <div className="bg-white p-4 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
                  <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500">Illustrative</Badge>
                </div>
                <p className="text-2xl font-bold text-slate-700 font-mono">5</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <FileCheck className="w-3 h-3" />
                  <span>New requests</span>
                </div>
              </div>
            </Link>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Intake Forms</p>
              <p className="text-2xl font-bold text-slate-400 font-mono">-</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <FileText className="w-3 h-3" />
                <span>No forms submitted</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Stage Gates</p>
              <p className="text-2xl font-bold text-slate-400 font-mono">-</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <GitPullRequest className="w-3 h-3" />
                <span>No gates pending</span>
              </div>
            </div>
          </div>

          {/* Value Stream Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <div className="w-2 h-2 rounded-full bg-[#2d4a7c]" />
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
                      const colors = ['bg-[#2d4a7c]', 'bg-[#2d8a6e]', 'bg-[#5a7a9a]', 'bg-[#4a8a8a]', 'bg-[#6b7a8c]'];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={stream} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{stream}</span>
                            <span className="text-sm font-bold text-slate-700">{count}</span>
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
            <Card className="overflow-hidden border-slate-200">
              <CardHeader className="pb-3 bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <div className="w-2 h-2 rounded-full bg-[#2d8a6e]" />
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
                      'L0': 'bg-slate-400',
                      'L1': 'bg-slate-500',
                      'L2': 'bg-[#6b7a8c]',
                      'L3': 'bg-[#4a6a8c]',
                      'L4': 'bg-[#2d4a7c]',
                      'L5': 'bg-[#1e3a5f]',
                      'L6': 'bg-[#2d8a6e]',
                    };
                    return (
                      <div key={gate} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-slate-700">{count}</span>
                        <div className="w-full bg-slate-100 rounded-t-md relative" style={{ height: '80px' }}>
                          <div 
                            className={`absolute bottom-0 w-full ${gateColors[gate]} rounded-t-md transition-all duration-500`} 
                            style={{ height: `${height}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{gate}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-400" />
                    <span className="text-xs text-slate-500">New</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#6b7a8c]" />
                    <span className="text-xs text-slate-500">Backlog</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#2d4a7c]" />
                    <span className="text-xs text-slate-500">Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#2d8a6e]" />
                    <span className="text-xs text-slate-500">Shipped</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Initiative List by Value Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading text-slate-700">Initiatives by Value Stream</h3>
              <div className="flex gap-2">
                 <Link href="/pod-velocity"><Button variant="outline" size="sm" className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50">KPI Dashboard</Button></Link>
                 <Link href="/demand-capacity"><Button variant="outline" size="sm" className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50">Demand vs. Capacity</Button></Link>
                 <Link href="/roadmap"><Button variant="outline" size="sm" className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50">Roadmap View</Button></Link>
                 <Link href="/priorities"><Button variant="outline" size="sm" className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50">Priorities</Button></Link>
              </div>
            </div>

            {Object.entries(stats.byValueStream)
              .sort((a, b) => b[1] - a[1])
              .map(([valueStream, count]) => {
                const isExpanded = expandedStreams[valueStream];
                const allStreamInits = filteredInitiatives
                  .filter(i => i.valueStream === valueStream)
                  .sort(sortByLGate);
                const streamInits = isExpanded ? allStreamInits : allStreamInits.slice(0, 5);
                if (allStreamInits.length === 0) return null;
                return (
                  <div key={valueStream} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-700">{valueStream}</h4>
                        <Badge variant="outline" className="border-slate-300 text-slate-600">{count} initiatives</Badge>
                      </div>
                      <div className="text-sm text-slate-500">
                        Budget: {formatCurrency(groupedInitiatives.filter(i => i.valueStream === valueStream).reduce((s, i) => s + i.budgetedCost, 0))}
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {streamInits.map(init => {
                        const pending = mockPendingItems[init.ids[0]] || { issues: 0, requests: 0, gateChanges: 0 };
                        const hasPending = pending.issues > 0 || pending.requests > 0 || pending.gateChanges > 0;
                        return (
                          <Link key={init.ids[0]} href={`/project/${init.ids[0]}`}>
                            <div className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between" data-testid={`row-initiative-${init.ids[0]}`}>
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-sm text-slate-700 flex items-center gap-2">
                                    {init.name}
                                    {hasPending && (
                                      <div className="flex items-center gap-1">
                                        {pending.issues > 0 && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#f5e6e5] text-[#c45850] text-[10px] font-medium">
                                                <AlertCircle className="w-3 h-3" />
                                                {pending.issues}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>{pending.issues} open issue(s)</TooltipContent>
                                          </Tooltip>
                                        )}
                                        {pending.requests > 0 && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#f5f0e5] text-[#9a7b4f] text-[10px] font-medium">
                                                <ClipboardList className="w-3 h-3" />
                                                {pending.requests}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>{pending.requests} pending request(s)</TooltipContent>
                                          </Tooltip>
                                        )}
                                        {pending.gateChanges > 0 && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#e5eef5] text-[#2d4a7c] text-[10px] font-medium">
                                                <MessageSquare className="w-3 h-3" />
                                                {pending.gateChanges}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>{pending.gateChanges} gate change(s) pending</TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {init.costCenter || 'No cost center'}
                                    {init.milestones.length > 0 && ` • ${init.milestones.length} ms`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex gap-2" title="Status: Budget, Cost, Timeline, Scope">
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#2d8a6e]" title="Budget: Green" />
                                    <span className="text-[8px] text-slate-400 mt-0.5">B</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#2d8a6e]" title="Cost: Green" />
                                    <span className="text-[8px] text-slate-400 mt-0.5">C</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#2d8a6e]" title="Timeline: Green" />
                                    <span className="text-[8px] text-slate-400 mt-0.5">T</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#2d8a6e]" title="Scope: Green" />
                                    <span className="text-[8px] text-slate-400 mt-0.5">S</span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-slate-300 text-slate-600">{init.lGate}</Badge>
                                <div className="text-right w-24">
                                  <div className="text-xs text-slate-500">Cost</div>
                                  <span className="text-sm font-mono text-slate-700">
                                    {init.budgetedCost > 0 ? formatCurrency(init.budgetedCost) : '-'}
                                  </span>
                                </div>
                                <div className="text-right w-24">
                                  <div className="text-xs text-slate-500">Benefit</div>
                                  <span className="text-sm font-mono text-[#2d8a6e]">
                                    {init.targetedBenefit > 0 ? formatCurrency(init.targetedBenefit) : '-'}
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="p-2 text-center border-t border-slate-200">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        onClick={() => toggleStream(valueStream)}
                        data-testid={`toggle-stream-${valueStream}`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1 rotate-180" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            View all {count} in {valueStream}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      </main>
    </div>
  );
}
