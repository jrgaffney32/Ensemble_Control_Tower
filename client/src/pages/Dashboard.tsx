import { useState } from "react";
import { mockProjects } from "@/lib/mockData";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, TrendingUp, Clock, AlertTriangle, FileCheck, GitPullRequest, FileText, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-lg">E</div>
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
            <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
              <Calendar className="w-4 h-4 mr-3" />
              Milestone Calendar
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
              <Settings className="w-4 h-4 mr-3" />
              Configuration
            </Button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400" />
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs opacity-60">PMO Director</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-foreground">Ensemble Control Tower</h2>
          
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
                 <Button variant="outline" size="sm" className="text-xs">KPI Dashboard</Button>
                 <Button variant="outline" size="sm" className="text-xs">Demand vs. Capacity</Button>
                 <Button variant="outline" size="sm" className="text-xs">Roadmap View</Button>
                 <Button variant="outline" size="sm" className="text-xs">Demo Schedule</Button>
                 <Button variant="outline" size="sm" className="text-xs">Value Stream View</Button>
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
