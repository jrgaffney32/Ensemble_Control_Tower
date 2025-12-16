import { useState } from "react";
import { mockProjects } from "@/lib/mockData";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, TrendingUp, Clock, AlertTriangle, FileCheck, GitPullRequest, FileText, AlertCircle, Home, ListOrdered, LogOut, Shield, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUserRole } from "@/hooks/use-user-role";
import { Badge } from "@/components/ui/badge";

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

  const filteredProjects = mockProjects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.valueStream.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Investment</p>
              <p className="text-2xl font-bold text-foreground font-mono">$7.3M</p>
              <div className="flex items-center gap-1 text-xs text-status-green mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>On Budget</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projected ROI</p>
              <p className="text-2xl font-bold text-foreground font-mono">$19.5M</p>
              <div className="flex items-center gap-1 text-xs text-status-green mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12% vs Target</span>
              </div>
            </div>
             <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Projects</p>
              <p className="text-2xl font-bold text-foreground font-mono">12</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span>3 Critical Path</span>
              </div>
            </div>
             <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical Milestones</p>
              <p className="text-2xl font-bold text-foreground font-mono">8</p>
              <div className="flex items-center gap-1 text-xs text-status-yellow mt-1">
                <Clock className="w-3 h-3" />
                <span>Due this week</span>
              </div>
            </div>

            {/* New Tiles */}
            <Link href="/issues">
              <div className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Escalated Issues</p>
                <p className="text-2xl font-bold text-status-red font-mono">3</p>
                <div className="flex items-center gap-1 text-xs text-status-red mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Need attention</span>
                </div>
              </div>
            </Link>
            <Link href="/requests">
              <div className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pending Approvals</p>
                <p className="text-2xl font-bold text-foreground font-mono">5</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <FileCheck className="w-3 h-3" />
                  <span>New changes</span>
                </div>
              </div>
            </Link>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stage Gates</p>
              <p className="text-2xl font-bold text-foreground font-mono">2</p>
              <div className="flex items-center gap-1 text-xs text-status-yellow mt-1">
                <GitPullRequest className="w-3 h-3" />
                <span>Awaiting Review</span>
              </div>
            </div>
            <Link href="/budget">
              <div className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Budget Requests</p>
                <p className="text-2xl font-bold text-foreground font-mono">4</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Capacity Review</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Project List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading text-foreground">Active Initiatives</h3>
              <div className="flex gap-2">
                 <Link href="/pod-velocity"><Button variant="outline" size="sm" className="text-xs">KPI Dashboard</Button></Link>
                 <Link href="/demand-capacity"><Button variant="outline" size="sm" className="text-xs">Demand vs. Capacity</Button></Link>
                 <Link href="/roadmap"><Button variant="outline" size="sm" className="text-xs">Roadmap View</Button></Link>
                 <Button variant="outline" size="sm" className="text-xs">Demo Schedule</Button>
                 <Link href="/projects"><Button variant="outline" size="sm" className="text-xs">All Projects</Button></Link>
                 <Button size="sm" className="text-xs bg-primary text-primary-foreground">Export Report</Button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
