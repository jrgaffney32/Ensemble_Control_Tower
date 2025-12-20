import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, AlertCircle, ChevronRight, CheckCircle2, Circle, Clock, Upload, FileUp, MessageSquare, DollarSign, Target, TrendingUp, Lock, Edit2, ExternalLink, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useUserRole } from "@/hooks/use-user-role";
import { MilestoneEditor, type Milestone } from "@/components/dashboard/MilestoneEditor";
import { formatCurrency, getGroupedInitiativeById, type GroupedInitiative } from "@/lib/initiatives";
import { AppLayout } from "@/components/layout/AppLayout";

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
    <AppLayout title="Project Detail">
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
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
                <span className="text-xs font-semibold uppercase">Capabilities</span>
              </div>
              <p className="text-lg font-bold font-mono">{initiative.milestones.length}</p>
            </div>
          </div>
          
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

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="financials">FTE / Budget</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

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
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Priority Category</p>
                    <p className="text-sm mt-1">{initiative.priorityCategory}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Priority Rank</p>
                    <p className="text-sm mt-1">{initiative.priorityRank}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Status</span>
                    {canEditStatus ? (
                      <Select value={costStatus} onValueChange={(v: StatusValue) => handleStatusChange('costStatus', v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(costStatus)}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Benefit Status</span>
                    {canEditStatus ? (
                      <Select value={benefitStatus} onValueChange={(v: StatusValue) => handleStatusChange('benefitStatus', v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(benefitStatus)}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Timeline Status</span>
                    {canEditStatus ? (
                      <Select value={timelineStatus} onValueChange={(v: StatusValue) => handleStatusChange('timelineStatus', v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(timelineStatus)}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scope Status</span>
                    {canEditStatus ? (
                      <Select value={scopeStatus} onValueChange={(v: StatusValue) => handleStatusChange('scopeStatus', v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(scopeStatus)}`} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="capabilities">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                {initiative.milestones.length > 0 ? (
                  <div className="space-y-3">
                    {initiative.milestones.map((cap, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            cap.status === 'green' ? 'bg-green-500' : 
                            cap.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="font-medium text-sm">{cap.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cap.startDate && cap.endDate ? `${cap.startDate} - ${cap.endDate}` : 'No dates set'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No capabilities defined for this initiative.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <MilestoneEditor
                  milestones={milestones}
                  onUpdate={setMilestones}
                  canEdit={canEdit}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">FTE & Budget Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Financial tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms">
            <FormsTabContent projectId={projectId} canEdit={canEdit} />
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">No open issues</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">No pending requests</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Activity tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
