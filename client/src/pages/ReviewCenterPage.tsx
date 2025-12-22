import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, MessageSquare, AlertTriangle, FileText, GitPullRequest, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { apiRequest } from "@/lib/queryClient";
import { groupedInitiatives } from "@/lib/initiatives";

type CapabilityRecord = {
  id: string;
  initiativeId: string;
  name: string;
  description: string | null;
  healthStatus: string;
  approvalStatus: string;
  estimatedEffort: number | null;
  submittedBy: string | null;
  submittedAt: string | null;
};

type RequestRecord = {
  id: string;
  initiativeId: string;
  type: string;
  title: string;
  description: string | null;
  requestedAmount: number | null;
  justification: string | null;
  status: string;
  submittedBy: string | null;
  submittedAt: string | null;
};

type GateFormRecord = {
  id: string;
  initiativeId: string;
  gate: string;
  status: string;
  formData: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
};

type IssueRecord = {
  id: string;
  initiativeId: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  reportedBy: string | null;
  reportedAt: string | null;
};

function getInitiativeName(initiativeId: string): string {
  const init = groupedInitiatives.find(i => i.ids.includes(initiativeId));
  return init?.name || initiativeId;
}

export default function ReviewCenterPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("capabilities");
  const [rejectDialog, setRejectDialog] = useState<{ type: string; id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [resolveDialog, setResolveDialog] = useState<{ id: string; title: string } | null>(null);
  const [resolution, setResolution] = useState("");

  const { data: pendingCounts } = useQuery<{ capabilities: number; requests: number; gateForms: number; issues: number; total: number }>({
    queryKey: ["/api/review/pending-counts"],
  });

  const { data: capabilities = [], isLoading: loadingCapabilities } = useQuery<CapabilityRecord[]>({
    queryKey: ["/api/capabilities/pending"],
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery<RequestRecord[]>({
    queryKey: ["/api/requests/pending"],
  });

  const { data: gateForms = [], isLoading: loadingGateForms } = useQuery<GateFormRecord[]>({
    queryKey: ["/api/gate-forms/pending"],
  });

  const { data: issues = [], isLoading: loadingIssues } = useQuery<IssueRecord[]>({
    queryKey: ["/api/issues/open"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const endpoints: Record<string, string> = {
        capability: `/api/capabilities/${id}/approve`,
        request: `/api/requests/${id}/approve`,
        gateForm: `/api/gate-forms/${id}/approve`,
      };
      await apiRequest("PUT", endpoints[type]);
    },
    onSuccess: (_, { type }) => {
      toast({ title: "Approved", description: `${type} has been approved.` });
      queryClient.invalidateQueries({ queryKey: ["/api/review/pending-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/capabilities/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gate-forms/pending"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ type, id, reason }: { type: string; id: string; reason: string }) => {
      const endpoints: Record<string, string> = {
        capability: `/api/capabilities/${id}/reject`,
        request: `/api/requests/${id}/reject`,
        gateForm: `/api/gate-forms/${id}/reject`,
      };
      const bodyKeys: Record<string, string> = {
        capability: "rejectionReason",
        request: "rejectionReason",
        gateForm: "reason",
      };
      await apiRequest("PUT", endpoints[type], { [bodyKeys[type]]: reason });
    },
    onSuccess: (_, { type }) => {
      toast({ title: "Rejected", description: `${type} has been rejected.` });
      setRejectDialog(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/review/pending-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/capabilities/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gate-forms/pending"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject.", variant: "destructive" });
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiRequest("PUT", `/api/capabilities/${id}/request-changes`, { changeReason: reason });
    },
    onSuccess: () => {
      toast({ title: "Changes Requested", description: "Request for changes has been sent." });
      setRejectDialog(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/review/pending-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/capabilities/pending"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to request changes.", variant: "destructive" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => {
      await apiRequest("PUT", `/api/issues/${id}/resolve`, { resolution });
    },
    onSuccess: () => {
      toast({ title: "Resolved", description: "Issue has been resolved." });
      setResolveDialog(null);
      setResolution("");
      queryClient.invalidateQueries({ queryKey: ["/api/review/pending-counts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues/open"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to resolve issue.", variant: "destructive" });
    },
  });

  const handleReject = () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    
    if (rejectDialog.type === "capability-change") {
      requestChangesMutation.mutate({ id: rejectDialog.id, reason: rejectReason });
    } else {
      rejectMutation.mutate({ type: rejectDialog.type, id: rejectDialog.id, reason: rejectReason });
    }
  };

  const handleResolve = () => {
    if (!resolveDialog || !resolution.trim()) return;
    resolveMutation.mutate({ id: resolveDialog.id, resolution });
  };

  const counts = pendingCounts || { capabilities: 0, requests: 0, gateForms: 0, issues: 0, total: 0 };

  return (
    <AppLayout title="Review Center">
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Review Center</h1>
            <p className="text-sm text-muted-foreground">Review and approve pending items across all initiatives</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Illustrative Data</Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {counts.total} Pending Items
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab("capabilities")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Capabilities</span>
                </div>
                <Badge variant={counts.capabilities > 0 ? "default" : "secondary"}>{counts.capabilities}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setActiveTab("requests")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">Requests</span>
                </div>
                <Badge variant={counts.requests > 0 ? "default" : "secondary"}>{counts.requests}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setActiveTab("gateForms")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Gate Changes</span>
                </div>
                <Badge variant={counts.gateForms > 0 ? "default" : "secondary"}>{counts.gateForms}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-red-300 transition-colors" onClick={() => setActiveTab("issues")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Issues</span>
                </div>
                <Badge variant={counts.issues > 0 ? "destructive" : "secondary"}>{counts.issues}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="capabilities">Capabilities ({counts.capabilities})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({counts.requests})</TabsTrigger>
            <TabsTrigger value="gateForms">Gate Changes ({counts.gateForms})</TabsTrigger>
            <TabsTrigger value="issues">Issues ({counts.issues})</TabsTrigger>
          </TabsList>

          <TabsContent value="capabilities" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pending Capability Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCapabilities ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : capabilities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending capabilities</p>
                ) : (
                  <div className="space-y-3">
                    {capabilities.map((cap) => (
                      <div key={cap.id} className="flex items-center justify-between p-4 border rounded-lg bg-white" data-testid={`capability-row-${cap.id}`}>
                        <div className="flex-1">
                          <div className="font-medium">{cap.name}</div>
                          <div className="text-sm text-muted-foreground">{getInitiativeName(cap.initiativeId)}</div>
                          {cap.description && <p className="text-sm text-slate-600 mt-1">{cap.description}</p>}
                          <div className="flex gap-2 mt-2">
                            {cap.estimatedEffort && (
                              <Badge variant="outline" className="text-xs">{cap.estimatedEffort} pts</Badge>
                            )}
                            <Badge variant="outline" className={`text-xs ${cap.healthStatus === 'green' ? 'border-green-300 text-green-700' : cap.healthStatus === 'yellow' ? 'border-amber-300 text-amber-700' : 'border-red-300 text-red-700'}`}>
                              {cap.healthStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectDialog({ type: "capability-change", id: cap.id, title: cap.name })}
                            data-testid={`button-request-changes-${cap.id}`}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" /> Request Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setRejectDialog({ type: "capability", id: cap.id, title: cap.name })}
                            data-testid={`button-reject-capability-${cap.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({ type: "capability", id: cap.id })}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-capability-${cap.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pending Budget & Resource Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg bg-white" data-testid={`request-row-${req.id}`}>
                        <div className="flex-1">
                          <div className="font-medium">{req.title}</div>
                          <div className="text-sm text-muted-foreground">{getInitiativeName(req.initiativeId)}</div>
                          {req.description && <p className="text-sm text-slate-600 mt-1">{req.description}</p>}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs capitalize">{req.type}</Badge>
                            {req.requestedAmount && (
                              <Badge variant="outline" className="text-xs">${req.requestedAmount.toLocaleString()}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setRejectDialog({ type: "request", id: req.id, title: req.title })}
                            data-testid={`button-reject-request-${req.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({ type: "request", id: req.id })}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-request-${req.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gateForms" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pending Gate Change Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGateForms ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : gateForms.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending gate changes</p>
                ) : (
                  <div className="space-y-3">
                    {gateForms.map((form) => (
                      <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg bg-white" data-testid={`gate-form-row-${form.id}`}>
                        <div className="flex-1">
                          <div className="font-medium">Gate Progression: {form.gate}</div>
                          <div className="text-sm text-muted-foreground">{getInitiativeName(form.initiativeId)}</div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{form.gate}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setRejectDialog({ type: "gateForm", id: form.id, title: `Gate ${form.gate}` })}
                            data-testid={`button-reject-gate-${form.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({ type: "gateForm", id: form.id })}
                            disabled={approveMutation.isPending}
                            data-testid={`button-approve-gate-${form.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingIssues ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : issues.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No open issues</p>
                ) : (
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg bg-white" data-testid={`issue-row-${issue.id}`}>
                        <div className="flex-1">
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-sm text-muted-foreground">{getInitiativeName(issue.initiativeId)}</div>
                          {issue.description && <p className="text-sm text-slate-600 mt-1">{issue.description}</p>}
                          <div className="flex gap-2 mt-2">
                            <Badge variant={issue.severity === 'critical' ? 'destructive' : issue.severity === 'high' ? 'default' : 'outline'} className="text-xs capitalize">
                              {issue.severity}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setResolveDialog({ id: issue.id, title: issue.title })}
                            data-testid={`button-resolve-issue-${issue.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" /> Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {rejectDialog?.type === "capability-change" ? "Request Changes" : "Reject"}: {rejectDialog?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{rejectDialog?.type === "capability-change" ? "What changes are needed?" : "Reason for rejection"}</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={rejectDialog?.type === "capability-change" ? "Describe the changes needed..." : "Provide a reason for rejection..."}
                  rows={4}
                  data-testid="input-reject-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(""); }}>
                Cancel
              </Button>
              <Button
                variant={rejectDialog?.type === "capability-change" ? "default" : "destructive"}
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending || requestChangesMutation.isPending}
                data-testid="button-confirm-reject"
              >
                {rejectDialog?.type === "capability-change" ? "Request Changes" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!resolveDialog} onOpenChange={() => { setResolveDialog(null); setResolution(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Issue: {resolveDialog?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Resolution</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this issue was resolved..."
                  rows={4}
                  data-testid="input-resolution"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setResolveDialog(null); setResolution(""); }}>
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleResolve}
                disabled={!resolution.trim() || resolveMutation.isPending}
                data-testid="button-confirm-resolve"
              >
                Mark Resolved
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
