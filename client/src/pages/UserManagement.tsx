import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Shield, UserCheck, Clock, Home, ListOrdered, LogOut, DollarSign, Gauge, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  status: string;
};

export default function UserManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pendingUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/pending-users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/user/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    navigate("/gate");
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "control_tower":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "sto":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "slt":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_role":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case "control_tower":
        return "Control Tower Admin";
      case "sto":
        return "STO Contributor";
      case "slt":
        return "SLT View-Only";
      default:
        return "Not Assigned";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-semibold font-barlow">Ensemble Control Tower</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" data-testid="link-dashboard">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/initiatives" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" data-testid="link-initiatives">
            <LayoutDashboard className="w-5 h-5" />
            <span>All Initiatives</span>
          </Link>
          <Link href="/priorities" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" data-testid="link-priorities">
            <ListOrdered className="w-5 h-5" />
            <span>Value Stream Priorities</span>
          </Link>
          <Link href="/cost-center-breakout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" data-testid="link-cost-center">
            <DollarSign className="w-5 h-5" />
            <span>Cost Center Breakout</span>
          </Link>
          <Link href="/pod-velocity" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" data-testid="link-pod-velocity">
            <Gauge className="w-5 h-5" />
            <span>Pod Velocity & Quality</span>
          </Link>
          <div className="pt-4 mt-4 border-t border-slate-700">
            <span className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Admin</span>
          </div>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 text-white" data-testid="link-users">
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold font-barlow text-slate-900">User Management</h1>
              <p className="text-sm text-slate-500 mt-1">Manage user accounts and role assignments</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
                <Clock className="w-4 h-4" />
                Pending Approval ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2" data-testid="tab-all">
                <Users className="w-4 h-4" />
                All Users ({users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Users Awaiting Role Assignment
                  </CardTitle>
                  <CardDescription>
                    These users have registered but need a role assigned before they can access the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No pending users</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assign Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user) => (
                          <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                            <TableCell className="font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                : "—"}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                                Pending Role
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                onValueChange={(value) => updateRoleMutation.mutate({ userId: user.id, role: value })}
                              >
                                <SelectTrigger className="w-48" data-testid={`select-role-${user.id}`}>
                                  <SelectValue placeholder="Select a role..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="control_tower">Control Tower Admin</SelectItem>
                                  <SelectItem value="sto">STO Contributor</SelectItem>
                                  <SelectItem value="slt">SLT View-Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    All Registered Users
                  </CardTitle>
                  <CardDescription>
                    View and manage all users in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-slate-500">Loading...</div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                            <TableCell className="font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                : "—"}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                {getRoleLabel(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                                {user.status === "active" ? "Active" : user.status === "pending_role" ? "Pending" : user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.role || undefined}
                                onValueChange={(value) => updateRoleMutation.mutate({ userId: user.id, role: value })}
                              >
                                <SelectTrigger className="w-48" data-testid={`select-role-${user.id}`}>
                                  <SelectValue placeholder="Change role..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="control_tower">Control Tower Admin</SelectItem>
                                  <SelectItem value="sto">STO Contributor</SelectItem>
                                  <SelectItem value="slt">SLT View-Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
