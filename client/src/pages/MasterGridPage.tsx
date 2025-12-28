import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Shield, Save, Search, ChevronDown, ChevronUp, Check, X, RefreshCw, Database, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { initiatives as localInitiatives, formatCurrency, getValueStreams } from "@/lib/initiatives";
import { AppLayout } from "@/components/layout/AppLayout";

interface Initiative {
  id: string;
  name: string;
  valueStream: string;
  lGate: string;
  priorityCategory: string;
  priorityRank: number;
  budgetedCost: number;
  targetedBenefit: number;
  costCenter: string;
  milestones?: string;
}

const LGATE_OPTIONS = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'Rejected'];
const PRIORITY_OPTIONS = ['Shipped', 'Now', 'Next', 'Later', 'New', 'Kill', 'Hold for clarification'];

interface EditableCell {
  rowId: string;
  field: keyof Initiative;
}

export default function MasterGridPage() {
  const { user, role, isControlTower } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValueStream, setFilterValueStream] = useState<string>("all");
  const [filterLGate, setFilterLGate] = useState<string>("all");
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, Partial<Initiative>>>({});
  const [sortField, setSortField] = useState<keyof Initiative>("priorityRank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Initiative | null>(null);
  const [newInitiative, setNewInitiative] = useState({
    id: '',
    name: '',
    valueStream: 'Patient Access',
    lGate: 'L0',
    priorityCategory: 'New',
    priorityRank: 0,
    budgetedCost: 0,
    targetedBenefit: 0,
    costCenter: '',
  });

  const { data: dbInitiatives = [], isLoading, refetch } = useQuery<Initiative[]>({
    queryKey: ["/api/initiatives"],
    queryFn: async () => {
      const res = await fetch("/api/initiatives");
      if (!res.ok) throw new Error("Failed to fetch initiatives");
      return res.json();
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const seedData = localInitiatives.map(init => ({
        id: init.id,
        name: init.name,
        valueStream: init.valueStream,
        lGate: init.lGate,
        priorityCategory: init.priorityCategory,
        priorityRank: init.priorityRank,
        budgetedCost: init.budgetedCost,
        targetedBenefit: init.targetedBenefit,
        costCenter: init.costCenter,
        milestones: JSON.stringify(init.milestones),
      }));
      
      const res = await fetch("/api/initiatives/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initiatives: seedData }),
      });
      if (!res.ok) throw new Error("Failed to seed initiatives");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
      toast({
        title: "Database Seeded",
        description: `${localInitiatives.length} initiatives have been loaded into the database.`,
      });
    },
    onError: () => {
      toast({
        title: "Seed Failed",
        description: "Failed to seed initiatives to database.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Initiative> }) => {
      const res = await fetch(`/api/initiatives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update initiative");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<Initiative> }[]) => {
      const res = await fetch("/api/initiatives/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error("Failed to bulk update initiatives");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
      setPendingChanges({});
      toast({
        title: "Changes Saved",
        description: "All initiative changes have been saved to the database.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save changes to database.",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newInitiative) => {
      const res = await fetch("/api/initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create initiative");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
      setShowAddDialog(false);
      setNewInitiative({
        id: '',
        name: '',
        valueStream: 'Patient Access',
        lGate: 'L0',
        priorityCategory: 'New',
        priorityRank: 0,
        budgetedCost: 0,
        targetedBenefit: 0,
        costCenter: '',
      });
      toast({
        title: "Initiative Created",
        description: "New initiative has been added to the database.",
      });
    },
    onError: () => {
      toast({
        title: "Create Failed",
        description: "Failed to create initiative.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/initiatives/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete initiative");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/initiatives"] });
      setDeleteTarget(null);
      toast({
        title: "Initiative Deleted",
        description: "Initiative and associated data have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete initiative.",
        variant: "destructive",
      });
    },
  });

  const effectiveInitiatives = useMemo(() => {
    if (dbInitiatives.length > 0) {
      return dbInitiatives.map(init => ({
        ...init,
        ...pendingChanges[init.id],
      }));
    }
    return [];
  }, [dbInitiatives, pendingChanges]);

  if (!isControlTower) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-700 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-4">Only Control Tower administrators can access the Master Grid.</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const valueStreams = getValueStreams();

  const filteredInitiatives = useMemo(() => {
    return effectiveInitiatives
      .filter(i => {
        const matchesSearch = searchTerm === "" || 
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesValueStream = filterValueStream === "all" || i.valueStream === filterValueStream;
        const matchesLGate = filterLGate === "all" || i.lGate === filterLGate;
        return matchesSearch && matchesValueStream && matchesLGate;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
  }, [effectiveInitiatives, searchTerm, filterValueStream, filterLGate, sortField, sortDir]);

  const startEditing = (rowId: string, field: keyof Initiative, currentValue: string | number) => {
    setEditingCell({ rowId, field });
    setEditValue(String(currentValue));
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const field = editingCell.field;
    let newValue: string | number = editValue;
    
    if (field === 'budgetedCost' || field === 'targetedBenefit' || field === 'priorityRank') {
      newValue = parseFloat(editValue) || 0;
    }
    
    setPendingChanges(prev => ({
      ...prev,
      [editingCell.rowId]: {
        ...prev[editingCell.rowId],
        [field]: newValue,
      },
    }));
    
    setEditingCell(null);
    setEditValue("");
  };

  const updateSelectField = (rowId: string, field: keyof Initiative, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));
  };

  const handleSaveAll = () => {
    const updates = Object.entries(pendingChanges).map(([id, data]) => ({ id, data }));
    if (updates.length > 0) {
      bulkUpdateMutation.mutate(updates);
    }
  };

  const handleSort = (field: keyof Initiative) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof Initiative }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  const EditableText = ({ rowId, field, value }: { rowId: string; field: keyof Initiative; value: string | number }) => {
    const isEditing = editingCell?.rowId === rowId && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 text-xs w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEditing();
            }}
          />
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveEdit}>
            <Check className="w-3 h-3 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditing}>
            <X className="w-3 h-3 text-red-600" />
          </Button>
        </div>
      );
    }
    
    const pendingValue = pendingChanges[rowId]?.[field];
    const displayValue = pendingValue !== undefined ? pendingValue : value;
    const isModified = pendingValue !== undefined;
    
    return (
      <div 
        className={`cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded text-xs ${isModified ? 'bg-amber-50 border border-amber-200' : ''}`}
        onClick={() => startEditing(rowId, field, displayValue as string | number)}
        data-testid={`cell-${field}-${rowId}`}
      >
        {field === 'budgetedCost' || field === 'targetedBenefit' 
          ? formatCurrency(displayValue as number) 
          : displayValue}
      </div>
    );
  };

  const headerActions = (
    <>
      {hasChanges && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {Object.keys(pendingChanges).length} Unsaved Changes
        </Badge>
      )}
      <Button 
        onClick={handleSaveAll} 
        disabled={!hasChanges || bulkUpdateMutation.isPending}
        className="bg-purple-600 hover:bg-purple-700"
        data-testid="button-save-all"
      >
        <Save className="w-4 h-4 mr-2" />
        {bulkUpdateMutation.isPending ? "Saving..." : "Save All Changes"}
      </Button>
    </>
  );

  return (
    <AppLayout title="Master Grid" headerActions={headerActions}>
      <div className="p-4 bg-slate-50 border-b flex items-center gap-4 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search"
          />
        </div>
        
        <Select value={filterValueStream} onValueChange={setFilterValueStream}>
          <SelectTrigger className="w-48 bg-white" data-testid="select-value-stream">
            <SelectValue placeholder="All Value Streams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Value Streams</SelectItem>
            {valueStreams.map(vs => (
              <SelectItem key={vs} value={vs}>{vs}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterLGate} onValueChange={setFilterLGate}>
          <SelectTrigger className="w-32 bg-white" data-testid="select-lgate">
            <SelectValue placeholder="All L-Gates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All L-Gates</SelectItem>
            {LGATE_OPTIONS.map(gate => (
              <SelectItem key={gate} value={gate}>{gate}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-3">
          {dbInitiatives.length === 0 && !isLoading && (
            <Button 
              variant="outline" 
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              data-testid="button-seed"
            >
              <Database className="w-4 h-4 mr-2" />
              {seedMutation.isPending ? "Loading..." : "Load Initiatives to Database"}
            </Button>
          )}
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-add-initiative"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Initiative
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-500">
            {filteredInitiatives.length} of {effectiveInitiatives.length} initiatives
          </span>
        </div>
      </div>

      {!isLoading && dbInitiatives.length === 0 && (
        <div className="p-12 text-center">
          <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Initiatives in Database</h3>
          <p className="text-slate-500 mb-6">Click "Load Initiatives to Database" to import the {localInitiatives.length} initiatives from the Excel data.</p>
          <Button 
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Database className="w-4 h-4 mr-2" />
            {seedMutation.isPending ? "Loading..." : "Load Initiatives"}
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="p-12 text-center">
          <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin" />
          <p className="text-slate-500">Loading initiatives...</p>
        </div>
      )}

      {dbInitiatives.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b sticky top-16">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('id')}>
                  ID <SortIcon field="id" />
                </th>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200 min-w-[250px]" onClick={() => handleSort('name')}>
                  Name <SortIcon field="name" />
                </th>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('valueStream')}>
                  Value Stream <SortIcon field="valueStream" />
                </th>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('lGate')}>
                  L-Gate <SortIcon field="lGate" />
                </th>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('priorityCategory')}>
                  Priority <SortIcon field="priorityCategory" />
                </th>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('priorityRank')}>
                  Rank <SortIcon field="priorityRank" />
                </th>
                <th className="text-right p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('budgetedCost')}>
                  Budget <SortIcon field="budgetedCost" />
                </th>
                <th className="text-right p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('targetedBenefit')}>
                  Benefit <SortIcon field="targetedBenefit" />
                </th>
                <th className="text-left p-3 font-semibold text-slate-600 cursor-pointer hover:bg-slate-200" onClick={() => handleSort('costCenter')}>
                  Cost Center <SortIcon field="costCenter" />
                </th>
                <th className="text-center p-3 font-semibold text-slate-600 w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInitiatives.map((init, idx) => (
                <tr 
                  key={init.id} 
                  className={`border-b hover:bg-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  data-testid={`row-initiative-${init.id}`}
                >
                  <td className="p-3 font-mono text-xs text-slate-500">{init.id}</td>
                  <td className="p-3">
                    <EditableText rowId={init.id} field="name" value={init.name} />
                  </td>
                  <td className="p-3">
                    <Select 
                      value={pendingChanges[init.id]?.valueStream || init.valueStream}
                      onValueChange={(v) => updateSelectField(init.id, 'valueStream', v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {valueStreams.map(vs => (
                          <SelectItem key={vs} value={vs}>{vs}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Select 
                      value={pendingChanges[init.id]?.lGate || init.lGate}
                      onValueChange={(v) => updateSelectField(init.id, 'lGate', v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LGATE_OPTIONS.map(gate => (
                          <SelectItem key={gate} value={gate}>{gate}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Select 
                      value={pendingChanges[init.id]?.priorityCategory || init.priorityCategory}
                      onValueChange={(v) => updateSelectField(init.id, 'priorityCategory', v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <EditableText rowId={init.id} field="priorityRank" value={init.priorityRank} />
                  </td>
                  <td className="p-3 text-right">
                    <EditableText rowId={init.id} field="budgetedCost" value={init.budgetedCost} />
                  </td>
                  <td className="p-3 text-right">
                    <EditableText rowId={init.id} field="targetedBenefit" value={init.targetedBenefit} />
                  </td>
                  <td className="p-3">
                    <EditableText rowId={init.id} field="costCenter" value={init.costCenter} />
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteTarget(init)}
                      data-testid={`button-delete-${init.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Initiative</DialogTitle>
            <DialogDescription>
              Create a new initiative. Fill in the required fields below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-id" className="text-right">ID</Label>
              <Input
                id="init-id"
                value={newInitiative.id}
                onChange={(e) => setNewInitiative(prev => ({ ...prev, id: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., ACA-101"
                data-testid="input-new-id"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-name" className="text-right">Name</Label>
              <Input
                id="init-name"
                value={newInitiative.name}
                onChange={(e) => setNewInitiative(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Initiative name"
                data-testid="input-new-name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-vs" className="text-right">Value Stream</Label>
              <Select
                value={newInitiative.valueStream}
                onValueChange={(v) => setNewInitiative(prev => ({ ...prev, valueStream: v }))}
              >
                <SelectTrigger className="col-span-3" data-testid="select-new-valuestream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {valueStreams.map(vs => (
                    <SelectItem key={vs} value={vs}>{vs}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-lgate" className="text-right">L-Gate</Label>
              <Select
                value={newInitiative.lGate}
                onValueChange={(v) => setNewInitiative(prev => ({ ...prev, lGate: v }))}
              >
                <SelectTrigger className="col-span-3" data-testid="select-new-lgate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LGATE_OPTIONS.map(gate => (
                    <SelectItem key={gate} value={gate}>{gate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-priority" className="text-right">Priority</Label>
              <Select
                value={newInitiative.priorityCategory}
                onValueChange={(v) => setNewInitiative(prev => ({ ...prev, priorityCategory: v }))}
              >
                <SelectTrigger className="col-span-3" data-testid="select-new-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-cost" className="text-right">Budget</Label>
              <Input
                id="init-cost"
                type="number"
                value={newInitiative.budgetedCost}
                onChange={(e) => setNewInitiative(prev => ({ ...prev, budgetedCost: parseFloat(e.target.value) || 0 }))}
                className="col-span-3"
                placeholder="0"
                data-testid="input-new-budget"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-benefit" className="text-right">Benefit</Label>
              <Input
                id="init-benefit"
                type="number"
                value={newInitiative.targetedBenefit}
                onChange={(e) => setNewInitiative(prev => ({ ...prev, targetedBenefit: parseFloat(e.target.value) || 0 }))}
                className="col-span-3"
                placeholder="0"
                data-testid="input-new-benefit"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="init-costcenter" className="text-right">Cost Center</Label>
              <Input
                id="init-costcenter"
                value={newInitiative.costCenter}
                onChange={(e) => setNewInitiative(prev => ({ ...prev, costCenter: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., IT Operations"
                data-testid="input-new-costcenter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => createMutation.mutate(newInitiative)}
              disabled={!newInitiative.id || !newInitiative.name || createMutation.isPending}
              data-testid="button-confirm-add"
            >
              {createMutation.isPending ? "Creating..." : "Create Initiative"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Initiative?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" ({deleteTarget?.id}) and all associated capabilities, milestones, and gate forms. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
