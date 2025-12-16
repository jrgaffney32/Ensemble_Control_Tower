import { useState, useMemo } from "react";
import { LayoutDashboard, PieChart, Calendar, Settings, FileText, AlertCircle, ArrowUpDown, Flag, Trash2, Send, X, ListOrdered, ChevronDown, ChevronRight, Home, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { groupedInitiatives, getValueStreams, formatCurrency, type GroupedInitiative } from "@/lib/initiatives";
import { useToast } from "@/hooks/use-toast";

type PriorityCategory = 'Shipped' | 'Now' | 'Next' | 'Later' | 'New' | 'Kill';

export default function ValueStreamPriorities() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'reprioritize' | 'kill'>('reprioritize');
  const [selectedItem, setSelectedItem] = useState<GroupedInitiative | null>(null);
  const [targetCategory, setTargetCategory] = useState<'Next' | 'Later'>('Next');
  const [targetRank, setTargetRank] = useState('1');
  const [justification, setJustification] = useState('');
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set(getValueStreams()));
  const { toast } = useToast();

  const valueStreams = useMemo(() => getValueStreams(), []);

  const groupedByValueStream = useMemo(() => {
    const groups: Record<string, GroupedInitiative[]> = {};
    groupedInitiatives.forEach(init => {
      if (!groups[init.valueStream]) {
        groups[init.valueStream] = [];
      }
      groups[init.valueStream].push(init);
    });
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const priorityOrder = { 'Shipped': 0, 'Now': 1, 'Next': 2, 'Later': 3, 'New': 4, 'Kill': 5 };
        const aOrder = priorityOrder[a.priorityCategory as keyof typeof priorityOrder] ?? 4;
        const bOrder = priorityOrder[b.priorityCategory as keyof typeof priorityOrder] ?? 4;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.priorityRank - b.priorityRank;
      });
    });
    return groups;
  }, []);

  const toggleStream = (stream: string) => {
    const newExpanded = new Set(expandedStreams);
    if (newExpanded.has(stream)) {
      newExpanded.delete(stream);
    } else {
      newExpanded.add(stream);
    }
    setExpandedStreams(newExpanded);
  };

  const openReprioritizeDialog = (item: GroupedInitiative) => {
    setSelectedItem(item);
    setDialogType('reprioritize');
    setTargetCategory(item.priorityCategory === 'Later' ? 'Next' : 'Later');
    setTargetRank('1');
    setJustification('');
    setDialogOpen(true);
  };

  const openKillDialog = (item: GroupedInitiative) => {
    setSelectedItem(item);
    setDialogType('kill');
    setJustification('');
    setDialogOpen(true);
  };

  const submitRequest = () => {
    if (!justification.trim()) {
      toast({
        title: "Justification Required",
        description: "Please provide a justification for your request.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: dialogType === 'kill' ? "Kill Request Submitted" : "Reprioritization Request Submitted",
      description: `Your request for "${selectedItem?.name}" has been submitted for approval.`
    });
    setDialogOpen(false);
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

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center gap-3 text-white mb-8 cursor-pointer hover:opacity-80">
              <img src="/attached_assets/ensemblehp_logo2_1765915775273.jpeg" alt="Ensemble" className="w-8 h-8 rounded-lg" />
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
            <Link href="/roadmap">
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <Calendar className="w-4 h-4 mr-3" />
                Roadmap
              </Button>
            </Link>
            <Link href="/priorities">
              <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white">
                <ListOrdered className="w-4 h-4 mr-3" />
                Value Stream Priorities
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
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold font-heading text-foreground">Value Stream Priorities</h2>
            <Badge variant="outline" className="text-xs">Strategic Funding Lane</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-slate-200 relative">
              <Bell className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Summary */}
          <div className="grid grid-cols-6 gap-4">
            {(['Shipped', 'Now', 'Next', 'Later', 'New', 'Kill'] as PriorityCategory[]).map(cat => {
              const count = groupedInitiatives.filter(i => i.priorityCategory === cat).length;
              return (
                <div key={cat} className="bg-white p-3 rounded-xl border shadow-sm text-center">
                  <Badge className={getPriorityColor(cat)}>{cat}</Badge>
                  <p className="text-2xl font-bold font-mono mt-2">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Value Stream Groups */}
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
                        <div className="flex items-center gap-3 text-sm">
                          {(['Now', 'Next', 'Later'] as PriorityCategory[]).map(cat => {
                            const count = inits.filter(i => i.priorityCategory === cat).length;
                            if (count === 0) return null;
                            return (
                              <Badge key={cat} className={getPriorityColor(cat)}>{cat}: {count}</Badge>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="divide-y">
                        {inits.map((init, idx) => (
                          <div key={init.ids[0]} className="p-4 hover:bg-slate-50 flex items-center justify-between" data-testid={`card-priority-${init.ids[0]}`}>
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-8 text-center">
                                <span className="text-xs font-bold text-muted-foreground">
                                  {init.priorityRank !== 999 ? `#${init.priorityRank}` : '-'}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Cost: Green" />
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Benefit: Green" />
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Timeline: Green" />
                                <div className="w-2 h-2 rounded-full bg-green-500" title="Scope: Green" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link href={`/project/${init.ids[0]}`}>
                                  <h4 className="font-medium text-sm hover:text-blue-600 cursor-pointer">{init.name}</h4>
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                  {init.costCenter || 'No cost center'}
                                  {init.milestones.length > 0 && ` • ${init.milestones.length} ms`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={getPriorityColor(init.priorityCategory)}>{init.priorityCategory}</Badge>
                              <Badge variant="outline">{init.lGate}</Badge>
                              <div className="text-right w-24">
                                <div className="text-xs text-muted-foreground">Cost</div>
                                <span className="text-sm font-mono">
                                  {init.budgetedCost > 0 ? formatCurrency(init.budgetedCost) : '-'}
                                </span>
                              </div>
                              <div className="text-right w-24">
                                <div className="text-xs text-muted-foreground">Benefit</div>
                                <span className="text-sm font-mono text-green-600">
                                  {init.targetedBenefit > 0 ? formatCurrency(init.targetedBenefit) : '-'}
                                </span>
                              </div>
                              {init.priorityCategory !== 'Shipped' && init.priorityCategory !== 'Kill' && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2"
                                    onClick={() => openReprioritizeDialog(init)}
                                    data-testid={`button-reprioritize-${init.ids[0]}`}
                                  >
                                    <ArrowUpDown className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2 text-red-600 hover:bg-red-50"
                                    onClick={() => openKillDialog(init)}
                                    data-testid={`button-kill-${init.ids[0]}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
          </div>
        </div>
      </main>

      {/* Reprioritize/Kill Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'kill' ? 'Request to Kill' : 'Request to Reprioritize'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'kill' 
                ? `Submit a request to remove "${selectedItem?.name}" from the roadmap.`
                : `Submit a request to change the priority of "${selectedItem?.name}".`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {dialogType === 'reprioritize' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="targetCategory">Move to Category</Label>
                  <Select value={targetCategory} onValueChange={(v: 'Next' | 'Later') => setTargetCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Next">Next</SelectItem>
                      <SelectItem value="Later">Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetRank">Priority Rank within Category</Label>
                  <Input
                    id="targetRank"
                    type="number"
                    min="1"
                    value={targetRank}
                    onChange={(e) => setTargetRank(e.target.value)}
                    placeholder="e.g., 1, 2, 3..."
                    data-testid="input-target-rank"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="justification">Justification *</Label>
              <Textarea
                id="justification"
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={dialogType === 'kill' 
                  ? "Explain why this initiative should be removed from the roadmap..."
                  : "Explain why this change in priority is needed..."
                }
                data-testid="input-justification"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitRequest}
              className={dialogType === 'kill' ? 'bg-red-600 hover:bg-red-700' : ''}
              data-testid="button-submit-request"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
