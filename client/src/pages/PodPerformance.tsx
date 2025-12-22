import { useState } from "react";
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle, CheckCircle2, Zap, GitPullRequest, Gauge, Users, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { AppLayout } from "@/components/layout/AppLayout";

const pods = [
  { id: 'patient-access', name: 'Patient Access Pod', members: 8 },
  { id: 'coding-automation', name: 'Coding Automation Pod', members: 6 },
  { id: 'claims-processing', name: 'Claims Processing Pod', members: 7 },
  { id: 'denials-management', name: 'Denials Management Pod', members: 5 },
  { id: 'platform', name: 'Platform Engineering Pod', members: 9 },
];

const velocityTrendData = [
  { sprint: 'S1', velocity: 42, planned: 45, completed: 40 },
  { sprint: 'S2', velocity: 48, planned: 50, completed: 46 },
  { sprint: 'S3', velocity: 45, planned: 48, completed: 44 },
  { sprint: 'S4', velocity: 52, planned: 52, completed: 50 },
  { sprint: 'S5', velocity: 55, planned: 55, completed: 54 },
  { sprint: 'S6', velocity: 58, planned: 56, completed: 57 },
];

const doraMetricsData = [
  { week: 'W1', deploymentFreq: 3, leadTime: 4.2, changeFailure: 12, mttr: 2.1 },
  { week: 'W2', deploymentFreq: 4, leadTime: 3.8, changeFailure: 8, mttr: 1.8 },
  { week: 'W3', deploymentFreq: 5, leadTime: 3.2, changeFailure: 10, mttr: 1.5 },
  { week: 'W4', deploymentFreq: 6, leadTime: 2.8, changeFailure: 6, mttr: 1.2 },
  { week: 'W5', deploymentFreq: 7, leadTime: 2.5, changeFailure: 5, mttr: 0.9 },
  { week: 'W6', deploymentFreq: 8, leadTime: 2.2, changeFailure: 4, mttr: 0.8 },
];

const qualityData = [
  { month: 'Jul', codeCoverage: 68, bugEscapeRate: 8, techDebtRatio: 22 },
  { month: 'Aug', codeCoverage: 71, bugEscapeRate: 7, techDebtRatio: 20 },
  { month: 'Sep', codeCoverage: 74, bugEscapeRate: 6, techDebtRatio: 18 },
  { month: 'Oct', codeCoverage: 76, bugEscapeRate: 5, techDebtRatio: 16 },
  { month: 'Nov', codeCoverage: 78, bugEscapeRate: 4, techDebtRatio: 15 },
  { month: 'Dec', codeCoverage: 80, bugEscapeRate: 3, techDebtRatio: 14 },
];

const teamHealthData = [
  { subject: 'Velocity', A: 85, fullMark: 100 },
  { subject: 'Quality', A: 78, fullMark: 100 },
  { subject: 'Collaboration', A: 90, fullMark: 100 },
  { subject: 'Morale', A: 82, fullMark: 100 },
  { subject: 'Innovation', A: 75, fullMark: 100 },
  { subject: 'Delivery', A: 88, fullMark: 100 },
];

const cycleTimeData = [
  { stage: 'Backlog', time: 2.5 },
  { stage: 'In Progress', time: 3.2 },
  { stage: 'Code Review', time: 0.8 },
  { stage: 'Testing', time: 1.5 },
  { stage: 'Deployment', time: 0.3 },
];

const scorecardMetrics = {
  delivery: [
    { name: 'Planned to Done (Original Commitment)', value: '87%', target: '90%', status: 'yellow' },
    { name: 'Planned to Done (Including Adds)', value: '92%', target: '85%', status: 'green' },
    { name: 'Scope Churn (Peak)', value: '18%', target: '<20%', status: 'green' },
    { name: 'Scope Churn (End)', value: '12%', target: '<15%', status: 'green' },
    { name: 'Release Burndown Shape', value: 'End-loaded', target: 'Linear', status: 'yellow' },
    { name: 'Feature Cycle Time', value: '40-90h typical', target: '<72h', status: 'yellow' },
    { name: 'Team Velocity (Story Points)', value: '40.3 avg - 14.3 σ', target: 'Stable', status: 'green' },
  ],
  engineering: [
    { name: 'PR Time to Merge', value: '4.2h', target: '<8h', status: 'green' },
    { name: 'Coding Days per Week', value: '3.8', target: '>4', status: 'yellow' },
    { name: 'Work Mix – Rework Share', value: '15%', target: '<20%', status: 'green' },
    { name: 'Defect Density', value: '0.8/KLOC', target: '<1.0', status: 'green' },
    { name: 'Backlog Aging – Open Defects >90d', value: '3', target: '0', status: 'red' },
    { name: 'Copilot Acceptance Rate (by count)', value: '34%', target: '>30%', status: 'green' },
    { name: 'Copilot Acceptance Rate (by lines)', value: '28%', target: '>25%', status: 'green' },
  ],
  operations: [
    { name: 'Failed Requests (30d)', value: '0.02%', target: '<0.1%', status: 'green' },
    { name: 'Server Response Time (avg)', value: '145ms', target: '<200ms', status: 'green' },
    { name: 'Availability', value: '99.95%', target: '>99.9%', status: 'green' },
  ],
  dora: [
    { name: 'Deployment Frequency', value: '8/week', target: 'Daily', status: 'green' },
    { name: 'Lead Time for Changes', value: '2.2 days', target: '<1 week', status: 'green' },
    { name: 'Change Failure Rate', value: '4%', target: '<15%', status: 'green' },
    { name: 'Mean Time to Restore', value: '48 min', target: '<1 hour', status: 'green' },
  ],
  space: [
    { name: 'Quality of Interaction', value: '-', target: 'TBD', status: 'neutral' },
    { name: 'Code Ownership', value: '-', target: 'TBD', status: 'neutral' },
    { name: 'Context Switching', value: '-', target: 'TBD', status: 'neutral' },
    { name: 'WIP Limits', value: '-', target: 'TBD', status: 'neutral' },
  ],
};

export default function PodPerformance() {
  const [selectedPod, setSelectedPod] = useState('patient-access');
  const [timeRange, setTimeRange] = useState('6w');

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral', isPositive: boolean) => {
    if (trend === 'neutral') return <Minus className="w-4 h-4 text-slate-400" />;
    if (trend === 'up') {
      return isPositive 
        ? <ArrowUpRight className="w-4 h-4 text-green-500" />
        : <ArrowUpRight className="w-4 h-4 text-red-500" />;
    }
    return isPositive 
      ? <ArrowDownRight className="w-4 h-4 text-green-500" />
      : <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const doraScoreColor = (score: string) => {
    switch (score) {
      case 'Elite': return 'bg-green-500';
      case 'High': return 'bg-blue-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <Select value={selectedPod} onValueChange={setSelectedPod}>
        <SelectTrigger className="w-56" data-testid="select-pod">
          <SelectValue placeholder="Select Pod" />
        </SelectTrigger>
        <SelectContent>
          {pods.map(pod => (
            <SelectItem key={pod.id} value={pod.id}>{pod.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger className="w-32" data-testid="select-time-range">
          <SelectValue placeholder="Time Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2w">2 Weeks</SelectItem>
          <SelectItem value="4w">4 Weeks</SelectItem>
          <SelectItem value="6w">6 Weeks</SelectItem>
          <SelectItem value="3m">3 Months</SelectItem>
          <SelectItem value="6m">6 Months</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AppLayout title="Pod Performance" headerActions={headerActions}>
      <div className="p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-64px)]">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {pods.find(p => p.id === selectedPod)?.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              {pods.find(p => p.id === selectedPod)?.members} team members
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Illustrative Data</Badge>
            <Badge className="bg-green-500 text-sm px-3 py-1">
              DORA Score: High Performer
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Deployment Frequency</p>
                  <p className="text-3xl font-bold mt-1">8/week</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-indigo-100">
                    {getTrendIcon('up', true)}
                    <span>+33% from last period</span>
                  </div>
                </div>
                <Zap className="w-10 h-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Lead Time for Changes</p>
                  <p className="text-3xl font-bold mt-1">2.2 days</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-emerald-100">
                    {getTrendIcon('down', true)}
                    <span>-12% from last period</span>
                  </div>
                </div>
                <Clock className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Change Failure Rate</p>
                  <p className="text-3xl font-bold mt-1">4%</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-amber-100">
                    {getTrendIcon('down', true)}
                    <span>-2pp from last period</span>
                  </div>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">MTTR</p>
                  <p className="text-3xl font-bold mt-1">48 min</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-cyan-100">
                    {getTrendIcon('down', true)}
                    <span>-25% from last period</span>
                  </div>
                </div>
                <Target className="w-10 h-10 text-cyan-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scorecard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="velocity">Velocity</TabsTrigger>
            <TabsTrigger value="dora">DORA Metrics</TabsTrigger>
            <TabsTrigger value="quality">Code Quality</TabsTrigger>
            <TabsTrigger value="flow">Flow Metrics</TabsTrigger>
            <TabsTrigger value="health">Team Health</TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Delivery Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scorecardMetrics.delivery.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{metric.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{metric.value}</span>
                          <Badge variant={metric.status === 'green' ? 'default' : metric.status === 'yellow' ? 'secondary' : 'destructive'} className={`text-xs ${metric.status === 'green' ? 'bg-green-500' : metric.status === 'yellow' ? 'bg-amber-500 text-white' : ''}`}>
                            {metric.target}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4" />
                    Engineering Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scorecardMetrics.engineering.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{metric.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{metric.value}</span>
                          <Badge variant={metric.status === 'green' ? 'default' : metric.status === 'yellow' ? 'secondary' : 'destructive'} className={`text-xs ${metric.status === 'green' ? 'bg-green-500' : metric.status === 'yellow' ? 'bg-amber-500 text-white' : ''}`}>
                            {metric.target}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Operations Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scorecardMetrics.operations.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{metric.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{metric.value}</span>
                          <Badge variant="default" className="text-xs bg-green-500">
                            {metric.target}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    DORA Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scorecardMetrics.dora.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm">{metric.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{metric.value}</span>
                          <Badge variant="default" className="text-xs bg-green-500">
                            {metric.target}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    SPACE Metrics
                    <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
                  </CardTitle>
                  <CardDescription>Developer experience and productivity metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {scorecardMetrics.space.map((metric, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-sm font-medium text-slate-600">{metric.name}</p>
                        <p className="text-xl font-bold mt-1 text-slate-400">{metric.value}</p>
                        <p className="text-xs text-slate-400 mt-1">Target: {metric.target}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="velocity" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Sprint Velocity Trend
                  </CardTitle>
                  <CardDescription>Story points completed per sprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={velocityTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="sprint" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="completed" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="Completed" />
                        <Area type="monotone" dataKey="planned" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} name="Planned" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Velocity Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Velocity</p>
                    <p className="text-2xl font-bold">50 pts/sprint</p>
                    <Progress value={83} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">83% of capacity</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Commitment Accuracy</p>
                    <p className="text-2xl font-bold text-green-600">96%</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 6 sprints avg</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Velocity Trend</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <p className="text-2xl font-bold text-green-600">+38%</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">vs 6 sprints ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <GitPullRequest className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PRs Merged</p>
                      <p className="text-xl font-bold">47</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stories Completed</p>
                      <p className="text-xl font-bold">23</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg PR Review Time</p>
                      <p className="text-xl font-bold">3.2h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WIP Limit</p>
                      <p className="text-xl font-bold">4/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dora" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Deployment Frequency', value: '8/week', target: 'Daily+', score: 'High', desc: 'How often code reaches production' },
                { label: 'Lead Time for Changes', value: '2.2 days', target: '<1 day', score: 'High', desc: 'Time from commit to production' },
                { label: 'Change Failure Rate', value: '4%', target: '<15%', score: 'Elite', desc: 'Deployments causing failures' },
                { label: 'Mean Time to Recover', value: '48 min', target: '<1 hour', score: 'Elite', desc: 'Time to restore service' },
              ].map((metric, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={doraScoreColor(metric.score)}>{metric.score}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">Target: {metric.target}</p>
                    <p className="text-xs text-slate-400 mt-1">{metric.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">DORA Metrics Trend</CardTitle>
                <CardDescription>Weekly performance over the last 6 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={doraMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="deploymentFreq" stroke="#6366f1" strokeWidth={2} name="Deployments/Week" />
                      <Line yAxisId="right" type="monotone" dataKey="leadTime" stroke="#10b981" strokeWidth={2} name="Lead Time (days)" />
                      <Line yAxisId="right" type="monotone" dataKey="changeFailure" stroke="#f59e0b" strokeWidth={2} name="Change Failure %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Quality Metrics Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={qualityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="codeCoverage" stroke="#10b981" strokeWidth={2} name="Code Coverage %" />
                        <Line type="monotone" dataKey="bugEscapeRate" stroke="#ef4444" strokeWidth={2} name="Bug Escape Rate %" />
                        <Line type="monotone" dataKey="techDebtRatio" stroke="#f59e0b" strokeWidth={2} name="Tech Debt Ratio %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">Code Coverage</p>
                    <p className="text-2xl font-bold text-green-700">80%</p>
                    <Progress value={80} className="mt-2 h-2 [&>div]:bg-green-500" />
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">Bug Escape Rate</p>
                    <p className="text-2xl font-bold text-red-700">3%</p>
                    <Progress value={3} className="mt-2 h-2 [&>div]:bg-red-500" />
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">Tech Debt Ratio</p>
                    <p className="text-2xl font-bold text-amber-700">14%</p>
                    <Progress value={14} className="mt-2 h-2 [&>div]:bg-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="flow" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cycle Time by Stage</CardTitle>
                  <CardDescription>Average days spent in each stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cycleTimeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                        <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                        <Tooltip />
                        <Bar dataKey="time" fill="#6366f1" radius={[0, 4, 4, 0]} name="Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Flow Metrics Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Cycle Time</p>
                      <p className="text-2xl font-bold">8.3 days</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Work in Progress</p>
                      <p className="text-2xl font-bold">12 items</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Throughput</p>
                      <p className="text-2xl font-bold">23/week</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Flow Efficiency</p>
                      <p className="text-2xl font-bold text-green-600">42%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Health Radar</CardTitle>
                  <CardDescription>Based on latest retrospective</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={teamHealthData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                        <Radar name="Team Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamHealthData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={item.A} className="w-32 h-2" />
                          <span className={`text-sm font-bold ${item.A >= 80 ? 'text-green-600' : item.A >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {item.A}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
