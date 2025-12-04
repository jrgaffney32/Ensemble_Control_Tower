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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
