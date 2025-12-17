import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserRole } from "@/hooks/use-user-role";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import MasterGatePage from "@/pages/MasterGatePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProjectRequests from "@/pages/ProjectRequests";
import Issues from "@/pages/Issues";
import BudgetRequests from "@/pages/BudgetRequests";
import ProjectList from "@/pages/ProjectList";
import RoadmapView from "@/pages/RoadmapView";
import DemandCapacity from "@/pages/DemandCapacity";
import PodVelocity from "@/pages/PodVelocity";
import PodPerformance from "@/pages/PodPerformance";
import ProjectDetail from "@/pages/ProjectDetail";
import IntakeFormPage from "@/pages/IntakeFormPage";
import LGateFormPage from "@/pages/LGateFormPage";
import ValueStreamPriorities from "@/pages/ValueStreamPriorities";
import CostCenterBreakout from "@/pages/CostCenterBreakout";
import AdminPanel from "@/pages/AdminPanel";
import UserManagement from "@/pages/UserManagement";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={ProjectList} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/project/:id/intake" component={IntakeFormPage} />
      <Route path="/project/:id/gate/:gate" component={LGateFormPage} />
      <Route path="/roadmap" component={RoadmapView} />
      <Route path="/priorities" component={ValueStreamPriorities} />
      <Route path="/demand-capacity" component={DemandCapacity} />
      <Route path="/pod-velocity" component={PodVelocity} />
      <Route path="/pod-performance" component={PodPerformance} />
      <Route path="/cost-centers" component={CostCenterBreakout} />
      <Route path="/requests" component={ProjectRequests} />
      <Route path="/issues" component={Issues} />
      <Route path="/budget" component={BudgetRequests} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin/users" component={UserManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useUserRole();
  const [location] = useLocation();
  
  const publicRoutes = ["/gate", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(location);
  
  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/gate" component={MasterGatePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
      </Switch>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-4 animate-pulse">E</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = "/gate";
    return null;
  }
  
  return <AuthenticatedRoutes />;
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
