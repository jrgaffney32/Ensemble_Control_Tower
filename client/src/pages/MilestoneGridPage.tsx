import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Shield, Search, Plus, Trash2, ChevronDown, ChevronUp, RefreshCw, Target, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";

interface Milestone {
  id: string;
  initiativeId: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'missed' | 'on_hold';
  notes: string | null;
}

interface Initiative {
  id: string;
  name: string;
  valueStream: string;
  lGate: string;
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'missed', label: 'Missed', color: 'bg-red-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-amber-500' },
];

export default function MilestoneGridPage() {
  const { user, isControlTower } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedInitiatives, setExpandedInitiatives] = useState<Record<string, boolean>>({});
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string>("");
  const [newMilestone, setNewMilestone] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "not_started" as Milestone['status'],
    notes: "",
  });

  const { data: milestones = [], isLoading: milestonesLoading, refetch: refetchMilestones } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    queryFn: async () => {
      const res = await fetch("/api/milestones");
      if (!res.ok) throw new Error("Failed to fetch milestones");
      return res.json();
    },
  });

  const { data: initiatives = [], isLoading: initiativesLoading } = useQuery<Initiative[]>({
    queryKey: ["/api/initiatives"],
    queryFn: async () => {
      const res = await fetch("/api/initiatives");
      if (!res.ok) throw new Error("Failed to fetch initiatives");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { initiativeId: string; name: string; startDate?: string; endDate?: string; status: string; notes?: string }) => {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setIsAddDialogOpen(false);
      setNewMilestone({ name: "", startDate: "", endDate: "", status: "not_started", notes: "" });
      setSelectedInitiativeId("");
      toast({ title: "Milestone Created", description: "New milestone has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create milestone.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Milestone> }) => {
      const res = await fetch(`/api/milestones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setEditingMilestone(null);
      toast({ title: "Milestone Updated", description: "Changes have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update milestone.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/milestones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete milestone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone Deleted", description: "Milestone has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete milestone.", variant: "destructive" });
    },
  });

  const milestonesByInitiative = useMemo(() => {
    const grouped: Record<string, { initiative: Initiative; milestones: Milestone[] }> = {};
    
    initiatives.forEach(init => {
      grouped[init.id] = { initiative: init, milestones: [] };
    });
    
    milestones.forEach(m => {
      if (grouped[m.initiativeId]) {
        grouped[m.initiativeId].milestones.push(m);
      }
    });
    
    return grouped;
  }, [initiatives, milestones]);

  const filteredGroups = useMemo(() => {
    return Object.entries(milestonesByInitiative)
      .filter(([, group]) => {
        const matchesSearch = searchTerm === "" ||
          group.initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.initiative.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.milestones.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = filterStatus === "all" ||
          group.milestones.some(m => m.status === filterStatus);
        
        return matchesSearch && (filterStatus === "all" || matchesStatus);
      })
      .sort((a, b) => a[1].initiative.name.localeCompare(b[1].initiative.name));
  }, [milestonesByInitiative, searchTerm, filterStatus]);

  const toggleInitiative = (id: string) => {
    setExpandedInitiatives(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: Milestone['status']) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color} text-white text-xs`}>
        {statusInfo?.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const handleAddMilestone = () => {
    if (!selectedInitiativeId || !newMilestone.name) {
      toast({ title: "Missing Fields", description: "Please select an initiative and enter a name.", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      initiativeId: selectedInitiativeId,
      name: newMilestone.name,
      startDate: newMilestone.startDate || undefined,
      endDate: newMilestone.endDate || undefined,
      status: newMilestone.status,
      notes: newMilestone.notes || undefined,
    });
  };

  const handleUpdateMilestone = () => {
    if (!editingMilestone) return;
    updateMutation.mutate({
      id: editingMilestone.id,
      data: {
        name: editingMilestone.name,
        startDate: editingMilestone.startDate,
        endDate: editingMilestone.endDate,
        status: editingMilestone.status,
        notes: editingMilestone.notes,
      },
    });
  };

  if (!isControlTower) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-700 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-4">Only Control Tower administrators can access the Milestone Grid.</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const headerActions = (
    <Button 
      onClick={() => setIsAddDialogOpen(true)}
      className="bg-purple-600 hover:bg-purple-700"
      data-testid="button-add-milestone"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Milestone
    </Button>
  );

  return (
    <AppLayout title="Milestone Grid" headerActions={headerActions}>
      <div className="p-4 bg-slate-50 border-b flex items-center gap-4 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search initiatives or milestones..." 
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-white" data-testid="select-status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetchMilestones()}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500">
            {milestones.length} milestones across {initiatives.length} initiatives
          </span>
        </div>
      </div>

      {(milestonesLoading || initiativesLoading) && (
        <div className="p-12 text-center">
          <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin" />
          <p className="text-slate-500">Loading milestones...</p>
        </div>
      )}

      {!milestonesLoading && !initiativesLoading && (
        <div className="p-6 space-y-4">
          {filteredGroups.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No milestones found matching your criteria</p>
            </div>
          )}
          
          {filteredGroups.map(([initId, group]) => (
            <div key={initId} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => toggleInitiative(initId)}
                data-testid={`initiative-row-${initId}`}
              >
                <div className="flex items-center gap-3">
                  {expandedInitiatives[initId] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{group.initiative.name}</p>
                    <p className="text-xs text-slate-500">{group.initiative.id} • {group.initiative.valueStream} • {group.initiative.lGate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {group.milestones.length} milestone{group.milestones.length !== 1 ? 's' : ''}
                  </Badge>
                  {group.milestones.some(m => m.status === 'missed') && (
                    <Badge className="bg-red-500 text-white text-xs">Has Missed</Badge>
                  )}
                </div>
              </div>
              
              {expandedInitiatives[initId] && (
                <div className="border-t border-slate-200">
                  {group.milestones.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-sm">
                      No milestones for this initiative.
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-purple-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInitiativeId(initId);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        Add one
                      </Button>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3 font-semibold text-slate-600">Milestone Name</th>
                          <th className="text-left p-3 font-semibold text-slate-600">Start Date</th>
                          <th className="text-left p-3 font-semibold text-slate-600">End Date</th>
                          <th className="text-left p-3 font-semibold text-slate-600">Status</th>
                          <th className="text-left p-3 font-semibold text-slate-600">Notes</th>
                          <th className="text-right p-3 font-semibold text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.milestones.map(m => (
                          <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`milestone-row-${m.id}`}>
                            <td className="p-3">{m.name}</td>
                            <td className="p-3 text-slate-600">{formatDate(m.startDate)}</td>
                            <td className="p-3 text-slate-600">{formatDate(m.endDate)}</td>
                            <td className="p-3">{getStatusBadge(m.status)}</td>
                            <td className="p-3 text-slate-500 text-xs max-w-[200px] truncate">{m.notes || "—"}</td>
                            <td className="p-3 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setEditingMilestone(m)}
                                data-testid={`button-edit-${m.id}`}
                              >
                                <Edit2 className="w-4 h-4 text-slate-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => {
                                  if (confirm("Delete this milestone?")) {
                                    deleteMutation.mutate(m.id);
                                  }
                                }}
                                data-testid={`button-delete-${m.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Initiative</Label>
              <Select value={selectedInitiativeId} onValueChange={setSelectedInitiativeId}>
                <SelectTrigger data-testid="select-initiative">
                  <SelectValue placeholder="Select an initiative" />
                </SelectTrigger>
                <SelectContent>
                  {initiatives.map(init => (
                    <SelectItem key={init.id} value={init.id}>{init.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Milestone Name</Label>
              <Input 
                value={newMilestone.name}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter milestone name"
                data-testid="input-milestone-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date"
                  value={newMilestone.startDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, startDate: e.target.value }))}
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date"
                  value={newMilestone.endDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, endDate: e.target.value }))}
                  data-testid="input-end-date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={newMilestone.status} 
                onValueChange={(v: Milestone['status']) => setNewMilestone(prev => ({ ...prev, status: v }))}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={newMilestone.notes}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                data-testid="textarea-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddMilestone}
              disabled={createMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-create-milestone"
            >
              {createMutation.isPending ? "Creating..." : "Create Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Milestone Name</Label>
                <Input 
                  value={editingMilestone.name}
                  onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, name: e.target.value } : null)}
                  data-testid="input-edit-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date"
                    value={editingMilestone.startDate || ""}
                    onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                    data-testid="input-edit-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={editingMilestone.endDate || ""}
                    onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                    data-testid="input-edit-end-date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editingMilestone.status} 
                  onValueChange={(v: Milestone['status']) => setEditingMilestone(prev => prev ? { ...prev, status: v } : null)}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={editingMilestone.notes || ""}
                  onChange={(e) => setEditingMilestone(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  data-testid="textarea-edit-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMilestone(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdateMilestone}
              disabled={updateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-save-milestone"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
