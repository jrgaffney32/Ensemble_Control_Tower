import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, TrendingUp, ChevronDown, ChevronRight, Search, Filter, Building2 } from "lucide-react";
import type { InitiativeRecord, CapabilityRecord } from "@shared/schema";

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export default function FinancialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [valueStreamFilter, setValueStreamFilter] = useState<string>("all");
  const [lGateFilter, setLGateFilter] = useState<string>("all");
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());

  const { data: initiatives = [] } = useQuery<InitiativeRecord[]>({
    queryKey: ["/api/initiatives"],
  });

  const { data: capabilities = [] } = useQuery<CapabilityRecord[]>({
    queryKey: ["/api/capabilities"],
  });

  const valueStreams = useMemo(() => {
    const streams = new Set(initiatives.map(i => i.valueStream));
    return Array.from(streams).sort();
  }, [initiatives]);

  const lGates = useMemo(() => {
    const gates = new Set(initiatives.map(i => i.lGate));
    return Array.from(gates).sort();
  }, [initiatives]);

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter(initiative => {
      const matchesSearch = searchTerm === "" || 
        initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesValueStream = valueStreamFilter === "all" || initiative.valueStream === valueStreamFilter;
      const matchesLGate = lGateFilter === "all" || initiative.lGate === lGateFilter;
      return matchesSearch && matchesValueStream && matchesLGate;
    });
  }, [initiatives, searchTerm, valueStreamFilter, lGateFilter]);

  const capabilitiesByInitiative = useMemo(() => {
    const map: Record<string, CapabilityRecord[]> = {};
    for (const cap of capabilities) {
      if (!map[cap.initiativeId]) {
        map[cap.initiativeId] = [];
      }
      map[cap.initiativeId].push(cap);
    }
    return map;
  }, [capabilities]);

  const summaryStats = useMemo(() => {
    const totalBudgetedCost = filteredInitiatives.reduce((sum, i) => sum + (i.budgetedCost || 0), 0);
    const totalTargetedBenefit = filteredInitiatives.reduce((sum, i) => sum + (i.targetedBenefit || 0), 0);
    const totalCapabilities = filteredInitiatives.reduce((sum, i) => sum + (capabilitiesByInitiative[i.id]?.length || 0), 0);
    const roi = totalBudgetedCost > 0 ? ((totalTargetedBenefit - totalBudgetedCost) / totalBudgetedCost * 100) : 0;
    
    return { totalBudgetedCost, totalTargetedBenefit, totalCapabilities, roi };
  }, [filteredInitiatives, capabilitiesByInitiative]);

  const byValueStream = useMemo(() => {
    const map: Record<string, { cost: number; benefit: number; count: number }> = {};
    for (const initiative of filteredInitiatives) {
      if (!map[initiative.valueStream]) {
        map[initiative.valueStream] = { cost: 0, benefit: 0, count: 0 };
      }
      map[initiative.valueStream].cost += initiative.budgetedCost || 0;
      map[initiative.valueStream].benefit += initiative.targetedBenefit || 0;
      map[initiative.valueStream].count++;
    }
    return map;
  }, [filteredInitiatives]);

  const toggleExpand = (id: string) => {
    setExpandedInitiatives(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedInitiatives(new Set(filteredInitiatives.map(i => i.id)));
  };

  const collapseAll = () => {
    setExpandedInitiatives(new Set());
  };

  return (
    <AppLayout title="Cost & Benefit Financials" subtitle="Consolidated view of all initiative and capability financials">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Budgeted Cost</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="text-total-cost">
                    {formatCurrency(summaryStats.totalBudgetedCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Targeted Benefit</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="text-total-benefit">
                    {formatCurrency(summaryStats.totalTargetedBenefit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Initiatives</p>
                  <p className="text-2xl font-bold" data-testid="text-initiative-count">
                    {filteredInitiatives.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Projected ROI</p>
                  <p className={`text-2xl font-bold ${summaryStats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-roi">
                    {summaryStats.roi.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">By Value Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(byValueStream).map(([stream, data]) => (
                <div key={stream} className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-xs font-medium text-slate-600 mb-2">{stream}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Cost:</span>
                      <span className="font-medium text-red-600">{formatCurrency(data.cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Benefit:</span>
                      <span className="font-medium text-green-600">{formatCurrency(data.benefit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Count:</span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">All Initiatives & Capabilities</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} data-testid="button-expand-all">
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} data-testid="button-collapse-all">
                Collapse All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search initiatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={valueStreamFilter} onValueChange={setValueStreamFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-value-stream">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Value Stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Value Streams</SelectItem>
                  {valueStreams.map(stream => (
                    <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={lGateFilter} onValueChange={setLGateFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-lgate">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="L-Gate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All L-Gates</SelectItem>
                  {lGates.map(gate => (
                    <SelectItem key={gate} value={gate}>{gate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Initiative / Capability</TableHead>
                    <TableHead>Value Stream</TableHead>
                    <TableHead>L-Gate</TableHead>
                    <TableHead className="text-right">Budgeted Cost</TableHead>
                    <TableHead className="text-right">Targeted Benefit</TableHead>
                    <TableHead className="text-right">Net Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInitiatives.map(initiative => {
                    const caps = capabilitiesByInitiative[initiative.id] || [];
                    const isExpanded = expandedInitiatives.has(initiative.id);
                    const netValue = (initiative.targetedBenefit || 0) - (initiative.budgetedCost || 0);
                    
                    return (
                      <Collapsible key={initiative.id} open={isExpanded} asChild>
                        <>
                          <TableRow className="bg-white hover:bg-slate-50" data-testid={`row-initiative-${initiative.id}`}>
                            <TableCell>
                              <CollapsibleTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => toggleExpand(initiative.id)}
                                  disabled={caps.length === 0}
                                  data-testid={`button-expand-${initiative.id}`}
                                >
                                  {caps.length > 0 ? (
                                    isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                                  ) : null}
                                </Button>
                              </CollapsibleTrigger>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{initiative.name}</span>
                                {caps.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {caps.length} capability{caps.length !== 1 ? 'ies' : ''}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{initiative.id}</p>
                            </TableCell>
                            <TableCell>{initiative.valueStream}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{initiative.lGate}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(initiative.budgetedCost || 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(initiative.targetedBenefit || 0)}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(netValue)}
                            </TableCell>
                          </TableRow>
                          <CollapsibleContent asChild>
                            <>
                              {caps.map(cap => (
                                <TableRow key={cap.id} className="bg-slate-50/50" data-testid={`row-capability-${cap.id}`}>
                                  <TableCell></TableCell>
                                  <TableCell className="pl-10">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                                      <span className="text-sm">{cap.name}</span>
                                      <Badge 
                                        variant={cap.approvalStatus === 'approved' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {cap.approvalStatus}
                                      </Badge>
                                    </div>
                                    {cap.description && (
                                      <p className="text-xs text-muted-foreground ml-4 mt-1">{cap.description}</p>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">-</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">-</TableCell>
                                  <TableCell className="text-right text-sm text-muted-foreground">
                                    {cap.estimatedEffort ? `${cap.estimatedEffort}h effort` : '-'}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">-</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">-</TableCell>
                                </TableRow>
                              ))}
                            </>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
