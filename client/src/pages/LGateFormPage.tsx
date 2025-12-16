import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { LayoutDashboard, PieChart, Calendar, Settings, Bell, FileText, AlertCircle, ChevronRight, Save, Send, ArrowLeft, Upload, CheckCircle2, Circle, XCircle, ThumbsUp, ThumbsDown, Home, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { mockLGateForms, lgateDefinitions, LGate, LGateForm, LGateRequirement, getFormStatusColor, getFormStatusLabel } from "@/lib/formData";
import { useToast } from "@/hooks/use-toast";

export default function LGateFormPage() {
  const [, params] = useRoute("/project/:id/gate/:gate");
  const [, navigate] = useLocation();
  const projectId = params?.id || 'ACA-001';
  const gateId = (params?.gate || 'L0') as LGate;
  const { toast } = useToast();
  
  const projectGates = mockLGateForms[projectId] || [];
  const existingForm = projectGates.find(g => g.gate === gateId);
  const gateDefinition = lgateDefinitions[gateId];
  
  const [requirements, setRequirements] = useState<LGateRequirement[]>(
    existingForm?.requirements || gateDefinition.requirements.map((req, idx) => ({
      id: `${projectId}-${gateId}-${idx}`,
      ...req,
      completed: false
    }))
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [approvalNotes, setApprovalNotes] = useState(existingForm?.approvalNotes || '');
  
  const status = existingForm?.status || 'draft';
  const isReviewer = true;
  const canEdit = status !== 'approved' && status !== 'rejected';
  const canApprove = status === 'submitted' || status === 'in_review';
  
  const completedCount = requirements.filter(r => r.completed).length;
  const allComplete = completedCount === requirements.length;

  const toggleRequirement = (id: string) => {
    if (!canEdit) return;
    setRequirements(prev => prev.map(req => 
      req.id === id ? { ...req, completed: !req.completed } : req
    ));
  };

  const handleSave = () => {
    toast({
      title: "Form Saved",
      description: `${gateId} form has been saved as a draft.`
    });
  };

  const handleSubmit = () => {
    if (!allComplete) {
      toast({
        title: "Cannot Submit",
        description: "Please complete all requirements before submitting.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Form Submitted",
      description: `${gateId} form has been submitted for review.`
    });
    navigate(`/project/${projectId}`);
  };

  const handleApprove = () => {
    toast({
      title: "Gate Approved",
      description: `${gateId}: ${gateDefinition.name} has been approved.`
    });
    navigate(`/project/${projectId}`);
  };

  const handleReject = () => {
    toast({
      title: "Gate Rejected",
      description: `${gateId}: ${gateDefinition.name} has been rejected. Comments sent to project team.`,
      variant: "destructive"
    });
    navigate(`/project/${projectId}`);
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
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/project/${projectId}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Project
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{gateId}: {gateDefinition.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <Button variant="outline" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </Button>
                <Button onClick={handleSubmit} disabled={!allComplete}>
                  <Send className="w-4 h-4 mr-2" /> Submit for Review
                </Button>
              </>
            )}
            {canApprove && isReviewer && (
              <>
                <Button variant="outline" onClick={handleReject} className="text-red-600 border-red-200 hover:bg-red-50">
                  <ThumbsDown className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  <ThumbsUp className="w-4 h-4 mr-2" /> Approve Gate
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Header */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold font-heading">{gateId}: {gateDefinition.name}</h1>
                <p className="text-muted-foreground mt-1">Complete all requirements to advance to the next gate</p>
              </div>
              <Badge className={getFormStatusColor(status)}>
                {getFormStatusLabel(status)}
              </Badge>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(completedCount / requirements.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{completedCount} of {requirements.length} complete</span>
            </div>
          </div>

          {/* Requirements Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gate Requirements</CardTitle>
              <CardDescription>Complete each requirement and upload supporting documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirements.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-4 rounded-lg border ${req.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-0.5">
                      <Checkbox
                        id={req.id}
                        checked={req.completed}
                        onCheckedChange={() => toggleRequirement(req.id)}
                        disabled={!canEdit}
                        data-testid={`checkbox-${req.id}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label 
                          htmlFor={req.id} 
                          className={`font-medium ${req.completed ? 'text-green-700' : ''}`}
                        >
                          {req.name}
                        </Label>
                        <Badge variant="outline" className="text-xs">{req.type}</Badge>
                      </div>
                      {req.description && (
                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                      )}
                      
                      <div className="mt-3 flex items-center gap-3">
                        {req.type === 'Document' && canEdit && (
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" /> Upload Document
                          </Button>
                        )}
                        {req.attachmentName && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <FileText className="w-4 h-4" />
                            <span>{req.attachmentName}</span>
                          </div>
                        )}
                      </div>
                      
                      {canEdit && (
                        <div className="mt-3">
                          <Input
                            placeholder="Add notes (optional)"
                            value={notes[req.id] || req.notes || ''}
                            onChange={(e) => setNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="text-sm"
                            data-testid={`notes-${req.id}`}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      {req.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Approval Section (for reviewers) */}
          {canApprove && isReviewer && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-base">Reviewer Section</CardTitle>
                <CardDescription>Review the submitted requirements and provide your decision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="approvalNotes">Approval/Rejection Notes</Label>
                  <Textarea
                    id="approvalNotes"
                    rows={3}
                    placeholder="Add notes for the project team..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    data-testid="input-approval-notes"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReject} className="text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-2" /> Reject Gate
                  </Button>
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Gate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {canEdit && (
            <div className="flex justify-end gap-2 pb-8">
              <Link href={`/project/${projectId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={!allComplete}>
                <Send className="w-4 h-4 mr-2" /> Submit for Review
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
