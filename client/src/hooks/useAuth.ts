import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  name: string;
  role: string;
  isVerified: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/profile'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: user as AuthUser | undefined,
    isLoading,
    isAuthenticated: !!user && !error,
    error
  };
}