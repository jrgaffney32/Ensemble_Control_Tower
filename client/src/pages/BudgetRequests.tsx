import { useState } from "react";
import { DollarSign, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/layout/AppLayout";

interface BudgetRequest {
  id: string;
  title: string;
  project: string;
  type: 'budget_increase' | 'new_allocation' | 'resource_request' | 'capacity_expansion';
  requestor: string;
  requestedAmount: number;
  currentBudget?: number;
  justification: string;
  submittedDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'partial_approved';
  priority: 'urgent' | 'high' | 'normal';
  fteRequested?: number;
}

const mockBudgetRequests: BudgetRequest[] = [
  {
    id: 'BUD-001',
    title: 'Additional Cloud Infrastructure',
    project: 'Autonomous Coding Agent',
    type: 'budget_increase',
    requestor: 'Dr. Elena Rostova',
    requestedAmount: 150000,
    currentBudget: 2500000,
    justification: 'Need to scale GPU infrastructure to handle increased volume as we expand to new departments.',
    submittedDate: '2024-12-01',
    status: 'pending',
    priority: 'urgent'
  },
  {
    id: 'BUD-002',
    title: 'ML Engineering Team Expansion',
    project: 'Prior Auth "Concierge" Bot',
    type: 'resource_request',
    requestor: 'Marcus Thorne',
    requestedAmount: 280000,
    justification: 'Request 2 additional ML engineers to accelerate Clinical NLP Engine development and address Anthem integration issues.',
    submittedDate: '2024-11-28',
    status: 'under_review',
    priority: 'high',
    fteRequested: 2
  },
  {
    id: 'BUD-003',
    title: 'Payer API Integration Licenses',
    project: 'Denial Defense Swarm',
    type: 'new_allocation',
    requestor: 'Sarah Jenkins',
    requestedAmount: 75000,
    justification: 'Annual licensing for direct API connections with top 5 payers for automated appeal submission.',
    submittedDate: '2024-11-25',
    status: 'approved',
    priority: 'normal'
  },
  {
    id: 'BUD-004',
    title: 'Voice AI Platform Upgrade',
    project: 'Patient Financial Guide',
    type: 'budget_increase',
    requestor: 'David Kim',
    requestedAmount: 95000,
    currentBudget: 1200000,
    justification: 'Upgrade to premium voice synthesis for improved patient experience and accuracy.',
    submittedDate: '2024-11-22',
    status: 'partial_approved',
    priority: 'normal'
  },
  {
    id: 'BUD-005',
    title: 'Data Science Pod - Q1 Capacity',
    project: 'Portfolio Wide',
    type: 'capacity_expansion',
    requestor: 'PMO Office',
    requestedAmount: 420000,
    justification: 'Allocate capacity for 3 data scientists to support pipeline of new agentic initiatives in Q1.',
    submittedDate: '2024-11-20',
    status: 'under_review',
    priority: 'high',
    fteRequested: 3
  },
  {
    id: 'BUD-006',
    title: 'Security Audit & Compliance',
    project: 'All Active Projects',
    type: 'new_allocation',
    requestor: 'Compliance Office',
    requestedAmount: 85000,
    justification: 'HIPAA compliance audit and penetration testing for all patient-facing AI agents.',
    submittedDate: '2024-11-18',
    status: 'pending',
    priority: 'urgent'
  }
];

export default function BudgetRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'budget_increase' | 'resource_request' | 'new_allocation' | 'capacity_expansion'>('all');

  const filteredRequests = mockBudgetRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || req.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: BudgetRequest['type']) => {
    switch (type) {
      case 'budget_increase':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><TrendingUp className="w-3 h-3 mr-1" />Budget Increase</Badge>;
      case 'resource_request':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><Users className="w-3 h-3 mr-1" />Resource Request</Badge>;
      case 'new_allocation':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><DollarSign className="w-3 h-3 mr-1" />New Allocation</Badge>;
      case 'capacity_expansion':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Users className="w-3 h-3 mr-1" />Capacity Expansion</Badge>;
    }
  };

  const getStatusBadge = (status: BudgetRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><FileText className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="text-red-600 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      case 'partial_approved':
        return <Badge variant="outline" className="text-cyan-600 border-cyan-200"><CheckCircle2 className="w-3 h-3 mr-1" />Partial</Badge>;
    }
  };

  const getPriorityIndicator = (priority: BudgetRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">URGENT</span>;
      case 'high':
        return <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">HIGH</span>;
      default:
        return null;
    }
  };

  const totalRequested = mockBudgetRequests.reduce((sum, r) => sum + r.requestedAmount, 0);
  const totalApproved = mockBudgetRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.requestedAmount, 0);
  const totalPending = mockBudgetRequests.filter(r => r.status === 'pending' || r.status === 'under_review').reduce((sum, r) => sum + r.requestedAmount, 0);

  return (
    <AppLayout title="Budget Requests">
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="flex justify-end">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Illustrative Data</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Requested</p>
            <p className="text-2xl font-bold text-foreground font-mono">${(totalRequested / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-muted-foreground mt-1">{mockBudgetRequests.length} requests</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 font-mono">${(totalPending / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-muted-foreground mt-1">{mockBudgetRequests.filter(r => r.status === 'pending' || r.status === 'under_review').length} requests</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Approved</p>
            <p className="text-2xl font-bold text-green-600 font-mono">${(totalApproved / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground mt-1">{mockBudgetRequests.filter(r => r.status === 'approved').length} requests</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">FTEs Requested</p>
            <p className="text-2xl font-bold text-foreground font-mono">{mockBudgetRequests.reduce((sum, r) => sum + (r.fteRequested || 0), 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all requests</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold">Budget Approval Progress</p>
            <p className="text-sm text-muted-foreground">{Math.round((totalApproved / totalRequested) * 100)}% Approved</p>
          </div>
          <Progress value={(totalApproved / totalRequested) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Approved: ${(totalApproved / 1000).toFixed(0)}K</span>
            <span>Pending: ${(totalPending / 1000).toFixed(0)}K</span>
            <span>Total: ${(totalRequested / 1000000).toFixed(2)}M</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={filterType === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button 
              variant={filterType === 'budget_increase' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('budget_increase')}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Budget Increase
            </Button>
            <Button 
              variant={filterType === 'resource_request' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('resource_request')}
            >
              <Users className="w-3 h-3 mr-1" />
              Resources
            </Button>
            <Button 
              variant={filterType === 'new_allocation' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('new_allocation')}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              New Allocation
            </Button>
            <Button 
              variant={filterType === 'capacity_expansion' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('capacity_expansion')}
            >
              Capacity
            </Button>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <DollarSign className="w-4 h-4 mr-2" />
            Submit Request
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredRequests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{request.id}</span>
                      {getTypeBadge(request.type)}
                      {getPriorityIndicator(request.priority)}
                    </div>
                    <CardTitle className="text-lg font-bold">{request.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">{request.project}</span> • Requested by {request.requestor}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-muted-foreground">Submitted {request.submittedDate}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{request.justification}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-6">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Requested: </span>
                      <span className="font-bold font-mono text-lg">${request.requestedAmount.toLocaleString()}</span>
                    </div>
                    {request.currentBudget && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Current Budget: </span>
                        <span className="font-medium font-mono">${request.currentBudget.toLocaleString()}</span>
                      </div>
                    )}
                    {request.fteRequested && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">FTEs: </span>
                        <span className="font-bold">{request.fteRequested}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {(request.status === 'pending' || request.status === 'under_review') && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Deny</Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
