import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { mockIntakeForms, IntakeForm } from "@/lib/formData";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";

export default function IntakeFormPage() {
  const [, params] = useRoute("/project/:id/intake");
  const [, navigate] = useLocation();
  const projectId = params?.id || 'ACA-001';
  const { toast } = useToast();
  
  const existingForm = mockIntakeForms.find(f => f.projectId === projectId);
  
  const [form, setForm] = useState<Partial<IntakeForm>>(existingForm || {
    projectId: projectId,
    projectName: '',
    singleThreadedOwner: '',
    initiativeOwner: '',
    problemStatement: '',
    desiredBusinessOutcome: '',
    successKPIs: '',
    estimatedRevenueImpact: '',
    estimatedEfficiencyImpact: '',
    grossBenefit: 0,
    netBenefit: 0,
    redeploymentLocation: '',
    metricImprovement: '',
    slaDriver: false,
    complianceDriver: false,
    reusePotential: false,
    timelinePeriod: '',
    risk: '',
    mitigation: '',
    status: 'draft'
  });

  const updateField = (field: keyof IntakeForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Form Saved",
      description: "Your intake form has been saved as a draft."
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Form Submitted",
      description: "Your intake form has been submitted for review."
    });
    navigate(`/project/${projectId}`);
  };

  return (
    <AppLayout title="New Project Intake">
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">Project Intake Form</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" /> Submit for Review
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input 
                id="projectName" 
                value={form.projectName || ''} 
                onChange={(e) => updateField('projectName', e.target.value)}
                data-testid="input-project-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Single-Threaded Owner (VP+) *</Label>
              <Input 
                id="owner" 
                value={form.singleThreadedOwner || ''} 
                onChange={(e) => updateField('singleThreadedOwner', e.target.value)}
                data-testid="input-owner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initiativeOwner">Initiative Owner (VP+)</Label>
              <Input 
                id="initiativeOwner" 
                value={form.initiativeOwner || ''} 
                onChange={(e) => updateField('initiativeOwner', e.target.value)}
                data-testid="input-initiative-owner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline Period *</Label>
              <Input 
                id="timeline" 
                placeholder="e.g., Q2 2025 - Q4 2025"
                value={form.timelinePeriod || ''} 
                onChange={(e) => updateField('timelinePeriod', e.target.value)}
                data-testid="input-timeline"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Problem & Desired Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="problem">Problem Statement *</Label>
              <Textarea 
                id="problem" 
                rows={3}
                placeholder="Describe the business problem this project will solve"
                value={form.problemStatement || ''} 
                onChange={(e) => updateField('problemStatement', e.target.value)}
                data-testid="input-problem"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Desired Business Outcome *</Label>
              <Textarea 
                id="outcome" 
                rows={3}
                placeholder="Describe the expected outcome and benefits"
                value={form.desiredBusinessOutcome || ''} 
                onChange={(e) => updateField('desiredBusinessOutcome', e.target.value)}
                data-testid="input-outcome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpis">Success KPIs *</Label>
              <Textarea 
                id="kpis" 
                rows={2}
                placeholder="e.g., Current 65% auto-code rate to 85% target"
                value={form.successKPIs || ''} 
                onChange={(e) => updateField('successKPIs', e.target.value)}
                data-testid="input-kpis"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Impact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Estimated Revenue Impact</Label>
              <Input 
                id="revenue" 
                placeholder="e.g., $4.2M annual impact"
                value={form.estimatedRevenueImpact || ''} 
                onChange={(e) => updateField('estimatedRevenueImpact', e.target.value)}
                data-testid="input-revenue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="efficiency">Estimated Efficiency Impact</Label>
              <Input 
                id="efficiency" 
                placeholder="e.g., 12 FTEs saved, $840K cost reduction"
                value={form.estimatedEfficiencyImpact || ''} 
                onChange={(e) => updateField('estimatedEfficiencyImpact', e.target.value)}
                data-testid="input-efficiency"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grossBenefit">Gross Benefit ($)</Label>
              <Input 
                id="grossBenefit" 
                type="number"
                value={form.grossBenefit || ''} 
                onChange={(e) => updateField('grossBenefit', Number(e.target.value))}
                data-testid="input-gross-benefit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netBenefit">Net Benefit ($)</Label>
              <Input 
                id="netBenefit" 
                type="number"
                value={form.netBenefit || ''} 
                onChange={(e) => updateField('netBenefit', Number(e.target.value))}
                data-testid="input-net-benefit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redeployment">Redeployment Location</Label>
              <Input 
                id="redeployment" 
                placeholder="Where will freed-up resources be reassigned?"
                value={form.redeploymentLocation || ''} 
                onChange={(e) => updateField('redeploymentLocation', e.target.value)}
                data-testid="input-redeployment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricImprovement">Metric Improvement</Label>
              <Input 
                id="metricImprovement" 
                placeholder="e.g., FPY from 72% to 90%"
                value={form.metricImprovement || ''} 
                onChange={(e) => updateField('metricImprovement', e.target.value)}
                data-testid="input-metric"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Strategic Drivers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>SLA Driver?</Label>
                <p className="text-sm text-muted-foreground">Is this project driven by SLA requirements?</p>
              </div>
              <Switch 
                checked={form.slaDriver || false}
                onCheckedChange={(checked) => updateField('slaDriver', checked)}
                data-testid="switch-sla"
              />
            </div>
            {form.slaDriver && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label htmlFor="slaDesc">SLA Driver Description</Label>
                <Input 
                  id="slaDesc" 
                  value={form.slaDriverDescription || ''} 
                  onChange={(e) => updateField('slaDriverDescription', e.target.value)}
                  data-testid="input-sla-desc"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance Driver?</Label>
                <p className="text-sm text-muted-foreground">Is this project driven by compliance requirements?</p>
              </div>
              <Switch 
                checked={form.complianceDriver || false}
                onCheckedChange={(checked) => updateField('complianceDriver', checked)}
                data-testid="switch-compliance"
              />
            </div>
            {form.complianceDriver && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label htmlFor="compDesc">Compliance Driver Description</Label>
                <Input 
                  id="compDesc" 
                  value={form.complianceDriverDescription || ''} 
                  onChange={(e) => updateField('complianceDriverDescription', e.target.value)}
                  data-testid="input-compliance-desc"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Reuse Potential?</Label>
                <p className="text-sm text-muted-foreground">Can this solution be reused across clients?</p>
              </div>
              <Switch 
                checked={form.reusePotential || false}
                onCheckedChange={(checked) => updateField('reusePotential', checked)}
                data-testid="switch-reuse"
              />
            </div>
            {form.reusePotential && (
              <div className="space-y-2 pl-4 border-l-2">
                <Label htmlFor="reuseScope">Reuse Potential Scope</Label>
                <Input 
                  id="reuseScope" 
                  placeholder="e.g., Applicable across all clients"
                  value={form.reusePotentialScope || ''} 
                  onChange={(e) => updateField('reusePotentialScope', e.target.value)}
                  data-testid="input-reuse-scope"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Milestones</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="approval">Approval Target</Label>
              <Input 
                id="approval" 
                placeholder="e.g., Jan 2025"
                value={form.approvalTarget || ''} 
                onChange={(e) => updateField('approvalTarget', e.target.value)}
                data-testid="input-approval-target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="design">Design Completion</Label>
              <Input 
                id="design" 
                placeholder="e.g., Mar 2025"
                value={form.designCompletionTarget || ''} 
                onChange={(e) => updateField('designCompletionTarget', e.target.value)}
                data-testid="input-design-target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilot">Pilot Rollout</Label>
              <Input 
                id="pilot" 
                placeholder="e.g., Jun 2025"
                value={form.pilotRolloutTarget || ''} 
                onChange={(e) => updateField('pilotRolloutTarget', e.target.value)}
                data-testid="input-pilot-target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scale">Scale Up</Label>
              <Input 
                id="scale" 
                placeholder="e.g., Oct 2025"
                value={form.scaleUpTarget || ''} 
                onChange={(e) => updateField('scaleUpTarget', e.target.value)}
                data-testid="input-scale-target"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dependencies & Risks</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dep1">Dependency 1</Label>
              <Input 
                id="dep1" 
                placeholder="e.g., Epic EMR integration API access"
                value={form.dependency1 || ''} 
                onChange={(e) => updateField('dependency1', e.target.value)}
                data-testid="input-dependency1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dep2">Dependency 2</Label>
              <Input 
                id="dep2" 
                value={form.dependency2 || ''} 
                onChange={(e) => updateField('dependency2', e.target.value)}
                data-testid="input-dependency2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk">Risk</Label>
              <Textarea 
                id="risk" 
                rows={2}
                placeholder="Describe key risks"
                value={form.risk || ''} 
                onChange={(e) => updateField('risk', e.target.value)}
                data-testid="input-risk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mitigation">Mitigation</Label>
              <Textarea 
                id="mitigation" 
                rows={2}
                placeholder="Describe mitigation strategies"
                value={form.mitigation || ''} 
                onChange={(e) => updateField('mitigation', e.target.value)}
                data-testid="input-mitigation"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pb-8">
          <Link href={`/project/${projectId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" /> Submit for Review
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}
