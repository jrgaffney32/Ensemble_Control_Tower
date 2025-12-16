import { useState } from "react";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, Search, Filter, Plus, FileText, GitBranch, Clock, CheckCircle2, AlertCircle, Home, ListOrdered, ArrowUpDown, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { mockReprioritizationRequests, ReprioritizationRequest, getCategoryLabel } from "@/lib/priorityData";
import { useToast } from "@/hooks/use-toast";

interface ProjectRequest {
  id: string;
  title: string;
  type: 'new_project' | 'change_request';
  requestor: string;
  department: string;
  submittedDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending_review' | 'in_review' | 'approved' | 'rejected';
  estimatedBudget: number;
  description: string;
}

const mockRequests: ProjectRequest[] = [
  {
    id: 'REQ-001',
    title: 'Claims Reconciliation Agent',
    type: 'new_project',
    requestor: 'Jennifer Walsh',
    department: 'Revenue Integrity',
    submittedDate: '2024-11-28',
    priority: 'high',
    estimatedBudget: 450000,
    status: 'pending_review',
    description: 'Develop an AI agent to automatically reconcile claims data between Epic and payer remittance files.'
  },
  {
    id: 'REQ-002',
    title: 'Add Cardiology Department to Coding Agent',
    type: 'change_request',
    requestor: 'Dr. Michael Torres',
    department: 'Cardiology',
    submittedDate: '2024-11-25',
    priority: 'medium',
    estimatedBudget: 85000,
    status: 'in_review',
    description: 'Extend the Autonomous Coding Agent to support cardiology-specific procedure codes and documentation.'
  },
  {
    id: 'REQ-003',
    title: 'Real-time Eligibility Verification Bot',
    type: 'new_project',
    requestor: 'Amanda Chen',
    department: 'Patient Access',
    submittedDate: '2024-11-20',
    priority: 'high',
    estimatedBudget: 320000,
    status: 'in_review',
    description: 'Build an agentic system to verify patient insurance eligibility in real-time during scheduling.'
  },
  {
    id: 'REQ-004',
    title: 'Expand Prior Auth Bot to Imaging',
    type: 'change_request',
    requestor: 'Robert Kim',
    department: 'Radiology',
    submittedDate: '2024-11-18',
    priority: 'low',
    estimatedBudget: 65000,
    status: 'approved',
    description: 'Add imaging-specific prior authorization workflows to the existing Prior Auth Concierge Bot.'
  },
  {
    id: 'REQ-005',
    title: 'Payment Posting Automation',
    type: 'new_project',
    requestor: 'Lisa Martinez',
    department: 'Cash Management',
    submittedDate: '2024-11-15',
    priority: 'medium',
    estimatedBudget: 280000,
    status: 'pending_review',
    description: 'Automate ERA/EOB payment posting with AI-driven exception handling and variance detection.'
  }
];

export default function ProjectRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'new_project' | 'change_request'>('all');
  const [activeTab, setActiveTab] = useState<'projects' | 'priorities'>('projects');
  const { toast } = useToast();
  
  const isIllustrative = true;

  const filteredRequests = mockRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    return matchesSearch && matchesType;
  });

  const pendingPriorityRequests = mockReprioritizationRequests.filter(r => r.status === 'pending');

  const handleApprove = (request: ReprioritizationRequest) => {
    toast({
      title: "Request Approved",
      description: `${request.requestType === 'kill' ? 'Kill' : 'Reprioritization'} request for "${request.itemName}" has been approved.`
    });
  };

  const handleReject = (request: ReprioritizationRequest) => {
    toast({
      title: "Request Rejected",
      description: `${request.requestType === 'kill' ? 'Kill' : 'Reprioritization'} request for "${request.itemName}" has been rejected.`,
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: ProjectRequest['status']) => {
    switch (status) {
      case 'pending_review':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"><FileText className="w-3 h-3 mr-1" />In Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  const getPriorityBadge = (priority: ProjectRequest['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="text-red-600 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-amber-600 border-amber-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-slate-600 border-slate-200">Low</Badge>;
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
            <Link href="/requests">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
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
            <h2 className="text-lg font-bold font-heading text-foreground">Project Requests & Changes</h2>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Illustrative Data</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search requests..." 
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
          
          {/* Tabs for Project Requests and Priority Requests */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'projects' | 'priorities')} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="projects" className="gap-2">
                <FileText className="w-4 h-4" />
                Project Requests
                <Badge variant="secondary" className="ml-1">{mockRequests.filter(r => r.status === 'pending_review').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="priorities" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Priority Requests
                <Badge variant="secondary" className="ml-1">{pendingPriorityRequests.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Requests</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{mockRequests.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600 font-mono">{mockRequests.filter(r => r.status === 'pending_review').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">In Review</p>
                  <p className="text-2xl font-bold text-blue-600 font-mono">{mockRequests.filter(r => r.status === 'in_review').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Est. Investment</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ${(mockRequests.reduce((sum, r) => sum + r.estimatedBudget, 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>

              {/* Filter Tabs & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant={filterType === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All Requests
                  </Button>
                  <Button 
                    variant={filterType === 'new_project' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterType('new_project')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New Projects
                  </Button>
                  <Button 
                    variant={filterType === 'change_request' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilterType('change_request')}
                  >
                    <GitBranch className="w-3 h-3 mr-1" />
                    Change Requests
                  </Button>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </div>

              {/* Request Cards */}
              <div className="grid gap-4">
                {filteredRequests.map(request => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground">{request.id}</span>
                            <Badge variant="secondary" className={request.type === 'new_project' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700'}>
                              {request.type === 'new_project' ? 'New Project' : 'Change Request'}
                            </Badge>
                            {getPriorityBadge(request.priority)}
                          </div>
                          <CardTitle className="text-lg font-bold">{request.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Requested by <span className="font-medium">{request.requestor}</span> • {request.department}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-muted-foreground">Submitted {request.submittedDate}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">{request.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Estimated Budget: </span>
                          <span className="font-semibold font-mono">${request.estimatedBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          {request.status === 'pending_review' && (
                            <Button size="sm">Start Review</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="priorities" className="space-y-6">
              {/* Summary Cards for Priority Requests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Priority Requests</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{mockReprioritizationRequests.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reprioritization</p>
                  <p className="text-2xl font-bold text-blue-600 font-mono">{mockReprioritizationRequests.filter(r => r.requestType === 'reprioritize').length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kill Requests</p>
                  <p className="text-2xl font-bold text-red-600 font-mono">{mockReprioritizationRequests.filter(r => r.requestType === 'kill').length}</p>
                </div>
              </div>

              {/* Priority Request Cards */}
              <div className="grid gap-4">
                {mockReprioritizationRequests.map(request => (
                  <Card key={request.id} className={`hover:shadow-md transition-shadow ${request.requestType === 'kill' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'}`} data-testid={`card-priority-request-${request.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground">{request.id}</span>
                            <Badge variant="secondary" className={request.requestType === 'kill' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                              {request.requestType === 'kill' ? (
                                <><Trash2 className="w-3 h-3 mr-1" />Kill Request</>
                              ) : (
                                <><ArrowUpDown className="w-3 h-3 mr-1" />Reprioritize</>
                              )}
                            </Badge>
                            <Badge variant="outline">{request.itemType}</Badge>
                          </div>
                          <CardTitle className="text-lg font-bold">{request.itemName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Requested by <span className="font-medium">{request.requestor}</span> • {request.requestDate}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={request.status === 'pending' ? 'bg-amber-100 text-amber-700' : request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            <Clock className="w-3 h-3 mr-1" />
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {request.requestType === 'reprioritize' && (
                        <div className="flex items-center gap-4 mb-3 p-3 bg-slate-50 rounded-lg">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Current: </span>
                            <Badge variant="outline">{getCategoryLabel(request.currentCategory)} #{request.currentRank}</Badge>
                          </div>
                          <span className="text-muted-foreground">→</span>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Requested: </span>
                            <Badge variant="outline">{getCategoryLabel(request.targetCategory!)} #{request.targetRank}</Badge>
                          </div>
                        </div>
                      )}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Justification</p>
                        <p className="text-sm text-slate-600">{request.justification}</p>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(request)}
                            data-testid={`button-reject-${request.id}`}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request)}
                            data-testid={`button-approve-${request.id}`}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {mockReprioritizationRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-white rounded-xl border">
                    No priority change requests pending
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}
