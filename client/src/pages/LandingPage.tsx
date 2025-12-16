import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Shield, Users, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center font-bold text-3xl text-white shadow-lg">E</div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white tracking-tight font-heading">ENSEMBLE</h1>
              <p className="text-lg text-slate-400 tracking-widest">CONTROL TOWER</p>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            AI/Automation Project Governance Dashboard for Healthcare Revenue Cycle Management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <LayoutDashboard className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Track all projects across value streams with real-time KPIs and status updates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <Shield className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-lg">L-Gate Governance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Structured approval workflows from L0 through L6 with document requirements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-2">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-lg">Value Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Monitor financial impact, efficiency gains, and success metrics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Role-Based Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Control Tower</h3>
              <p className="text-sm text-slate-400">Full admin access with approval authority</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">STO</h3>
              <p className="text-sm text-slate-400">Submit and manage project updates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">SLT</h3>
              <p className="text-sm text-slate-400">View-only access to all dashboards</p>
            </div>
          </div>

          <div className="text-center">
            <a href="/api/login">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-login">
                Sign In to Continue
              </Button>
            </a>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Powered by Replit Authentication
        </p>
      </div>
    </div>
  );
}
