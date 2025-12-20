import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, Eye, Edit, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/use-user-role";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";

interface UserWithRole {
  id: number;
  odisId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
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
    <AppLayout title="Admin Panel">
      <div className="p-8 space-y-8 bg-slate-50/50 min-h-[calc(100vh-64px)]">
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-semibold">
                          {u.firstName?.[0] || u.email?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                          </p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {u.odisId === user?.id ? (
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
    </AppLayout>
  );
}
