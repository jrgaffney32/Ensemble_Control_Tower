import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface L0ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  onConfirm: (config: L0Config) => void;
}

export interface L0Config {
  valueStream: string;
  projectType: string;
  podAssignment: string;
  priorityCategory: 'now' | 'next' | 'later';
  priorityRank: number;
}

const VALUE_STREAMS = [
  { id: 'patient-access', name: 'Patient Access' },
  { id: 'coding', name: 'Coding' },
  { id: 'claims', name: 'Claims' },
  { id: 'clinical', name: 'Clinical' },
  { id: 'denials', name: 'Denials Management' },
];

const PROJECT_TYPES = [
  { id: 'automation', name: 'Automation' },
  { id: 'ai-agent', name: 'AI Agent' },
  { id: 'integration', name: 'Integration' },
  { id: 'enhancement', name: 'Enhancement' },
  { id: 'infrastructure', name: 'Infrastructure' },
];

const PODS = [
  { id: 'alpha', name: 'Alpha Pod' },
  { id: 'beta', name: 'Beta Pod' },
  { id: 'gamma', name: 'Gamma Pod' },
  { id: 'delta', name: 'Delta Pod' },
];

const PRIORITY_CATEGORIES = [
  { id: 'now', name: 'Now (Active Development)', description: 'Currently in development' },
  { id: 'next', name: 'Next (Queued)', description: 'Next in priority queue' },
  { id: 'later', name: 'Later (Backlog)', description: 'Planned for future' },
];

export function L0ConfigDialog({ open, onOpenChange, projectId, projectName, onConfirm }: L0ConfigDialogProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<L0Config>({
    valueStream: '',
    projectType: '',
    podAssignment: '',
    priorityCategory: 'next',
    priorityRank: 1,
  });

  const handleConfirm = () => {
    if (!config.valueStream || !config.projectType || !config.podAssignment) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before confirming.",
        variant: "destructive"
      });
      return;
    }
    
    onConfirm(config);
    toast({
      title: "Project Configured",
      description: `${projectName} has been configured and added to the roadmap.`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Project for Roadmap</DialogTitle>
          <DialogDescription>
            L0 has been approved. Configure the project details to add it to the roadmap and value stream priorities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="valueStream">Value Stream *</Label>
            <Select 
              value={config.valueStream} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, valueStream: value }))}
            >
              <SelectTrigger id="valueStream" data-testid="select-value-stream">
                <SelectValue placeholder="Select value stream..." />
              </SelectTrigger>
              <SelectContent>
                {VALUE_STREAMS.map(vs => (
                  <SelectItem key={vs.id} value={vs.id}>{vs.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="projectType">Project Type *</Label>
            <Select 
              value={config.projectType} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, projectType: value }))}
            >
              <SelectTrigger id="projectType" data-testid="select-project-type">
                <SelectValue placeholder="Select project type..." />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map(pt => (
                  <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="podAssignment">Pod Assignment *</Label>
            <Select 
              value={config.podAssignment} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, podAssignment: value }))}
            >
              <SelectTrigger id="podAssignment" data-testid="select-pod">
                <SelectValue placeholder="Select pod..." />
              </SelectTrigger>
              <SelectContent>
                {PODS.map(pod => (
                  <SelectItem key={pod.id} value={pod.id}>{pod.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priorityCategory">Priority Category *</Label>
            <Select 
              value={config.priorityCategory} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, priorityCategory: value as 'now' | 'next' | 'later' }))}
            >
              <SelectTrigger id="priorityCategory" data-testid="select-priority-category">
                <SelectValue placeholder="Select priority..." />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_CATEGORIES.map(pc => (
                  <SelectItem key={pc.id} value={pc.id}>
                    <div>
                      <span className="font-medium">{pc.name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">- {pc.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priorityRank">Priority Rank</Label>
            <Select 
              value={config.priorityRank.toString()} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, priorityRank: parseInt(value) }))}
            >
              <SelectTrigger id="priorityRank" data-testid="select-priority-rank">
                <SelectValue placeholder="Select rank..." />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                  <SelectItem key={rank} value={rank.toString()}>#{rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Position within the selected priority category</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} data-testid="button-confirm-config">
            Confirm & Add to Roadmap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
