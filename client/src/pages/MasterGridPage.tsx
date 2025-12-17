import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PieChart, Calendar, FileText, AlertCircle, ListOrdered, TrendingUp, Building2, Shield, Users, LogOut, Home, Save, Search, Filter, Download, ChevronDown, ChevronUp, Grid3X3, Check, X, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { initiatives as localInitiatives, formatCurrency, getValueStreams } from "@/lib/initiatives";

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
  const [, navigate] = useLocation();
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

  const getRoleBadge = () => {
    return <Badge className="bg-purple-600 text-xs">Control Tower</Badge>;
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

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2a3b] text-slate-300 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/">
            <div className="flex flex-col gap-2 text-white mb-8 cursor-pointer hover:opacity-80">
              <img src="/attached_assets/ensemble-logo-singleline-standard-1738760348662_1765935308200.jpg" alt="Ensemble" className="h-5" />
              <span className="text-[10px] font-medium opacity-70 tracking-widest uppercase">Control Tower</span>
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
            <Link href="/cost-centers">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <Building2 className="w-4 h-4 mr-3" />
                Cost Center Breakout
              </Button>
            </Link>
            <Link href="/pod-velocity">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <TrendingUp className="w-4 h-4 mr-3" />
                Pod Velocity & Quality
              </Button>
            </Link>
            <Link href="/admin/master-grid">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
                <Grid3X3 className="w-4 h-4 mr-3" />
                Master Grid
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <Shield className="w-4 h-4 mr-3" />
                Admin Panel
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <Users className="w-4 h-4 mr-3" />
                User Management
              </Button>
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </p>
              {getRoleBadge()}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10" 
            data-testid="button-logout"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/gate";
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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
            <Grid3X3 className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold font-heading text-foreground">Master Initiative Grid</h2>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Control Tower Only</Badge>
          </div>
          
          <div className="flex items-center gap-3">
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
          </div>
        </header>

        {/* Filters */}
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

        {/* Empty State */}
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

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin" />
            <p className="text-slate-500">Loading initiatives...</p>
          </div>
        )}

        {/* Data Grid */}
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
                </tr>
              </thead>
              <tbody>
                {filteredInitiatives.map((init, idx) => (
                  <tr 
                    key={init.id} 
                    className={`border-b hover:bg-blue-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${pendingChanges[init.id] ? 'bg-amber-50/30' : ''}`}
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
                        <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-slate-100" data-testid={`select-vs-${init.id}`}>
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
                        <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-slate-100" data-testid={`select-lgate-${init.id}`}>
                          <Badge variant="outline" className={`text-xs ${
                            (pendingChanges[init.id]?.lGate || init.lGate) === 'L6' ? 'bg-green-50 text-green-700 border-green-200' :
                            (pendingChanges[init.id]?.lGate || init.lGate) === 'L0' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {pendingChanges[init.id]?.lGate || init.lGate}
                          </Badge>
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
                        <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-slate-100" data-testid={`select-priority-${init.id}`}>
                          <Badge className={`text-xs ${
                            (pendingChanges[init.id]?.priorityCategory || init.priorityCategory) === 'Shipped' ? 'bg-green-600' :
                            (pendingChanges[init.id]?.priorityCategory || init.priorityCategory) === 'Now' ? 'bg-blue-600' :
                            (pendingChanges[init.id]?.priorityCategory || init.priorityCategory) === 'Next' ? 'bg-purple-600' :
                            (pendingChanges[init.id]?.priorityCategory || init.priorityCategory) === 'Later' ? 'bg-slate-500' :
                            (pendingChanges[init.id]?.priorityCategory || init.priorityCategory) === 'Kill' ? 'bg-red-600' :
                            'bg-amber-500'
                          }`}>
                            {pendingChanges[init.id]?.priorityCategory || init.priorityCategory}
                          </Badge>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {dbInitiatives.length > 0 && filteredInitiatives.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No initiatives match your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
