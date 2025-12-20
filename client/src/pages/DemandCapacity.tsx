import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";

interface Pod {
  id: string;
  name: string;
  valueStream: string;
  capacity: number;
  allocated: number;
  backlog: number;
  members: number;
  skills: string[];
}

const podsData: Pod[] = [
  {
    id: 'pod-1',
    name: 'Coding AI Pod',
    valueStream: 'Mid-Cycle / Coding',
    capacity: 100,
    allocated: 85,
    backlog: 45,
    members: 6,
    skills: ['ML Engineering', 'NLP', 'Healthcare Coding']
  },
  {
    id: 'pod-2',
    name: 'Access Automation Pod',
    valueStream: 'Pre-Service / Access',
    capacity: 80,
    allocated: 95,
    backlog: 60,
    members: 5,
    skills: ['RPA', 'Web Scraping', 'Integration']
  },
  {
    id: 'pod-3',
    name: 'Claims Intelligence Pod',
    valueStream: 'Back-Office / Claims',
    capacity: 90,
    allocated: 70,
    backlog: 25,
    members: 5,
    skills: ['Data Science', 'LLM Fine-tuning', 'Analytics']
  },
  {
    id: 'pod-4',
    name: 'Patient Experience Pod',
    valueStream: 'Patient Experience',
    capacity: 60,
    allocated: 80,
    backlog: 40,
    members: 4,
    skills: ['Voice AI', 'Conversational AI', 'UX']
  },
  {
    id: 'pod-5',
    name: 'Platform Engineering Pod',
    valueStream: 'Infrastructure',
    capacity: 100,
    allocated: 55,
    backlog: 30,
    members: 6,
    skills: ['DevOps', 'Cloud', 'Security']
  }
];

const chartData = podsData.map(pod => ({
  name: pod.name.replace(' Pod', ''),
  Capacity: pod.capacity,
  Allocated: pod.allocated,
  Backlog: pod.backlog
}));

export default function DemandCapacity() {
  const totalCapacity = podsData.reduce((sum, p) => sum + p.capacity, 0);
  const totalAllocated = podsData.reduce((sum, p) => sum + p.allocated, 0);
  const totalBacklog = podsData.reduce((sum, p) => sum + p.backlog, 0);
  const overallUtilization = Math.round((totalAllocated / totalCapacity) * 100);

  return (
    <AppLayout title="Demand vs. Capacity">
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Capacity</p>
            <p className="text-2xl font-bold text-foreground font-mono">{totalCapacity} pts</p>
            <p className="text-xs text-muted-foreground mt-1">{podsData.reduce((sum, p) => sum + p.members, 0)} team members</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Allocated</p>
            <p className="text-2xl font-bold text-primary font-mono">{totalAllocated} pts</p>
            <p className="text-xs text-muted-foreground mt-1">{overallUtilization}% utilization</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Backlog Demand</p>
            <p className="text-2xl font-bold text-amber-600 font-mono">{totalBacklog} pts</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting capacity</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Over-allocated Pods</p>
            <p className="text-2xl font-bold text-status-red font-mono">{podsData.filter(p => p.allocated > p.capacity).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pod Capacity Overview</CardTitle>
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
                  <Bar dataKey="Backlog" fill="hsl(var(--status-yellow))" name="Backlog" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {podsData.map(pod => {
            const utilization = Math.round((pod.allocated / pod.capacity) * 100);
            const isOverAllocated = pod.allocated > pod.capacity;
            
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
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Allocation: {pod.allocated} / {pod.capacity} pts</span>
                      {isOverAllocated && <span className="text-red-600 font-medium">Over by {pod.allocated - pod.capacity} pts</span>}
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
                      <span className="text-muted-foreground">Team: </span>
                      <span className="font-semibold">{pod.members} members</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pod.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </AppLayout>
  );
}
