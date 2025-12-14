import { useState } from "react";
import { mockProjects } from "@/lib/mockData";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, FileText, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export default function ProjectList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'valueStream' | 'budget'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const filteredProjects = [...mockProjects]
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.valueStream.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'valueStream') comparison = a.valueStream.localeCompare(b.valueStream);
      else if (sortBy === 'budget') comparison = a.financials.budget - b.financials.budget;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

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
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Portfolio Overview
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
                <FileText className="w-4 h-4 mr-3" />
                All Projects
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
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-foreground">All Projects</h2>
          
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
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Projects</p>
              <p className="text-2xl font-bold text-foreground font-mono">{mockProjects.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Budget</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                ${(mockProjects.reduce((sum, p) => sum + p.financials.budget, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Actual Spend</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                ${(mockProjects.reduce((sum, p) => sum + p.financials.actualCost, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projected Benefit</p>
              <p className="text-2xl font-bold text-status-green font-mono">
                ${(mockProjects.reduce((sum, p) => sum + p.financials.projectedBenefit, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>

          {/* Projects Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th 
                      className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">Project Name <SortIcon field="name" /></div>
                    </th>
                    <th 
                      className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('valueStream')}
                    >
                      <div className="flex items-center gap-1">Value Stream <SortIcon field="valueStream" /></div>
                    </th>
                    <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th 
                      className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('budget')}
                    >
                      <div className="flex items-center gap-1 justify-end">Budget <SortIcon field="budget" /></div>
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spend</th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Benefit</th>
                    <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, idx) => (
                    <tr key={project.id} className={`border-b hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{project.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-md truncate">{project.description}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs">{project.valueStream}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <StatusBadge status={project.status.cost} size="sm" showLabel={false} />
                          <StatusBadge status={project.status.benefit} size="sm" showLabel={false} />
                          <StatusBadge status={project.status.timeline} size="sm" showLabel={false} />
                          <StatusBadge status={project.status.scope} size="sm" showLabel={false} />
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        ${(project.financials.budget / 1000000).toFixed(2)}M
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        ${(project.financials.actualCost / 1000000).toFixed(2)}M
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-status-green">
                        ${(project.financials.projectedBenefit / 1000000).toFixed(1)}M
                      </td>
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
