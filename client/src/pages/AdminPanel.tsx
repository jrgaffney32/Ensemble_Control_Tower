import { useState, useEffect } from "react";
import { Link } from "wouter";
import { LayoutDashboard, PieChart, Calendar, FileText, AlertCircle, Home, ListOrdered, LogOut, Users, Shield, Eye, Edit, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/use-user-role";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserWithRole {
  id: number;
  odisId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: 'control_tower' | 'sto' | 'slt';
}

const roleDescriptions = {
  control_tower: {
    name: "Control Tower",
    icon: Crown,
    color: "bg-purple-600",
    description: "Full administrative access",
    permissions: [
      "Approve/reject L-gate submissions",
      "Configure projects after L0 approval",
      "Assign and manage user roles",
      "Edit all project details and milestones",
      "View all dashboards and reports",
      "Manage value stream priorities"
    ]
  },
  sto: {
    name: "STO (Single-Threaded Owner)",
    icon: Edit,
    color: "bg-blue-600",
    description: "Submit and edit capabilities",
    permissions: [
      "Submit new project intake forms",
      "Edit project milestones and details",
      "Submit L-gate documentation",
      "View all dashboards and reports",
      "Cannot approve L-gates or assign roles"
    ]
  },
  slt: {
    name: "SLT (Senior Leadership Team)",
    icon: Eye,
    color: "bg-slate-600",
    description: "View-only access",
    permissions: [
      "View all dashboards and reports",
      "View project details and milestones",
      "View L-gate status and documentation",
      "Cannot submit, edit, or approve anything"
    ]
  }
};

export default function AdminPanel() {
  const { user, role, isControlTower } = useUserRole();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<UserWithRole[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    enabled: isControlTower,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ odisId, newRole }: { odisId: string; newRole: string }) => {
      const res = await fetch(`/api/user/${odisId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const getRoleBadge = () => {
    switch (role) {
      case 'control_tower':
        return <Badge className="bg-purple-600 text-xs">Control Tower</Badge>;
      case 'sto':
        return <Badge className="bg-blue-600 text-xs">STO</Badge>;
      case 'slt':
        return <Badge className="bg-slate-600 text-xs">SLT</Badge>;
      default:
        return null;
    }
  };

  if (!isControlTower) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only Control Tower administrators can access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Button variant="ghost" className="w-full justify-start hover:bg-white/5 hover:text-white">
                <ListOrdered className="w-4 h-4 mr-3" />
                Value Stream Priorities
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start bg-white/10 text-white">
                <Users className="w-4 h-4 mr-3" />
                Admin Panel
              </Button>
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </p>
              {getRoleBadge()}
            </div>
          </div>
          <a href="/api/logout">
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100" data-testid="button-home">
                <Home className="h-5 w-5 text-slate-600" />
              </Button>
            </Link>
            <span className="font-semibold text-foreground">Admin Panel</span>
          </div>
        </header>

        <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-64px)]">
          {/* Role Descriptions */}
          <div>
            <h2 className="text-xl font-bold font-heading mb-4">Access Level Descriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(roleDescriptions).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <Card key={key} className="overflow-hidden">
                    <CardHeader className={`${info.color} text-white pb-3`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <CardTitle className="text-lg">{info.name}</CardTitle>
                      </div>
                      <CardDescription className="text-white/80">{info.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {info.permissions.map((perm, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* User Management */}
          <div>
            <h2 className="text-xl font-bold font-heading mb-4">User Role Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>
                  Assign roles to users who have logged in. The first user is automatically assigned as Control Tower admin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-muted-foreground">No other users have logged in yet.</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg" data-testid={`user-row-${u.id}`}>
                        <div className="flex items-center gap-3">
                          {u.profileImageUrl ? (
                            <img src={u.profileImageUrl} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold">
                              {u.firstName?.[0] || u.email?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                            </p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {u.odisId === (user as any)?.id ? (
                            <Badge className={roleDescriptions[u.role].color}>
                              {roleDescriptions[u.role].name} (You)
                            </Badge>
                          ) : (
                            <Select
                              value={u.role}
                              onValueChange={(newRole) => updateRoleMutation.mutate({ odisId: u.odisId, newRole })}
                            >
                              <SelectTrigger className="w-48" data-testid={`select-role-${u.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="control_tower">Control Tower</SelectItem>
                                <SelectItem value="sto">STO</SelectItem>
                                <SelectItem value="slt">SLT</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
