import { LayoutDashboard, PieChart, Calendar, Settings, Bell, FileText, AlertCircle, ChevronLeft, ChevronRight, ListOrdered, Home, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import { initiatives, type Initiative } from "@/lib/initiatives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoadmapItem {
  id: string;
  name: string;
  valueStream: string;
  lGate: string;
  priorityCategory: string;
  startMonth: number;
  duration: number;
  status: 'completed' | 'in-progress' | 'planned' | 'at-risk';
  milestones: { month: number; label: string }[];
  budgetedCost: number;
  targetedBenefit: number;
}

function parseInitiativesToRoadmap(inits: Initiative[]): RoadmapItem[] {
  const baseDate = new Date(2024, 0, 1);
  
  return inits
    .filter(init => init.milestones.length > 0 && init.priorityCategory !== 'Kill')
    .map(init => {
      const validMilestones = init.milestones.filter(m => m.startDate || m.endDate);
      if (validMilestones.length === 0) {
        return null;
      }
      
      const dates = validMilestones
        .flatMap(m => [m.startDate, m.endDate])
        .filter(Boolean)
        .map(d => new Date(d!))
        .filter(d => !isNaN(d.getTime()));
      
      if (dates.length === 0) return null;
      
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      const startMonth = Math.max(0, (minDate.getFullYear() - baseDate.getFullYear()) * 12 + (minDate.getMonth() - baseDate.getMonth()));
      const endMonth = Math.max(startMonth + 1, (maxDate.getFullYear() - baseDate.getFullYear()) * 12 + (maxDate.getMonth() - baseDate.getMonth()));
      const duration = Math.max(1, endMonth - startMonth + 1);
      
      let status: RoadmapItem['status'] = 'planned';
      if (init.priorityCategory === 'Shipped') {
        status = 'completed';
      } else if (init.priorityCategory === 'Now') {
        status = 'in-progress';
      } else if (init.lGate === 'L0' || init.lGate === 'L1') {
        status = 'planned';
      }
      
      const milestones = validMilestones.map(m => {
        const mDate = new Date(m.endDate || m.startDate!);
        const mMonth = (mDate.getFullYear() - baseDate.getFullYear()) * 12 + mDate.getMonth();
        return {
          month: mMonth,
          label: m.name
        };
      });
      
      return {
        id: init.id,
        name: init.name,
        valueStream: init.valueStream,
        lGate: init.lGate,
        priorityCategory: init.priorityCategory,
        startMonth,
        duration,
        status,
        milestones,
        budgetedCost: init.budgetedCost,
        targetedBenefit: init.targetedBenefit
      };
    })
    .filter(Boolean) as RoadmapItem[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RoadmapView() {
  const [startOffset, setStartOffset] = useState(0);
  const [valueStreamFilter, setValueStreamFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const visibleMonths = 12;

  const roadmapData = useMemo(() => parseInitiativesToRoadmap(initiatives), []);
  
  const valueStreams = useMemo(() => {
    const streams = new Set(roadmapData.map(i => i.valueStream));
    return ['all', ...Array.from(streams).sort()];
  }, [roadmapData]);

  const filteredData = useMemo(() => {
    return roadmapData.filter(item => {
      if (valueStreamFilter !== 'all' && item.valueStream !== valueStreamFilter) return false;
      if (priorityFilter !== 'all' && item.priorityCategory !== priorityFilter) return false;
      return true;
    }).slice(0, 30);
  }, [roadmapData, valueStreamFilter, priorityFilter]);

  const getStatusColor = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planned': return 'bg-slate-300';
      case 'at-risk': return 'bg-red-500';
    }
  };

  const getStatusBadge = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case 'planned': return <Badge className="bg-slate-100 text-slate-700">Planned</Badge>;
      case 'at-risk': return <Badge className="bg-red-100 text-red-700">At Risk</Badge>;
    }
  };

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
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Portfolio Overview
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
                <Calendar className="w-4 h-4 mr-3" />
                Roadmap View
              </Button>
            </Link>
            <Link href="/priorities">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <ListOrdered className="w-4 h-4 mr-3" />
                Value Stream Priorities
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
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold font-heading text-foreground">Roadmap View</h2>
            <Badge variant="outline" className="ml-2">{filteredData.length} initiatives</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={valueStreamFilter} onValueChange={setValueStreamFilter}>
              <SelectTrigger className="w-48" data-testid="select-value-stream">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Value Stream" />
              </SelectTrigger>
              <SelectContent>
                {valueStreams.map(vs => (
                  <SelectItem key={vs} value={vs}>{vs === 'all' ? 'All Value Streams' : vs}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32" data-testid="select-priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Now">Now</SelectItem>
                <SelectItem value="Next">Next</SelectItem>
                <SelectItem value="Later">Later</SelectItem>
                <SelectItem value="New">New</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setStartOffset(Math.max(0, startOffset - 3))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {2024 + Math.floor(startOffset / 12)}
              </span>
              <Button variant="outline" size="icon" onClick={() => setStartOffset(startOffset + 3)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon" className="border-slate-200 relative">
              <Bell className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Legend */}
          <div className="flex items-center gap-6 bg-white p-4 rounded-xl border shadow-sm">
            <span className="text-sm font-semibold text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm">Shipped</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-sm">In Progress (Now)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300" /><span className="text-sm">Planned (Next/Later)</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200" /><span className="text-sm">Milestone</span></div>
          </div>

          {/* Roadmap Chart */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Month Headers */}
            <div className="flex border-b">
              <div className="w-72 flex-shrink-0 p-4 border-r bg-slate-50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Initiative</span>
              </div>
              <div className="flex-1 flex">
                {Array.from({ length: visibleMonths }, (_, i) => {
                  const monthIdx = (startOffset + i) % 12;
                  const year = 2024 + Math.floor((startOffset + i) / 12);
                  return (
                    <div key={i} className="flex-1 p-3 text-center border-r last:border-r-0 bg-slate-50">
                      <div className="text-xs font-semibold text-muted-foreground">{months[monthIdx]}</div>
                      <div className="text-[10px] text-muted-foreground">{year}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Rows */}
            {filteredData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No initiatives with milestone dates found for the selected filters.
              </div>
            ) : (
              filteredData.map((item) => (
                <Link key={item.id} href={`/project/${item.id}`}>
                  <div className="flex border-b last:border-b-0 hover:bg-slate-50/50 cursor-pointer">
                    <div className="w-72 flex-shrink-0 p-4 border-r">
                      <div className="font-semibold text-sm text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.valueStream}</div>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(item.status)}
                        <Badge variant="outline" className="text-xs">{item.lGate}</Badge>
                      </div>
                    </div>
                    <div className="flex-1 flex relative py-4">
                      {/* Timeline Bar */}
                      {item.startMonth <= startOffset + visibleMonths && item.startMonth + item.duration >= startOffset && (
                        <div 
                          className={`absolute h-6 rounded-full ${getStatusColor(item.status)} opacity-80`}
                          style={{
                            left: `${Math.max(0, ((item.startMonth - startOffset) / visibleMonths) * 100)}%`,
                            width: `${Math.min(100, (item.duration / visibleMonths) * 100)}%`,
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        />
                      )}
                      {/* Milestones */}
                      {item.milestones.map((ms, idx) => {
                        const position = ((ms.month - startOffset) / visibleMonths) * 100;
                        if (position < 0 || position > 100) return null;
                        return (
                          <div 
                            key={idx}
                            className="absolute z-10 group"
                            style={{
                              left: `${position}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white shadow-sm cursor-pointer" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
                              <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-48 truncate">
                                {ms.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
