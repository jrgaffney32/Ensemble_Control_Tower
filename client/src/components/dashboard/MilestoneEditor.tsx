import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus, Trash2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type MilestoneStatus = 'green' | 'yellow' | 'red';

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  status: MilestoneStatus;
}

interface MilestoneEditorProps {
  milestones: Milestone[];
  onUpdate: (milestones: Milestone[]) => void;
  canEdit: boolean;
}

interface EditMilestoneDialogProps {
  milestone?: Milestone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (milestone: Milestone) => void;
  isNew?: boolean;
}

function EditMilestoneDialog({ milestone, open, onOpenChange, onSave, isNew = false }: EditMilestoneDialogProps) {
  const [name, setName] = useState(milestone?.name || '');
  const [targetDate, setTargetDate] = useState(milestone?.targetDate || '');
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status || 'green');
  
  const handleSave = () => {
    if (!name || !targetDate) return;
    
    onSave({
      id: milestone?.id || `ms-${Date.now()}`,
      name,
      targetDate,
      status,
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Milestone' : 'Edit Milestone'}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Create a new milestone for this project.' : 'Update the milestone details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Milestone Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter milestone name..."
              data-testid="input-milestone-name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              data-testid="input-milestone-date"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as MilestoneStatus)}>
              <SelectTrigger id="status" data-testid="select-milestone-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    On Track
                  </div>
                </SelectItem>
                <SelectItem value="yellow">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    At Risk
                  </div>
                </SelectItem>
                <SelectItem value="red">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Off Track
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name || !targetDate} data-testid="button-save-milestone">
            {isNew ? 'Add Milestone' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MilestoneEditor({ milestones, onUpdate, canEdit }: MilestoneEditorProps) {
  const { toast } = useToast();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'yellow': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'red': return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };
  
  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'green': return 'bg-green-100 border-green-200';
      case 'yellow': return 'bg-yellow-100 border-yellow-200';
      case 'red': return 'bg-red-100 border-red-200';
    }
  };
  
  const handleSaveMilestone = (milestone: Milestone) => {
    const existingIndex = milestones.findIndex(m => m.id === milestone.id);
    let updated: Milestone[];
    
    if (existingIndex >= 0) {
      updated = [...milestones];
      updated[existingIndex] = milestone;
      toast({ title: "Milestone Updated", description: `"${milestone.name}" has been updated.` });
    } else {
      updated = [...milestones, milestone];
      toast({ title: "Milestone Added", description: `"${milestone.name}" has been added.` });
    }
    
    onUpdate(updated);
    setEditingMilestone(null);
  };
  
  const handleDeleteMilestone = (id: string) => {
    const milestone = milestones.find(m => m.id === id);
    const updated = milestones.filter(m => m.id !== id);
    onUpdate(updated);
    toast({ title: "Milestone Deleted", description: `"${milestone?.name}" has been removed.` });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Milestones</CardTitle>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)} data-testid="button-add-milestone">
            <Plus className="w-4 h-4 mr-1" /> Add Milestone
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No milestones defined yet.</p>
        ) : (
          milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(milestone.status)}`}
              data-testid={`milestone-${milestone.id}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(milestone.status)}
                <div>
                  <p className="font-medium text-sm">{milestone.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Target: {new Date(milestone.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditingMilestone(milestone)}
                    data-testid={`button-edit-milestone-${milestone.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    data-testid={`button-delete-milestone-${milestone.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
      
      {editingMilestone && (
        <EditMilestoneDialog
          milestone={editingMilestone}
          open={!!editingMilestone}
          onOpenChange={(open) => !open && setEditingMilestone(null)}
          onSave={handleSaveMilestone}
        />
      )}
      
      <EditMilestoneDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveMilestone}
        isNew
      />
    </Card>
  );
}
