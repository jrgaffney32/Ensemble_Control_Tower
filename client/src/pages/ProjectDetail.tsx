import { useState } from "react";
import { useRoute, Link } from "wouter";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, FileText, AlertCircle, ChevronRight, CheckCircle2, Circle, Clock, XCircle, Upload, FileUp, MessageSquare, Home, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { mockIntakeForms, mockLGateForms, mockProjectActions, lgateDefinitions, getFormStatusColor, getFormStatusLabel, LGate, LGateForm, FormStatus } from "@/lib/formData";
import { mockProjects } from "@/lib/mockData";

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const projectId = params?.id || 'ACA-001';
  
  const project = mockProjects.find(p => p.id === projectId);
  const intakeForm = mockIntakeForms.find(f => f.projectId === projectId);
  const lgates = mockLGateForms[projectId] || [];
  const actions = mockProjectActions.filter(a => a.projectId === projectId);

  const completedGates = lgates.filter(g => g.status === 'approved').length;
  const currentGate = lgates.find(g => g.status === 'in_review' || g.status === 'submitted');
  const progressPercent = (completedGates / 7) * 100;

  const getGateIcon = (status: FormStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in_review': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'submitted': return <Clock className="w-5 h-5 text-purple-600" />;
      case 'draft': return <Circle className="w-5 h-5 text-amber-500" />;
      default: return <Circle className="w-5 h-5 text-slate-300" />;
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
            <span className="font-semibold text-foreground">{project?.name || projectId}</span>
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
                <h1 className="text-2xl font-bold font-heading text-foreground">{project?.name || intakeForm?.projectName}</h1>
                <p className="text-muted-foreground mt-1">{project?.valueStream || intakeForm?.singleThreadedOwner}</p>
              </div>
              <Badge className={getFormStatusColor(intakeForm?.status || 'not_started')}>
                Intake: {getFormStatusLabel(intakeForm?.status || 'not_started')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{intakeForm?.problemStatement}</p>
            
            {/* Gate Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Gate Progress</span>
                <span className="text-muted-foreground">{completedGates} of 7 gates completed</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between mt-3">
                {lgates.map((gate, idx) => (
                  <div key={gate.gate} className="flex flex-col items-center">
                    {getGateIcon(gate.status)}
                    <span className="text-xs mt-1 font-medium">{gate.gate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="gates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gates">L-Gate Forms</TabsTrigger>
              <TabsTrigger value="intake">Intake Form</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="history">Activity History</TabsTrigger>
            </TabsList>

            {/* L-Gate Forms Tab */}
            <TabsContent value="gates" className="space-y-4">
              {lgates.map((gate) => (
                <Card key={gate.gate} className={gate.status === 'in_review' ? 'border-l-4 border-l-blue-500' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {getGateIcon(gate.status)}
                        <div>
                          <CardTitle className="text-base">{gate.gate}: {gate.gateName}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {gate.requirements.filter(r => r.completed).length} of {gate.requirements.length} requirements complete
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getFormStatusColor(gate.status)}>
                          {getFormStatusLabel(gate.status)}
                        </Badge>
                        <Link href={`/project/${projectId}/gate/${gate.gate}`}>
                          <Button size="sm" variant={gate.status === 'not_started' ? 'outline' : 'default'}>
                            {gate.status === 'not_started' ? 'Start' : gate.status === 'approved' ? 'View' : 'Edit'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {gate.requirements.map((req) => (
                        <div key={req.id} className="flex items-center gap-2 text-sm">
                          {req.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={req.completed ? 'text-foreground' : 'text-muted-foreground'}>
                            {req.name}
                          </span>
                          {req.attachmentUrl && (
                            <FileText className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Intake Form Tab */}
            <TabsContent value="intake">
              {intakeForm && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Project Intake Form</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getFormStatusColor(intakeForm.status)}>
                          {getFormStatusLabel(intakeForm.status)}
                        </Badge>
                        <Link href={`/project/${projectId}/intake`}>
                          <Button size="sm">Edit Form</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problem Statement</p>
                          <p className="text-sm mt-1">{intakeForm.problemStatement}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Desired Outcome</p>
                          <p className="text-sm mt-1">{intakeForm.desiredBusinessOutcome}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Success KPIs</p>
                          <p className="text-sm mt-1">{intakeForm.successKPIs}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</p>
                          <p className="text-sm mt-1">{intakeForm.timelinePeriod}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Gross Benefit</p>
                            <p className="text-lg font-bold text-green-600">${(intakeForm.grossBenefit / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">Net Benefit</p>
                            <p className="text-lg font-bold text-green-600">${(intakeForm.netBenefit / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dependencies</p>
                          <ul className="text-sm mt-1 space-y-1">
                            {intakeForm.dependency1 && <li>• {intakeForm.dependency1}</li>}
                            {intakeForm.dependency2 && <li>• {intakeForm.dependency2}</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk & Mitigation</p>
                          <p className="text-sm mt-1"><strong>Risk:</strong> {intakeForm.risk}</p>
                          <p className="text-sm"><strong>Mitigation:</strong> {intakeForm.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Project Documents</CardTitle>
                    <Button size="sm"><Upload className="w-4 h-4 mr-2" /> Upload Document</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lgates.flatMap(gate => 
                      gate.requirements.filter(r => r.completed).map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                          <div className="flex items-center gap-3">
                            <FileUp className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{req.name}</p>
                              <p className="text-xs text-muted-foreground">{gate.gate}: {gate.gateName}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {actions.map((action) => (
                      <div key={action.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{action.enteredBy}</span>
                            <Badge variant="outline" className="text-xs">{action.actionType}</Badge>
                            {action.decision && (
                              <Badge className={action.decision === 'Approved' ? 'bg-green-100 text-green-700' : action.decision === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}>
                                {action.decision}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{action.notes}</p>
                          <p className="text-xs text-muted-foreground mt-2">{action.gate} • {action.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}
