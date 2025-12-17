import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, FileText, AlertCircle, ChevronRight, CheckCircle2, Circle, Clock, XCircle, Upload, FileUp, MessageSquare, Home, ListOrdered, LogOut, DollarSign, Target, TrendingUp, BarChart3, Activity, Lock, Edit2, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useUserRole } from "@/hooks/use-user-role";
import { MilestoneEditor, type Milestone } from "@/components/dashboard/MilestoneEditor";
import { formatCurrency, getGroupedInitiativeById, type GroupedInitiative } from "@/lib/initiatives";

type StatusValue = 'green' | 'yellow' | 'red';
type FormStatus = 'not_started' | 'draft' | 'submitted' | 'approved' | 'change_requested';

interface InitiativeStatus {
  initiativeId: string;
  costStatus: StatusValue;
  benefitStatus: StatusValue;
  timelineStatus: StatusValue;
  scopeStatus: StatusValue;
}

interface GateFormData {
  id: string;
  initiativeId: string;
  gate: string;
  status: FormStatus;
}

function FormsTabContent({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const { data: forms = [], isLoading } = useQuery<GateFormData[]>({
    queryKey: ['/api/initiatives', projectId, 'forms'],
    queryFn: async () => {
      const res = await fetch(`/api/initiatives/${projectId}/forms`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch forms');
      return res.json();
    },
    enabled: !!projectId,
  });
  
  const getFormStatus = (gate: string): FormStatus => {
    const form = forms.find(f => f.gate === gate);
    return form?.status || 'not_started';
  };
  
  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <Edit2 className="w-4 h-4 text-amber-600" />;
      case 'change_requested':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };
  
  const getStatusBadge = (status: FormStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Draft</Badge>;
      case 'change_requested':
        return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Change Requested</Badge>;
      default:
        return <Badge variant="outline" className="text-xs text-slate-400">Not Started</Badge>;
    }
  };
  
  const gates = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Intake Form</CardTitle>
            <Badge variant="outline" className="text-slate-500">Not Started</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Link href={`/project/${projectId}/intake`}>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm">Project Intake Form</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Stage Gate Forms</CardTitle>
            {isLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gates.map(gate => {
              const status = getFormStatus(gate);
              const isApproved = status === 'approved';
              return (
                <Link key={gate} href={`/project/${projectId}/gate/${gate}`}>
                  <div 
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      isApproved ? 'bg-green-50 hover:bg-green-100' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                    data-testid={`form-link-${gate}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium">{gate} Gate Review</span>
                      {isApproved && <Lock className="w-3 h-3 text-green-600" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status)}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id || '';
  const { user, role, canEdit, isControlTower, isSTO } = useUserRole();
  const queryClient = useQueryClient();
  
  const initiative = useMemo(() => getGroupedInitiativeById(projectId), [projectId]);
  
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    if (initiative?.milestones) {
      return initiative.milestones.map((m, idx) => ({
        id: `ms-${idx}`,
        name: m.name,
        targetDate: m.endDate || m.startDate || '',
        status: 'green' as const
      }));
    }
    return [];
  });

  const { data: statusData, isLoading: isStatusLoading } = useQuery<InitiativeStatus>({
    queryKey: ['/api/initiatives', projectId, 'status'],
    queryFn: async () => {
      const res = await fetch(`/api/initiatives/${projectId}/status`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    },
    enabled: !!projectId,
  });

  const [costStatus, setCostStatus] = useState<StatusValue>('green');
  const [benefitStatus, setBenefitStatus] = useState<StatusValue>('green');
  const [timelineStatus, setTimelineStatus] = useState<StatusValue>('green');
  const [scopeStatus, setScopeStatus] = useState<StatusValue>('green');
  const [statusInitialized, setStatusInitialized] = useState(false);

  useEffect(() => {
    if (statusData) {
      setCostStatus(statusData.costStatus);
      setBenefitStatus(statusData.benefitStatus);
      setTimelineStatus(statusData.timelineStatus);
      setScopeStatus(statusData.scopeStatus);
      setStatusInitialized(true);
    }
  }, [statusData]);

  const canEditStatus = canEdit && statusInitialized && !isStatusLoading;

  const updateStatusMutation = useMutation({
    mutationFn: async (data: Omit<InitiativeStatus, 'initiativeId'>) => {
      const res = await fetch(`/api/initiatives/${projectId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/initiatives', projectId, 'status'] });
    },
  });

  const handleStatusChange = (field: keyof Omit<InitiativeStatus, 'initiativeId'>, value: StatusValue) => {
    const setters: Record<string, (v: StatusValue) => void> = {
      costStatus: setCostStatus,
      benefitStatus: setBenefitStatus,
      timelineStatus: setTimelineStatus,
      scopeStatus: setScopeStatus,
    };
    setters[field](value);
    
    const newStatus = {
      costStatus: field === 'costStatus' ? value : costStatus,
      benefitStatus: field === 'benefitStatus' ? value : benefitStatus,
      timelineStatus: field === 'timelineStatus' ? value : timelineStatus,
      scopeStatus: field === 'scopeStatus' ? value : scopeStatus,
    };
    updateStatusMutation.mutate(newStatus);
  };

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getStatusBg = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-50';
      case 'yellow': return 'bg-yellow-50';
      case 'red': return 'bg-red-50';
    }
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


  const getLGateProgress = (lgate: string) => {
    const gates = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
    const index = gates.indexOf(lgate);
    return index >= 0 ? ((index + 1) / gates.length) * 100 : 0;
  };

  const getLGateNumber = (lgate: string) => {
    const gates = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
    return gates.indexOf(lgate) + 1;
  };

  if (!initiative) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Initiative Not Found</h1>
          <p className="text-muted-foreground mb-4">The initiative "{projectId}" was not found.</p>
          <Link href="/projects">
            <Button>Back to All Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href="/projects">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
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
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href="/projects" className="text-muted-foreground hover:text-foreground">Projects</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{initiative.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-slate-200 relative">
              <Bell className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Project Header */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold font-heading text-foreground">{initiative.name}</h1>
                  <Badge variant="outline">{initiative.lGate}</Badge>
                </div>
                <p className="text-muted-foreground">{initiative.valueStream} • {initiative.costCenter}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>0 Open Issues</span>
                    <span className="text-[10px] text-amber-500">(placeholder)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    <FileText className="w-4 h-4" />
                    <span>0 Pending Requests</span>
                    <span className="text-[10px] text-amber-500">(placeholder)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 border rounded-lg p-3 bg-slate-50">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(costStatus)}`} />
                  <span className="text-[10px] text-muted-foreground">Cost</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(benefitStatus)}`} />
                  <span className="text-[10px] text-muted-foreground">Benefit</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(timelineStatus)}`} />
                  <span className="text-[10px] text-muted-foreground">Timeline</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(scopeStatus)}`} />
                  <span className="text-[10px] text-muted-foreground">Scope</span>
                </div>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-6 gap-4 mt-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Budgeted Cost</span>
                </div>
                <p className="text-lg font-bold font-mono">
                  {initiative.budgetedCost > 0 ? formatCurrency(initiative.budgetedCost) : '-'}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Realized Cost</span>
                </div>
                <p className="text-lg font-bold font-mono text-blue-600">$0</p>
                <p className="text-[10px] text-blue-500 mt-1">Placeholder</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Targeted Benefit</span>
                </div>
                <p className="text-lg font-bold font-mono text-green-600">
                  {initiative.targetedBenefit > 0 ? formatCurrency(initiative.targetedBenefit) : '-'}
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Realized Benefit</span>
                </div>
                <p className="text-lg font-bold font-mono text-emerald-600">$0</p>
                <p className="text-[10px] text-emerald-500 mt-1">Placeholder</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Milestones</span>
                </div>
                <p className="text-lg font-bold font-mono">{initiative.milestones.length}</p>
              </div>
            </div>
            
            {/* Gate Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">L-Gate Progress</span>
                <span className="text-muted-foreground">{initiative.lGate} ({getLGateNumber(initiative.lGate)} of 7)</span>
              </div>
              <Progress value={getLGateProgress(initiative.lGate)} className="h-3" />
              <div className="flex justify-between mt-3">
                {['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map((gate) => {
                  const isCompleted = getLGateNumber(initiative.lGate) > getLGateNumber(gate);
                  const isCurrent = gate === initiative.lGate;
                  return (
                    <div key={gate} className="flex flex-col items-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : isCurrent ? (
                        <Clock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs mt-1 font-medium">{gate}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="financials">FTE / Budget</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Initiative Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Value Stream</p>
                      <p className="text-sm mt-1">{initiative.valueStream}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Cost Center</p>
                      <p className="text-sm mt-1">{initiative.costCenter || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Current L-Gate</p>
                      <p className="text-sm mt-1">{initiative.lGate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Project IDs</p>
                      <p className="text-sm mt-1 font-mono text-muted-foreground">{initiative.ids.join(', ')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Status Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-md ${getStatusBg(costStatus)}`}>
                        <p className="text-xs text-muted-foreground mb-2">Cost Status</p>
                        <Select value={costStatus} onValueChange={(v) => handleStatusChange('costStatus', v as StatusValue)} disabled={!canEditStatus}>
                          <SelectTrigger className="h-8" data-testid="select-cost-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> On Track</div></SelectItem>
                            <SelectItem value="yellow"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> At Risk</div></SelectItem>
                            <SelectItem value="red"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Off Track</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={`p-3 rounded-md ${getStatusBg(benefitStatus)}`}>
                        <p className="text-xs text-muted-foreground mb-2">Benefit Status</p>
                        <Select value={benefitStatus} onValueChange={(v) => handleStatusChange('benefitStatus', v as StatusValue)} disabled={!canEditStatus}>
                          <SelectTrigger className="h-8" data-testid="select-benefit-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> On Track</div></SelectItem>
                            <SelectItem value="yellow"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> At Risk</div></SelectItem>
                            <SelectItem value="red"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Off Track</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={`p-3 rounded-md ${getStatusBg(timelineStatus)}`}>
                        <p className="text-xs text-muted-foreground mb-2">Timeline Status</p>
                        <Select value={timelineStatus} onValueChange={(v) => handleStatusChange('timelineStatus', v as StatusValue)} disabled={!canEditStatus}>
                          <SelectTrigger className="h-8" data-testid="select-timeline-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> On Track</div></SelectItem>
                            <SelectItem value="yellow"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> At Risk</div></SelectItem>
                            <SelectItem value="red"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Off Track</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={`p-3 rounded-md ${getStatusBg(scopeStatus)}`}>
                        <p className="text-xs text-muted-foreground mb-2">Scope Status</p>
                        <Select value={scopeStatus} onValueChange={(v) => handleStatusChange('scopeStatus', v as StatusValue)} disabled={!canEditStatus}>
                          <SelectTrigger className="h-8" data-testid="select-scope-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> On Track</div></SelectItem>
                            <SelectItem value="yellow"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> At Risk</div></SelectItem>
                            <SelectItem value="red"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Off Track</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isStatusLoading && (
                      <p className="text-xs text-muted-foreground text-center mt-2">Loading status...</p>
                    )}
                    {updateStatusMutation.isPending && (
                      <p className="text-xs text-blue-600 text-center mt-2 bg-blue-50 px-2 py-1 rounded">Saving...</p>
                    )}
                    {!canEdit && statusInitialized && (
                      <p className="text-xs text-muted-foreground text-center">View-only access. Contact an admin to update statuses.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Milestones Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Milestones
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{milestones.length} total</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {milestones.length > 0 ? (
                    <div className="space-y-2">
                      {milestones.slice(0, 8).map((ms, idx) => {
                        const statuses = ['not_started', 'on_track', 'at_risk', 'missed', 'complete'] as const;
                        const mockStatus = statuses[idx % statuses.length];
                        const statusConfig = {
                          not_started: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Not Started', icon: Circle },
                          on_track: { bg: 'bg-[#e8f5f0]', text: 'text-[#2d8a6e]', label: 'On Track', icon: CheckCircle2 },
                          at_risk: { bg: 'bg-[#fef3e5]', text: 'text-[#9a7b4f]', label: 'At Risk', icon: AlertCircle },
                          missed: { bg: 'bg-[#fde8e8]', text: 'text-[#c45850]', label: 'Missed', icon: XCircle },
                          complete: { bg: 'bg-[#e5f0e8]', text: 'text-[#2d6a4f]', label: 'Complete', icon: CheckCircle2 },
                        };
                        const config = statusConfig[mockStatus];
                        const StatusIcon = config.icon;
                        const targetDate = ms.targetDate || new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`w-4 h-4 ${config.text}`} />
                              <div>
                                <p className="text-sm font-medium text-slate-700">{ms.name}</p>
                                <p className="text-xs text-slate-500">Target: {targetDate}</p>
                              </div>
                            </div>
                            <Badge className={`${config.bg} ${config.text} border-0 text-[10px]`}>{config.label}</Badge>
                          </div>
                        );
                      })}
                      {milestones.length > 8 && (
                        <p className="text-xs text-slate-500 text-center pt-2">+{milestones.length - 8} more milestones</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No milestones defined</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Operational KPI Placeholders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Operational KPIs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Automation Rate</span>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="h-24 bg-slate-100 rounded flex items-center justify-center text-muted-foreground text-sm">
                        Chart Placeholder
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">Illustrative data pending</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Processing Time</span>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="h-24 bg-slate-100 rounded flex items-center justify-center text-muted-foreground text-sm">
                        Chart Placeholder
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">Illustrative data pending</p>
                    </div>
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">Error Rate</span>
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="h-24 bg-slate-100 rounded flex items-center justify-center text-muted-foreground text-sm">
                        Chart Placeholder
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">Illustrative data pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Milestones Tab */}
            <TabsContent value="milestones">
              {milestones.length > 0 ? (
                <MilestoneEditor 
                  milestones={milestones} 
                  onUpdate={setMilestones} 
                  canEdit={canEdit}
                />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No milestones defined for this initiative.
                  </CardContent>
                </Card>
              )}
              {!canEdit && milestones.length > 0 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  You have view-only access. Contact a Control Tower admin or STO to make changes.
                </p>
              )}
            </TabsContent>

            {/* FTE / Budget Financials Tab */}
            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      FTE & Budget Tracking
                    </CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Illustrative Data</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-2 font-semibold text-slate-600 bg-slate-50">Metric</th>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                            <th key={month} className="text-right py-3 px-2 font-semibold text-slate-600 bg-slate-50 min-w-[60px]">{month}</th>
                          ))}
                          <th className="text-right py-3 px-2 font-semibold text-slate-700 bg-slate-100 min-w-[70px]">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 bg-[#f8fafb]">
                          <td className="py-2 px-2 font-medium text-slate-700">Budgeted FTEs (Cost Center)</td>
                          {[12.5, 12.5, 13.0, 13.0, 13.5, 14.0, 14.0, 14.5, 15.0, 15.0, 15.5, 16.0].map((val, i) => (
                            <td key={i} className="text-right py-2 px-2 font-mono text-slate-600">{val.toFixed(1)}</td>
                          ))}
                          <td className="text-right py-2 px-2 font-mono font-semibold text-slate-700 bg-slate-50">168.5</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-2 font-medium text-slate-700">Budget Reduction Target</td>
                          {[0, 0, 0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 2.0, 2.0, 2.5, 2.5].map((val, i) => (
                            <td key={i} className="text-right py-2 px-2 font-mono text-[#2d8a6e]">{val.toFixed(1)}</td>
                          ))}
                          <td className="text-right py-2 px-2 font-mono font-semibold text-[#2d8a6e] bg-slate-50">15.0</td>
                        </tr>
                        <tr className="border-b border-slate-100 bg-[#f8fafb]">
                          <td className="py-2 px-2 font-medium text-slate-700">Actual FTE Reduction</td>
                          {[0, 0, 0.3, 0.4, 0.8, 0.9, 1.2, 1.4, '-', '-', '-', '-'].map((val, i) => (
                            <td key={i} className="text-right py-2 px-2 font-mono text-slate-600">{typeof val === 'number' ? val.toFixed(1) : val}</td>
                          ))}
                          <td className="text-right py-2 px-2 font-mono font-semibold text-slate-700 bg-slate-50">5.0</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 px-2 font-medium text-slate-700">Forecasted FTE Reduction</td>
                          {['-', '-', '-', '-', '-', '-', '-', '-', 1.8, 1.9, 2.3, 2.4].map((val, i) => (
                            <td key={i} className="text-right py-2 px-2 font-mono text-slate-400 italic">{typeof val === 'number' ? val.toFixed(1) : val}</td>
                          ))}
                          <td className="text-right py-2 px-2 font-mono font-semibold text-slate-500 bg-slate-50">8.4</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="py-2 px-2 font-semibold text-slate-700">Variance (Actual vs Target)</td>
                          {[0, 0, -0.2, -0.1, -0.2, -0.1, -0.3, -0.1, '-', '-', '-', '-'].map((val, i) => {
                            const isNegative = typeof val === 'number' && val < 0;
                            return (
                              <td key={i} className={`text-right py-2 px-2 font-mono ${isNegative ? 'text-[#c45850]' : 'text-slate-600'}`}>
                                {typeof val === 'number' ? (val >= 0 ? '+' : '') + val.toFixed(1) : val}
                              </td>
                            );
                          })}
                          <td className="text-right py-2 px-2 font-mono font-semibold text-[#c45850] bg-slate-100">-1.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center">Data shown is illustrative. Actual values will be populated from integrated systems.</p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">YTD FTE Reduction</p>
                      <p className="text-3xl font-bold font-mono text-[#2d8a6e]">5.0</p>
                      <p className="text-xs text-slate-500 mt-1">of 15.0 target</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">% to Target</p>
                      <p className="text-3xl font-bold font-mono text-[#2d4a7c]">33%</p>
                      <p className="text-xs text-slate-500 mt-1">through Aug</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Forecast Variance</p>
                      <p className="text-3xl font-bold font-mono text-[#c45850]">-1.6</p>
                      <p className="text-xs text-slate-500 mt-1">FTEs below plan</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Forms Tab */}
            <TabsContent value="forms">
              <FormsTabContent projectId={projectId} canEdit={canEdit} />
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Issues & Escalations</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Illustrative</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-4">No issues reported for this initiative.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Change & Budget Requests</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Illustrative</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-4">No requests submitted for this initiative.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-4">No activity recorded for this initiative.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}
