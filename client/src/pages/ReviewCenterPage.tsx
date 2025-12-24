import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, MessageSquare, AlertTriangle, FileText, GitPullRequest, ClipboardList, Loader2, Send, Mail, MailOpen, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type InquiryRecord = {
  id: string;
  initiativeId: string;
  fromUserId: string;
  toUserId: string | null;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: string | null;
  updatedAt: string | null;
};

type InquiryResponseRecord = {
  id: string;
  inquiryId: string;
  fromUserId: string;
  message: string;
  createdAt: string | null;
};

type UserRecord = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
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
  const [inquiryDialog, setInquiryDialog] = useState(false);
  const [newInquiry, setNewInquiry] = useState({ initiativeId: "", toUserId: "", subject: "", message: "" });
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const { data: pendingCounts } = useQuery<{ capabilities: number; requests: number; gateForms: number; issues: number; inquiries: number; total: number }>({
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

  const { data: allInquiries = [], isLoading: loadingInquiries } = useQuery<InquiryRecord[]>({
    queryKey: ["/api/inquiries"],
  });

  const { data: users = [] } = useQuery<UserRecord[]>({
    queryKey: ["/api/users"],
  });

  const { data: inquiryResponses = [] } = useQuery<InquiryResponseRecord[]>({
    queryKey: ["/api/inquiries", selectedInquiry?.id, "responses"],
    queryFn: async () => {
      if (!selectedInquiry) return [];
      const res = await fetch(`/api/inquiries/${selectedInquiry.id}/responses`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!selectedInquiry,
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (data: { initiativeId: string; toUserId?: string; subject: string; message: string }) => {
      await apiRequest("POST", "/api/inquiries", data);
    },
    onSuccess: () => {
      toast({ title: "Inquiry Sent", description: "Your inquiry has been sent." });
      setInquiryDialog(false);
      setNewInquiry({ initiativeId: "", toUserId: "", subject: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/review/pending-counts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send inquiry.", variant: "destructive" });
    },
  });

  const updateInquiryStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/inquiries/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Inquiry status updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/review/pending-counts"] });
      setSelectedInquiry(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    },
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

  const counts = pendingCounts || { capabilities: 0, requests: 0, gateForms: 0, issues: 0, inquiries: 0, total: 0 };
  const openInquiries = allInquiries.filter(i => i.status !== 'closed');
  
  const getUserName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const user = users.find(u => u.id === userId);
    if (!user) return userId;
    return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
  };

  const getInquiryStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MailOpen className="w-4 h-4 text-blue-600" />;
      case 'pending': return <Mail className="w-4 h-4 text-amber-600" />;
      case 'closed': return <MailCheck className="w-4 h-4 text-green-600" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Open</Badge>;
      case 'pending': return <Badge variant="default" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending Response</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

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

        <div className="grid grid-cols-5 gap-4">
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
          <Card className="cursor-pointer hover:border-teal-300 transition-colors" onClick={() => setActiveTab("inquiries")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Inquiries</span>
                </div>
                <Badge variant={openInquiries.length > 0 ? "default" : "secondary"}>{openInquiries.length}</Badge>
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
            <TabsTrigger value="inquiries">Inquiries ({openInquiries.length})</TabsTrigger>
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

          <TabsContent value="inquiries" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Inquiries to STO Leaders</CardTitle>
                <Button onClick={() => setInquiryDialog(true)} data-testid="button-new-inquiry">
                  <Send className="w-4 h-4 mr-2" /> New Inquiry
                </Button>
              </CardHeader>
              <CardContent>
                {loadingInquiries ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : allInquiries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No inquiries yet</p>
                ) : (
                  <div className="space-y-3">
                    {allInquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white cursor-pointer hover:border-teal-200"
                        onClick={() => setSelectedInquiry(inquiry)}
                        data-testid={`inquiry-row-${inquiry.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getInquiryStatusIcon(inquiry.status)}
                            <span className="font-medium">{inquiry.subject}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{getInitiativeName(inquiry.initiativeId)}</div>
                          <div className="text-sm text-slate-600 mt-1 line-clamp-1">{inquiry.message}</div>
                          <div className="flex gap-2 mt-2 items-center">
                            {getInquiryStatusBadge(inquiry.status)}
                            <span className="text-xs text-muted-foreground">
                              To: {getUserName(inquiry.toUserId)}
                            </span>
                            {inquiry.createdAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {inquiry.status !== 'closed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateInquiryStatusMutation.mutate({ id: inquiry.id, status: 'closed' });
                              }}
                              data-testid={`button-close-inquiry-${inquiry.id}`}
                            >
                              <MailCheck className="w-4 h-4 mr-1" /> Close
                            </Button>
                          )}
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

        <Dialog open={inquiryDialog} onOpenChange={() => { setInquiryDialog(false); setNewInquiry({ initiativeId: "", toUserId: "", subject: "", message: "" }); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send New Inquiry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Initiative</Label>
                <Select
                  value={newInquiry.initiativeId}
                  onValueChange={(value) => setNewInquiry({ ...newInquiry, initiativeId: value })}
                >
                  <SelectTrigger data-testid="select-initiative">
                    <SelectValue placeholder="Select an initiative" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupedInitiatives.map((init) => (
                      <SelectItem key={init.ids[0]} value={init.ids[0]}>{init.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To (STO Leader)</Label>
                <Select
                  value={newInquiry.toUserId}
                  onValueChange={(value) => setNewInquiry({ ...newInquiry, toUserId: value })}
                >
                  <SelectTrigger data-testid="select-to-user">
                    <SelectValue placeholder="Select recipient (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.role === 'sto_contributor').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newInquiry.subject}
                  onChange={(e) => setNewInquiry({ ...newInquiry, subject: e.target.value })}
                  placeholder="Brief subject of the inquiry"
                  data-testid="input-inquiry-subject"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={newInquiry.message}
                  onChange={(e) => setNewInquiry({ ...newInquiry, message: e.target.value })}
                  placeholder="Detailed inquiry message..."
                  rows={4}
                  data-testid="input-inquiry-message"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setInquiryDialog(false); setNewInquiry({ initiativeId: "", toUserId: "", subject: "", message: "" }); }}>
                Cancel
              </Button>
              <Button
                onClick={() => createInquiryMutation.mutate({
                  initiativeId: newInquiry.initiativeId,
                  toUserId: newInquiry.toUserId || undefined,
                  subject: newInquiry.subject,
                  message: newInquiry.message,
                })}
                disabled={!newInquiry.initiativeId || !newInquiry.subject.trim() || !newInquiry.message.trim() || createInquiryMutation.isPending}
                data-testid="button-send-inquiry"
              >
                <Send className="w-4 h-4 mr-2" /> Send Inquiry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedInquiry} onOpenChange={() => { setSelectedInquiry(null); setResponseMessage(""); }}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedInquiry && getInquiryStatusIcon(selectedInquiry.status)}
                {selectedInquiry?.subject}
              </DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">From Control Tower</span>
                    {selectedInquiry.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedInquiry.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{selectedInquiry.message}</p>
                  <div className="mt-2 flex gap-2 items-center">
                    {getInquiryStatusBadge(selectedInquiry.status)}
                    <span className="text-xs text-muted-foreground">
                      Initiative: {getInitiativeName(selectedInquiry.initiativeId)}
                    </span>
                  </div>
                </div>

                {inquiryResponses.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Responses</Label>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2">
                        {inquiryResponses.map((resp) => (
                          <div key={resp.id} className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-teal-800">
                                {getUserName(resp.fromUserId)}
                              </span>
                              {resp.createdAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(resp.createdAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm">{resp.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {selectedInquiry.status === 'open' && (
                    <Button
                      variant="outline"
                      onClick={() => updateInquiryStatusMutation.mutate({ id: selectedInquiry.id, status: 'pending' })}
                    >
                      Mark Pending
                    </Button>
                  )}
                  {selectedInquiry.status !== 'closed' && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateInquiryStatusMutation.mutate({ id: selectedInquiry.id, status: 'closed' })}
                    >
                      <MailCheck className="w-4 h-4 mr-2" /> Close Inquiry
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { setSelectedInquiry(null); setResponseMessage(""); }}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
