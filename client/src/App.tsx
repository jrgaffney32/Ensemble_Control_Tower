import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ProjectRequests from "@/pages/ProjectRequests";
import Issues from "@/pages/Issues";
import BudgetRequests from "@/pages/BudgetRequests";
import ProjectList from "@/pages/ProjectList";
import RoadmapView from "@/pages/RoadmapView";
import DemandCapacity from "@/pages/DemandCapacity";
import PodVelocity from "@/pages/PodVelocity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={ProjectList} />
      <Route path="/roadmap" component={RoadmapView} />
      <Route path="/demand-capacity" component={DemandCapacity} />
      <Route path="/pod-velocity" component={PodVelocity} />
      <Route path="/requests" component={ProjectRequests} />
      <Route path="/issues" component={Issues} />
      <Route path="/budget" component={BudgetRequests} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
