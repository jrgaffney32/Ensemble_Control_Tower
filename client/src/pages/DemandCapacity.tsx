import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { groupedInitiatives, type GroupedInitiative } from "@/lib/initiatives";
import { Users, Zap, Clock, TrendingUp } from "lucide-react";

interface Pod {
  id: string;
  name: string;
  valueStream: string;
  capacity: number;
  allocated: number;
  backlog: number;
  ftes: number;
  velocity: number;
  skills: string[];
  assignedInitiatives: string[];
}

const podsData: Pod[] = [
  {
    id: 'pod-1',
    name: 'Coding AI Pod',
    valueStream: 'Mid-Cycle / Coding',
    capacity: 100,
    allocated: 85,
    backlog: 45,
    ftes: 6,
    velocity: 42,
    skills: ['ML Engineering', 'NLP', 'Healthcare Coding'],
    assignedInitiatives: ['Autonomous Coding', 'Coding Quality Improvement', 'AI Chart Review']
  },
  {
    id: 'pod-2',
    name: 'Access Automation Pod',
    valueStream: 'Pre-Service / Access',
    capacity: 80,
    allocated: 95,
    backlog: 60,
    ftes: 5,
    velocity: 38,
    skills: ['RPA', 'Web Scraping', 'Integration'],
    assignedInitiatives: ['Prior Auth Automation', 'Eligibility Verification', 'Patient Scheduling AI']
  },
  {
    id: 'pod-3',
    name: 'Claims Intelligence Pod',
    valueStream: 'Back-Office / Claims',
    capacity: 90,
    allocated: 70,
    backlog: 25,
    ftes: 5,
    velocity: 45,
    skills: ['Data Science', 'LLM Fine-tuning', 'Analytics'],
    assignedInitiatives: ['Claims Denial Prevention', 'Payment Posting Automation', 'Appeal Letter Generation']
  },
  {
    id: 'pod-4',
    name: 'Patient Experience Pod',
    valueStream: 'Patient Experience',
    capacity: 60,
    allocated: 80,
    backlog: 40,
    ftes: 4,
    velocity: 28,
    skills: ['Voice AI', 'Conversational AI', 'UX'],
    assignedInitiatives: ['Patient Communication AI', 'Self-Service Portal', 'Appointment Reminders']
  },
  {
    id: 'pod-5',
    name: 'Platform Engineering Pod',
    valueStream: 'Infrastructure',
    capacity: 100,
    allocated: 55,
    backlog: 30,
    ftes: 6,
    velocity: 52,
    skills: ['DevOps', 'Cloud', 'Security'],
    assignedInitiatives: ['MLOps Platform', 'Data Pipeline Enhancement', 'Security Compliance']
  }
];

const getInitiativeEffort = (initiative: GroupedInitiative): number => {
  const baseCost = initiative.budgetedCost || 0;
  const costToPoints = baseCost / 50000;
  const capabilityPoints = initiative.capabilities.length * 8;
  return Math.round(costToPoints + capabilityPoints);
};

const chartData = podsData.map(pod => ({
  name: pod.name.replace(' Pod', ''),
  Capacity: pod.capacity,
  Allocated: pod.allocated,
  Backlog: pod.backlog,
  Velocity: pod.velocity
}));

export default function DemandCapacity() {
  const totalCapacity = podsData.reduce((sum, p) => sum + p.capacity, 0);
  const totalAllocated = podsData.reduce((sum, p) => sum + p.allocated, 0);
  const totalBacklog = podsData.reduce((sum, p) => sum + p.backlog, 0);
  const totalFTEs = podsData.reduce((sum, p) => sum + p.ftes, 0);
  const avgVelocity = Math.round(podsData.reduce((sum, p) => sum + p.velocity, 0) / podsData.length);
  const overallUtilization = Math.round((totalAllocated / totalCapacity) * 100);

  const nowInitiatives = groupedInitiatives.filter(i => i.priorityCategory === 'Now');
  const nextInitiatives = groupedInitiatives.filter(i => i.priorityCategory === 'Next');
  
  const totalNowEffort = nowInitiatives.reduce((sum, i) => sum + getInitiativeEffort(i), 0);
  const totalNextEffort = nextInitiatives.reduce((sum, i) => sum + getInitiativeEffort(i), 0);
  const totalRoadmapEffort = totalNowEffort + totalNextEffort;
  
  const weeksToCompleteNow = avgVelocity > 0 ? Math.ceil(totalNowEffort / (avgVelocity * podsData.length)) : 0;
  const weeksToCompleteAll = avgVelocity > 0 ? Math.ceil(totalRoadmapEffort / (avgVelocity * podsData.length)) : 0;

  return (
    <AppLayout title="Demand vs. Capacity">
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total FTEs</p>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{totalFTEs}</p>
            <p className="text-xs text-muted-foreground mt-1">Across {podsData.length} pods</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Velocity</p>
            </div>
            <p className="text-2xl font-bold text-primary font-mono">{avgVelocity} pts/wk</p>
            <p className="text-xs text-muted-foreground mt-1">Per pod average</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Capacity</p>
            <p className="text-2xl font-bold text-foreground font-mono">{totalCapacity} pts</p>
            <p className="text-xs text-muted-foreground mt-1">{overallUtilization}% utilized</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Backlog Demand</p>
            <p className="text-2xl font-bold text-amber-600 font-mono">{totalBacklog} pts</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting capacity</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Over-allocated</p>
            <p className="text-2xl font-bold text-status-red font-mono">{podsData.filter(p => p.allocated > p.capacity).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Pods need attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pod Capacity & Velocity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" barGap={4}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Capacity" fill="hsl(var(--muted))" name="Capacity" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Allocated" fill="hsl(var(--primary))" name="Allocated" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Velocity" fill="#22c55e" name="Velocity/wk" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Roadmap Effort Estimation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1">"Now" Initiatives</p>
                  <p className="text-xl font-bold text-blue-700 font-mono">{totalNowEffort} pts</p>
                  <p className="text-xs text-blue-500 mt-1">{nowInitiatives.length} initiatives</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-600 uppercase mb-1">"Next" Initiatives</p>
                  <p className="text-xl font-bold text-amber-700 font-mono">{totalNextEffort} pts</p>
                  <p className="text-xs text-amber-500 mt-1">{nextInitiatives.length} initiatives</p>
                </div>
              </div>
              
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Roadmap Effort</span>
                  <span className="text-lg font-bold font-mono">{totalRoadmapEffort} pts</span>
                </div>
                <Progress value={(totalNowEffort / totalRoadmapEffort) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Now: {totalNowEffort} pts</span>
                  <span>Next: {totalNextEffort} pts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-600 uppercase">Time to Complete "Now"</span>
                  </div>
                  <p className="text-lg font-bold text-green-700 mt-1">~{weeksToCompleteNow} weeks</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600 uppercase">Time to Complete All</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700 mt-1">~{weeksToCompleteAll} weeks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initiative Effort Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {[...nowInitiatives, ...nextInitiatives].slice(0, 15).map(initiative => {
                const effort = getInitiativeEffort(initiative);
                const maxEffort = 100;
                return (
                  <div key={initiative.ids[0]} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{initiative.name}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          initiative.priorityCategory === 'Now' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {initiative.priorityCategory}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{initiative.lGate}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(effort / maxEffort) * 100} className="h-2 flex-1" />
                        <span className="text-xs font-mono text-muted-foreground w-16 text-right">{effort} pts</span>
                      </div>
                      {initiative.capabilities.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {initiative.capabilities.slice(0, 3).map((cap, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-white border rounded text-slate-600">
                              {cap.name}
                            </span>
                          ))}
                          {initiative.capabilities.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{initiative.capabilities.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {podsData.map(pod => {
            const utilization = Math.round((pod.allocated / pod.capacity) * 100);
            const isOverAllocated = pod.allocated > pod.capacity;
            const weeksOfWork = pod.velocity > 0 ? Math.ceil((pod.allocated + pod.backlog) / pod.velocity) : 0;
            
            return (
              <Card key={pod.id} className={isOverAllocated ? 'border-l-4 border-l-red-500' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{pod.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{pod.valueStream}</p>
                    </div>
                    <Badge variant={isOverAllocated ? 'destructive' : 'secondary'}>
                      {utilization}% utilized
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                      <Users className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                      <p className="text-lg font-bold font-mono">{pod.ftes}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">FTEs</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <Zap className="w-4 h-4 mx-auto text-green-500 mb-1" />
                      <p className="text-lg font-bold font-mono text-green-700">{pod.velocity}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Pts/Week</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Allocation: {pod.allocated} / {pod.capacity} pts</span>
                      {isOverAllocated && <span className="text-red-600 font-medium">Over by {pod.allocated - pod.capacity}</span>}
                    </div>
                    <Progress 
                      value={Math.min(utilization, 100)} 
                      className={`h-2 ${isOverAllocated ? '[&>div]:bg-red-500' : ''}`}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Backlog: </span>
                      <span className="font-semibold text-amber-600">{pod.backlog} pts</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Work: </span>
                      <span className="font-semibold">~{weeksOfWork} wks</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {pod.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                  
                  {pod.assignedInitiatives.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Assigned Initiatives</p>
                      <div className="space-y-1">
                        {pod.assignedInitiatives.map((init, idx) => (
                          <div key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {init}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </AppLayout>
  );
}
