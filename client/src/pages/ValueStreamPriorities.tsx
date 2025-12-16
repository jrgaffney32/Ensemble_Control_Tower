import { useState } from "react";
import { LayoutDashboard, PieChart, Calendar, Settings, FileText, AlertCircle, ArrowUpDown, Flag, Trash2, Send, X, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { mockPriorityItems, PriorityItem, PriorityCategory, getCategoryColor, getCategoryLabel } from "@/lib/priorityData";
import { useToast } from "@/hooks/use-toast";

export default function ValueStreamPriorities() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'reprioritize' | 'kill'>('reprioritize');
  const [selectedItem, setSelectedItem] = useState<PriorityItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<'next' | 'later'>('next');
  const [targetRank, setTargetRank] = useState('1');
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const categories: PriorityCategory[] = ['shipped', 'now', 'next', 'later'];

  const openReprioritizeDialog = (item: PriorityItem) => {
    setSelectedItem(item);
    setDialogType('reprioritize');
    setTargetCategory(item.priorityCategory === 'later' ? 'next' : 'later');
    setTargetRank('1');
    setJustification('');
    setDialogOpen(true);
  };

  const openKillDialog = (item: PriorityItem) => {
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

  const getItemsByCategory = (category: PriorityCategory) => {
    return mockPriorityItems
      .filter(item => item.priorityCategory === category)
      .sort((a, b) => a.rankWithinCategory - b.rankWithinCategory);
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
        <PageHeader 
          title="Value Stream Priorities"
          breadcrumbs={[
            { label: 'Portfolio', href: '/' },
            { label: 'Value Stream Priorities' }
          ]}
        />

        <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold font-heading">Value Stream Priorities</h1>
              <p className="text-muted-foreground mt-1">Priority rankings for all initiatives and capabilities across value streams</p>
            </div>
          </div>

          {/* Priority Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => {
              const items = getItemsByCategory(category);
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(category)}>
                      {getCategoryLabel(category)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">({items.length})</span>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow" data-testid={`card-priority-${item.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">#{item.rankWithinCategory}</span>
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'initiative' ? 'Initiative' : 'Capability'}
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="text-xs">{item.stageGate}</Badge>
                          </div>
                          
                          <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                          
                          <div className="text-xs text-muted-foreground mb-3">
                            <span className="font-medium">{item.valueStream}</span>
                            {item.targetDate && (
                              <span className="ml-2">• Target: {item.targetDate}</span>
                            )}
                          </div>
                          
                          {category !== 'shipped' && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-xs h-7"
                                onClick={() => openReprioritizeDialog(item)}
                                data-testid={`button-reprioritize-${item.id}`}
                              >
                                <ArrowUpDown className="w-3 h-3 mr-1" />
                                Reprioritize
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => openKillDialog(item)}
                                data-testid={`button-kill-${item.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {items.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground bg-white rounded-lg border border-dashed">
                        No items in this category
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                  <Select value={targetCategory} onValueChange={(v: 'next' | 'later') => setTargetCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next">Next</SelectItem>
                      <SelectItem value="later">Later</SelectItem>
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
                  ? "Explain why this initiative/capability should be removed from the roadmap..."
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
