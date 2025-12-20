import { useState, useMemo } from "react";
import { groupedInitiatives, formatCurrency, getValueStreams, type GroupedInitiative } from "@/lib/initiatives";
import { Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AppLayout } from "@/components/layout/AppLayout";

export default function ProjectList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [valueStreamFilter, setValueStreamFilter] = useState<string>('all');
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set(getValueStreams()));

  const valueStreams = useMemo(() => getValueStreams(), []);

  const filteredInitiatives = useMemo(() => {
    return groupedInitiatives.filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.valueStream.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.ids.some(id => id.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesValueStream = valueStreamFilter === 'all' || i.valueStream === valueStreamFilter;
      return matchesSearch && matchesValueStream;
    });
  }, [searchTerm, valueStreamFilter]);

  const groupedByValueStream = useMemo(() => {
    const groups: Record<string, GroupedInitiative[]> = {};
    filteredInitiatives.forEach(init => {
      if (!groups[init.valueStream]) {
        groups[init.valueStream] = [];
      }
      groups[init.valueStream].push(init);
    });
    return groups;
  }, [filteredInitiatives]);

  const stats = useMemo(() => ({
    total: groupedInitiatives.length,
    totalBudget: groupedInitiatives.reduce((sum, i) => sum + i.budgetedCost, 0),
    totalBenefit: groupedInitiatives.reduce((sum, i) => sum + i.targetedBenefit, 0),
    valueStreams: valueStreams.length
  }), [valueStreams]);

  const toggleStream = (stream: string) => {
    const newExpanded = new Set(expandedStreams);
    if (newExpanded.has(stream)) {
      newExpanded.delete(stream);
    } else {
      newExpanded.add(stream);
    }
    setExpandedStreams(newExpanded);
  };

  const getPriorityColor = (cat: string) => {
    switch (cat) {
      case 'Shipped': return 'bg-green-100 text-green-700';
      case 'Now': return 'bg-blue-100 text-blue-700';
      case 'Next': return 'bg-amber-100 text-amber-700';
      case 'Later': return 'bg-slate-100 text-slate-600';
      case 'New': return 'bg-purple-100 text-purple-700';
      case 'Kill': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const headerActions = (
    <>
      <Select value={valueStreamFilter} onValueChange={setValueStreamFilter}>
        <SelectTrigger className="w-48" data-testid="select-value-stream">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Value Stream" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Value Streams</SelectItem>
          {valueStreams.map(vs => (
            <SelectItem key={vs} value={vs}>{vs}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search initiatives..." 
          className="pl-9 bg-slate-50 border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </>
  );

  return (
    <AppLayout title="Project List" headerActions={headerActions}>
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Initiatives</p>
            <p className="text-2xl font-bold text-foreground font-mono">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Value Streams</p>
            <p className="text-2xl font-bold text-foreground font-mono">{stats.valueStreams}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Budget</p>
            <p className="text-2xl font-bold text-foreground font-mono">{formatCurrency(stats.totalBudget)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Targeted Benefit</p>
            <p className="text-2xl font-bold text-status-green font-mono">{formatCurrency(stats.totalBenefit)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedByValueStream)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([valueStream, inits]) => (
              <Card key={valueStream} className="overflow-hidden">
                <Collapsible open={expandedStreams.has(valueStream)} onOpenChange={() => toggleStream(valueStream)}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 bg-slate-50 border-b flex items-center justify-between cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3">
                        {expandedStreams.has(valueStream) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold text-foreground">{valueStream}</h3>
                        <Badge variant="outline">{inits.length} initiatives</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Budget: {formatCurrency(inits.reduce((s, i) => s + i.budgetedCost, 0))}</span>
                        <span className="text-green-600">Benefit: {formatCurrency(inits.reduce((s, i) => s + i.targetedBenefit, 0))}</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="divide-y">
                      {inits.map(init => (
                        <Link key={init.ids[0]} href={`/project/${init.ids[0]}`}>
                          <div className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between" data-testid={`row-initiative-${init.ids[0]}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500" title="Cost: Green" />
                                  <div className="w-2 h-2 rounded-full bg-green-500" title="Benefit: Green" />
                                  <div className="w-2 h-2 rounded-full bg-green-500" title="Timeline: Green" />
                                  <div className="w-2 h-2 rounded-full bg-green-500" title="Scope: Green" />
                                </div>
                                <span className="font-medium text-sm">{init.name}</span>
                                <Badge className={getPriorityColor(init.priorityCategory)} variant="secondary">
                                  {init.priorityCategory}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{init.lGate}</Badge>
                                {init.milestones.length > 0 && (
                                  <span className="text-xs text-purple-600">{init.milestones.length} ms</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 ml-10">
                                {init.costCenter || 'No cost center'}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">Cost</div>
                                <div className="font-mono">{init.budgetedCost > 0 ? formatCurrency(init.budgetedCost) : '-'}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">Benefit</div>
                                <div className="font-mono text-green-600">{init.targetedBenefit > 0 ? formatCurrency(init.targetedBenefit) : '-'}</div>
                              </div>
                              <div className="flex flex-col items-center gap-1 border-l pl-4">
                                <div className="flex gap-1">
                                  <div className="w-3 h-3 rounded-full bg-green-500" title="Cost" />
                                  <div className="w-3 h-3 rounded-full bg-green-500" title="Benefit" />
                                  <div className="w-3 h-3 rounded-full bg-green-500" title="Timeline" />
                                  <div className="w-3 h-3 rounded-full bg-green-500" title="Scope" />
                                </div>
                                <div className="text-[9px] text-muted-foreground flex gap-1">
                                  <span>C</span><span>B</span><span>T</span><span>S</span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
        </div>

      </div>
    </AppLayout>
  );
}
