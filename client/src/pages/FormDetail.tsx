import { useState, useMemo, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, FileText, AlertCircle, ChevronRight, CheckCircle2, Clock, XCircle, Home, ListOrdered, LogOut, Lock, Edit2, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUserRole } from "@/hooks/use-user-role";
import { getGroupedInitiativeById } from "@/lib/initiatives";

type FormStatus = 'not_started' | 'draft' | 'submitted' | 'approved' | 'change_requested';

interface GateFormData {
  id: string;
  initiativeId: string;
  gate: string;
  status: FormStatus;
  formData: string | null;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  changeRequestReason?: string;
  changeRequestedBy?: string;
  changeRequestedAt?: string;
}

interface FormFields {
  objectives: string;
  scope: string;
  deliverables: string;
  risks: string;
  dependencies: string;
  resources: string;
  timeline: string;
  successCriteria: string;
}

const defaultFormFields: FormFields = {
  objectives: '',
  scope: '',
  deliverables: '',
  risks: '',
  dependencies: '',
  resources: '',
  timeline: '',
  successCriteria: '',
};

export default function FormDetail() {
  const [, params] = useRoute("/project/:id/form/:gate");
  const projectId = params?.id || '';
  const gate = params?.gate || '';
  const { user, role, canEdit, isControlTower } = useUserRole();
  const queryClient = useQueryClient();
  
  const initiative = useMemo(() => getGroupedInitiativeById(projectId), [projectId]);
  
  const [formFields, setFormFields] = useState<FormFields>(defaultFormFields);
  const [changeRequestDialogOpen, setChangeRequestDialogOpen] = useState(false);
  const [changeRequestReason, setChangeRequestReason] = useState('');
  
  const { data: formData, isLoading } = useQuery<GateFormData>({
    queryKey: ['/api/initiatives', projectId, 'forms', gate],
    queryFn: async () => {
      const res = await fetch(`/api/initiatives/${projectId}/forms/${gate}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch form');
      return res.json();
    },
    enabled: !!projectId && !!gate,
  });
  
  useEffect(() => {
    if (formData?.formData) {
      try {
        const parsed = JSON.parse(formData.formData);
        setFormFields({ ...defaultFormFields, ...parsed });
      } catch {
        setFormFields(defaultFormFields);
      }
    }
  }, [formData]);
  
  const updateFormMutation = useMutation({
    mutationFn: async (data: { formData: string; status?: FormStatus; changeRequestReason?: string }) => {
      const res = await fetch(`/api/initiatives/${projectId}/forms/${gate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update form');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/initiatives', projectId, 'forms', gate] });
      queryClient.invalidateQueries({ queryKey: ['/api/initiatives', projectId, 'forms'] });
    },
  });
  
  const approveFormMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/initiatives/${projectId}/forms/${gate}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve form');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/initiatives', projectId, 'forms', gate] });
      queryClient.invalidateQueries({ queryKey: ['/api/initiatives', projectId, 'forms'] });
    },
  });
  
  const handleFieldChange = (field: keyof FormFields, value: string) => {
    setFormFields(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveDraft = () => {
    updateFormMutation.mutate({ formData: JSON.stringify(formFields), status: 'draft' });
  };
  
  const handleSubmit = () => {
    updateFormMutation.mutate({ formData: JSON.stringify(formFields), status: 'submitted' });
  };
  
  const handleApprove = () => {
    approveFormMutation.mutate();
  };
  
  const handleRequestChange = () => {
    updateFormMutation.mutate({ 
      formData: JSON.stringify(formFields), 
      status: 'change_requested',
      changeRequestReason 
    });
    setChangeRequestDialogOpen(false);
    setChangeRequestReason('');
  };
  
  const isApproved = formData?.status === 'approved';
  const isSubmitted = formData?.status === 'submitted';
  const canEditForm = canEdit && !isApproved;
  const canApproveForm = isControlTower && isSubmitted;
  
  const getStatusBadge = (status: FormStatus) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline" className="text-slate-500">Not Started</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'change_requested':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Change Requested</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
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

  if (!initiative) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Initiative Not Found</h1>
          <Link href="/projects">
            <Button>Back to All Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex font-sans">
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

      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <Link href="/projects" className="text-muted-foreground hover:text-foreground">Projects</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href={`/project/${projectId}`} className="text-muted-foreground hover:text-foreground">{initiative.name}</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{gate} Gate Form</span>
          </div>
        </header>

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading">{gate} Gate Review Form</h1>
              <p className="text-muted-foreground">{initiative.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(formData?.status || 'not_started')}
              {isApproved && (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Locked</span>
                </div>
              )}
            </div>
          </div>
          
          {isApproved && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800">This form has been approved and is locked</p>
                      <p className="text-sm text-amber-600">To make changes, you must submit a change request for re-approval.</p>
                    </div>
                  </div>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => setChangeRequestDialogOpen(true)}
                      data-testid="button-request-change"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Change
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {formData?.status === 'change_requested' && formData.changeRequestReason && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Change Request Submitted</p>
                    <p className="text-sm text-red-600 mt-1">{formData.changeRequestReason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Gate Review Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading form...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="objectives">Objectives</Label>
                      <Textarea
                        id="objectives"
                        placeholder="What are the key objectives for this gate?"
                        value={formFields.objectives}
                        onChange={(e) => handleFieldChange('objectives', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-objectives"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scope">Scope</Label>
                      <Textarea
                        id="scope"
                        placeholder="Define the scope of work"
                        value={formFields.scope}
                        onChange={(e) => handleFieldChange('scope', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-scope"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="deliverables">Deliverables</Label>
                      <Textarea
                        id="deliverables"
                        placeholder="List expected deliverables"
                        value={formFields.deliverables}
                        onChange={(e) => handleFieldChange('deliverables', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-deliverables"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risks">Risks</Label>
                      <Textarea
                        id="risks"
                        placeholder="Identify potential risks"
                        value={formFields.risks}
                        onChange={(e) => handleFieldChange('risks', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-risks"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dependencies">Dependencies</Label>
                      <Textarea
                        id="dependencies"
                        placeholder="List dependencies"
                        value={formFields.dependencies}
                        onChange={(e) => handleFieldChange('dependencies', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-dependencies"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resources">Resources Required</Label>
                      <Textarea
                        id="resources"
                        placeholder="List required resources"
                        value={formFields.resources}
                        onChange={(e) => handleFieldChange('resources', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-resources"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline</Label>
                      <Textarea
                        id="timeline"
                        placeholder="Define the timeline and milestones"
                        value={formFields.timeline}
                        onChange={(e) => handleFieldChange('timeline', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-timeline"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="successCriteria">Success Criteria</Label>
                      <Textarea
                        id="successCriteria"
                        placeholder="Define success criteria"
                        value={formFields.successCriteria}
                        onChange={(e) => handleFieldChange('successCriteria', e.target.value)}
                        disabled={!canEditForm}
                        className="min-h-[100px]"
                        data-testid="input-success-criteria"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between pt-4">
            <Link href={`/project/${projectId}`}>
              <Button variant="outline" data-testid="button-back">
                Back to Initiative
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              {canEditForm && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={updateFormMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={updateFormMutation.isPending}
                    data-testid="button-submit"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Approval
                  </Button>
                </>
              )}
              
              {canApproveForm && (
                <Button 
                  onClick={handleApprove}
                  disabled={approveFormMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-approve"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              )}
              
              {updateFormMutation.isPending && (
                <span className="text-sm text-muted-foreground">Saving...</span>
              )}
              
              {updateFormMutation.isError && (
                <span className="text-sm text-red-600">{(updateFormMutation.error as Error).message}</span>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={changeRequestDialogOpen} onOpenChange={setChangeRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Change to Approved Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This form has already been approved. Submitting a change request will require re-approval from a Control Tower administrator.
            </p>
            <div className="space-y-2">
              <Label htmlFor="changeReason">Reason for Change</Label>
              <Textarea
                id="changeReason"
                placeholder="Explain why changes are needed..."
                value={changeRequestReason}
                onChange={(e) => setChangeRequestReason(e.target.value)}
                className="min-h-[100px]"
                data-testid="input-change-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestChange}
              disabled={!changeRequestReason.trim() || updateFormMutation.isPending}
              data-testid="button-submit-change-request"
            >
              Submit Change Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
