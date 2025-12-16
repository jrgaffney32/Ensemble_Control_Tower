import { useQuery } from "@tanstack/react-query";
import type { UserRole } from "@shared/schema";

interface UserWithRole {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  valueStream: string | null;
}

async function fetchUserRole(): Promise<UserWithRole | null> {
  const response = await fetch("/api/user/role", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useUserRole() {
  const { data: user, isLoading, refetch } = useQuery<UserWithRole | null>({
    queryKey: ["/api/user/role"],
    queryFn: fetchUserRole,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const role = user?.role || 'slt';

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    role,
    isControlTower: role === 'control_tower',
    isSTO: role === 'sto',
    isSLT: role === 'slt',
    canEdit: role === 'control_tower' || role === 'sto',
    canApprove: role === 'control_tower',
    refetch,
  };
}
