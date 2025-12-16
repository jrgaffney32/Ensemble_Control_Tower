import { useState } from "react";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, AlertTriangle, AlertCircle, CheckCircle2, Clock, FileText, MessageSquare, Home, ListOrdered } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface Issue {
  id: string;
  title: string;
  project: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  assignee: string;
  reportedDate: string;
  category: string;
  description: string;
  impactArea: string;
}

const mockIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: 'Prior Auth Bot failing on Anthem portal',
    project: 'Prior Auth "Concierge" Bot',
    severity: 'critical',
    status: 'escalated',
    assignee: 'Marcus Thorne',
    reportedDate: '2024-12-01',
    category: 'Integration',
    description: 'The bot is unable to authenticate with Anthem\'s updated portal. Affecting 35% of authorization requests.',
    impactArea: 'Pre-Service / Access'
  },
  {
    id: 'ISS-002',
    title: 'Coding accuracy drop in Orthopedics',
    project: 'Autonomous Coding Agent',
    severity: 'high',
    status: 'in_progress',
    assignee: 'Dr. Elena Rostova',
    reportedDate: '2024-11-29',
    category: 'Model Performance',
    description: 'Coding accuracy for orthopedic procedures dropped from 96% to 89% after recent model update.',
    impactArea: 'Mid-Cycle / Coding'
  },
  {
    id: 'ISS-003',
    title: 'Appeal letter generation timeout',
    project: 'Denial Defense Swarm',
    severity: 'medium',
    status: 'open',
    assignee: 'Sarah Jenkins',
    reportedDate: '2024-11-28',
    category: 'Performance',
    description: 'Complex appeals taking >5 minutes to generate, causing user frustration and workflow delays.',
    impactArea: 'Back-Office / Claims'
  },
  {
    id: 'ISS-004',
    title: 'Voice bot misunderstanding payment amounts',
    project: 'Patient Financial Guide',
    severity: 'high',
    status: 'escalated',
    assignee: 'David Kim',
    reportedDate: '2024-11-27',
    category: 'NLP/Understanding',
    description: 'Patients reporting that the bot is misinterpreting dollar amounts, leading to incorrect payment plan quotes.',
    impactArea: 'Patient Experience'
  },
  {
    id: 'ISS-005',
    title: 'Data sync delay with Epic',
    project: 'Autonomous Coding Agent',
    severity: 'medium',
    status: 'in_progress',
    assignee: 'Tech Infrastructure',
    reportedDate: '2024-11-25',
    category: 'Integration',
    description: 'Encounter data from Epic is arriving with 2-hour delay, impacting same-day coding workflows.',
    impactArea: 'Mid-Cycle / Coding'
  },
  {
    id: 'ISS-006',
    title: 'Missing denial reason codes',
    project: 'Denial Defense Swarm',
    severity: 'low',
    status: 'open',
    assignee: 'Sarah Jenkins',
    reportedDate: '2024-11-22',
    category: 'Data Quality',
    description: 'Some payers returning non-standard denial codes not in our mapping table.',
    impactArea: 'Back-Office / Claims'
  }
];

export default function Issues() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'escalated' | 'resolved'>('all');

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getSeverityBadge = (severity: Issue['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600 text-white hover:bg-red-600">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white hover:bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 text-white hover:bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-slate-400 text-white hover:bg-slate-400">Low</Badge>;
    }
  };

  const getStatusBadge = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><AlertCircle className="w-3 h-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'escalated':
        return <Badge variant="outline" className="text-red-600 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Escalated</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Resolved</Badge>;
    }
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
            <Link href="/requests">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <FileText className="w-4 h-4 mr-3" />
                Project Requests
              </Button>
            </Link>
            <Link href="/issues">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
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
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold font-heading text-foreground">Issues & Escalations</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search issues..." 
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

        {/* Content */}
        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Issues</p>
              <p className="text-2xl font-bold text-foreground font-mono">{mockIssues.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-red-500">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Escalated</p>
              <p className="text-2xl font-bold text-red-600 font-mono">{mockIssues.filter(i => i.status === 'escalated').length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical</p>
              <p className="text-2xl font-bold text-red-600 font-mono">{mockIssues.filter(i => i.severity === 'critical').length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">In Progress</p>
              <p className="text-2xl font-bold text-amber-600 font-mono">{mockIssues.filter(i => i.status === 'in_progress').length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Open</p>
              <p className="text-2xl font-bold text-blue-600 font-mono">{mockIssues.filter(i => i.status === 'open').length}</p>
            </div>
          </div>

          {/* Filter Tabs & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button 
                variant={filterStatus === 'escalated' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('escalated')}
                className={filterStatus === 'escalated' ? '' : 'text-red-600 border-red-200'}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Escalated
              </Button>
              <Button 
                variant={filterStatus === 'open' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('open')}
              >
                Open
              </Button>
              <Button 
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus('in_progress')}
              >
                In Progress
              </Button>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <AlertCircle className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {/* Issue Cards */}
          <div className="grid gap-4">
            {filteredIssues.map(issue => (
              <Card key={issue.id} className={`hover:shadow-md transition-shadow ${issue.status === 'escalated' ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                        {getSeverityBadge(issue.severity)}
                        <Badge variant="secondary" className="text-xs">{issue.category}</Badge>
                      </div>
                      <CardTitle className="text-lg font-bold">{issue.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">{issue.project}</span> • {issue.impactArea}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(issue.status)}
                      <p className="text-xs text-muted-foreground">Reported {issue.reportedDate}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{issue.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigned to: </span>
                      <span className="font-medium">{issue.assignee}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Comment
                      </Button>
                      <Button variant="outline" size="sm">View Details</Button>
                      {issue.status !== 'escalated' && issue.status !== 'resolved' && (
                        <Button size="sm" variant="destructive">Escalate</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
