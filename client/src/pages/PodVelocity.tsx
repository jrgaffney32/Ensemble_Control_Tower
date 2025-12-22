import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";

interface PodMetrics {
  id: string;
  name: string;
  valueStream: string;
  velocity: {
    current: number;
    target: number;
    trend: 'up' | 'down' | 'neutral';
    history: { sprint: string; value: number }[];
  };
  quality: {
    defectRate: number;
    codeReviewTime: number;
    testCoverage: number;
    incidentCount: number;
  };
  health: 'healthy' | 'at-risk' | 'critical';
}

const podMetrics: PodMetrics[] = [
  {
    id: 'pod-1',
    name: 'Coding AI Pod',
    valueStream: 'Mid-Cycle / Coding',
    velocity: {
      current: 42,
      target: 45,
      trend: 'up',
      history: [
        { sprint: 'S1', value: 35 },
        { sprint: 'S2', value: 38 },
        { sprint: 'S3', value: 36 },
        { sprint: 'S4', value: 40 },
        { sprint: 'S5', value: 39 },
        { sprint: 'S6', value: 42 }
      ]
    },
    quality: {
      defectRate: 2.1,
      codeReviewTime: 4.5,
      testCoverage: 87,
      incidentCount: 1
    },
    health: 'healthy'
  },
  {
    id: 'pod-2',
    name: 'Access Automation Pod',
    valueStream: 'Pre-Service / Access',
    velocity: {
      current: 28,
      target: 35,
      trend: 'down',
      history: [
        { sprint: 'S1', value: 32 },
        { sprint: 'S2', value: 34 },
        { sprint: 'S3', value: 33 },
        { sprint: 'S4', value: 30 },
        { sprint: 'S5', value: 29 },
        { sprint: 'S6', value: 28 }
      ]
    },
    quality: {
      defectRate: 4.8,
      codeReviewTime: 8.2,
      testCoverage: 72,
      incidentCount: 3
    },
    health: 'at-risk'
  },
  {
    id: 'pod-3',
    name: 'Claims Intelligence Pod',
    valueStream: 'Back-Office / Claims',
    velocity: {
      current: 38,
      target: 40,
      trend: 'up',
      history: [
        { sprint: 'S1', value: 30 },
        { sprint: 'S2', value: 32 },
        { sprint: 'S3', value: 34 },
        { sprint: 'S4', value: 35 },
        { sprint: 'S5', value: 37 },
        { sprint: 'S6', value: 38 }
      ]
    },
    quality: {
      defectRate: 1.5,
      codeReviewTime: 3.2,
      testCoverage: 91,
      incidentCount: 0
    },
    health: 'healthy'
  },
  {
    id: 'pod-4',
    name: 'Patient Experience Pod',
    valueStream: 'Patient Experience',
    velocity: {
      current: 22,
      target: 30,
      trend: 'neutral',
      history: [
        { sprint: 'S1', value: 20 },
        { sprint: 'S2', value: 23 },
        { sprint: 'S3', value: 21 },
        { sprint: 'S4', value: 24 },
        { sprint: 'S5', value: 21 },
        { sprint: 'S6', value: 22 }
      ]
    },
    quality: {
      defectRate: 5.2,
      codeReviewTime: 12.1,
      testCoverage: 65,
      incidentCount: 4
    },
    health: 'critical'
  },
  {
    id: 'pod-5',
    name: 'Platform Engineering Pod',
    valueStream: 'Infrastructure',
    velocity: {
      current: 48,
      target: 45,
      trend: 'up',
      history: [
        { sprint: 'S1', value: 40 },
        { sprint: 'S2', value: 42 },
        { sprint: 'S3', value: 44 },
        { sprint: 'S4', value: 45 },
        { sprint: 'S5', value: 46 },
        { sprint: 'S6', value: 48 }
      ]
    },
    quality: {
      defectRate: 0.8,
      codeReviewTime: 2.5,
      testCoverage: 94,
      incidentCount: 0
    },
    health: 'healthy'
  }
];

export default function PodVelocity() {
  const avgVelocity = Math.round(podMetrics.reduce((sum, p) => sum + p.velocity.current, 0) / podMetrics.length);
  const avgDefectRate = (podMetrics.reduce((sum, p) => sum + p.quality.defectRate, 0) / podMetrics.length).toFixed(1);
  const avgTestCoverage = Math.round(podMetrics.reduce((sum, p) => sum + p.quality.testCoverage, 0) / podMetrics.length);

  const getHealthBadge = (health: PodMetrics['health']) => {
    switch (health) {
      case 'healthy': return <Badge className="bg-green-100 text-green-700">Healthy</Badge>;
      case 'at-risk': return <Badge className="bg-amber-100 text-amber-700">At Risk</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <AppLayout title="Pod Velocity & Quality">
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="flex justify-end">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Illustrative Data</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avg Velocity</p>
            <p className="text-2xl font-bold text-foreground font-mono">{avgVelocity} pts</p>
            <p className="text-xs text-muted-foreground mt-1">Per sprint</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avg Defect Rate</p>
            <p className="text-2xl font-bold text-foreground font-mono">{avgDefectRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Per release</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Test Coverage</p>
            <p className="text-2xl font-bold text-status-green font-mono">{avgTestCoverage}%</p>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Healthy Pods</p>
            <p className="text-2xl font-bold text-status-green font-mono">{podMetrics.filter(p => p.health === 'healthy').length}</p>
            <p className="text-xs text-muted-foreground mt-1">of {podMetrics.length} total</p>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-red-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical Pods</p>
            <p className="text-2xl font-bold text-status-red font-mono">{podMetrics.filter(p => p.health === 'critical').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </div>
        </div>

        <div className="grid gap-4">
          {podMetrics.map(pod => (
            <Card key={pod.id} className={pod.health === 'critical' ? 'border-l-4 border-l-red-500' : pod.health === 'at-risk' ? 'border-l-4 border-l-amber-500' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {pod.name}
                      {getTrendIcon(pod.velocity.trend)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{pod.valueStream}</p>
                  </div>
                  {getHealthBadge(pod.health)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sprint Velocity (6 sprints)</p>
                    <div className="h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={pod.velocity.history}>
                          <defs>
                            <linearGradient id={`gradient-${pod.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="sprint" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--popover))', 
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            fill={`url(#gradient-${pod.id})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Current: <span className="font-bold">{pod.velocity.current} pts</span></span>
                      <span className="text-muted-foreground">Target: {pod.velocity.target} pts</span>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-md">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Defect Rate</p>
                      <p className={`text-lg font-bold ${pod.quality.defectRate > 3 ? 'text-red-600' : pod.quality.defectRate > 2 ? 'text-amber-600' : 'text-green-600'}`}>
                        {pod.quality.defectRate}%
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Code Review Time</p>
                      <p className={`text-lg font-bold ${pod.quality.codeReviewTime > 8 ? 'text-red-600' : pod.quality.codeReviewTime > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {pod.quality.codeReviewTime}h
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Test Coverage</p>
                      <p className={`text-lg font-bold ${pod.quality.testCoverage < 70 ? 'text-red-600' : pod.quality.testCoverage < 80 ? 'text-amber-600' : 'text-green-600'}`}>
                        {pod.quality.testCoverage}%
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Incidents (30d)</p>
                      <p className={`text-lg font-bold ${pod.quality.incidentCount > 2 ? 'text-red-600' : pod.quality.incidentCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {pod.quality.incidentCount}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
