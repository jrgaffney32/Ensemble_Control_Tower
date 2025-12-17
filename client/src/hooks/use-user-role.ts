import { useQuery } from "@tanstack/react-query";
import type { AppUserRole } from "@shared/schema";

interface UserWithRole {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AppUserRole | null;
  status: string;
}

async function fetchCurrentUser(): Promise<UserWithRole | null> {
  const response = await fetch("/api/auth/me", {
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
    queryKey: ["/api/auth/me"],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const role = user?.role || 'slt';

  return {
    user,
    isLoading,
    isAuthenticated: !!user && user.status === 'active',
    role,
    isControlTower: role === 'control_tower',
    isSTO: role === 'sto',
    isSLT: role === 'slt',
    canEdit: role === 'control_tower' || role === 'sto',
    canApprove: role === 'control_tower',
    refetch,
  };
}
