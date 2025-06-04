import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disabled for demo since we don't have real auth
  });

  // For demo purposes, return mock authenticated state
  // In production, this would check actual authentication status
  return {
    user: { id: 1, name: "Demo User", email: "demo@example.com" },
    isLoading: false,
    isAuthenticated: true,
  };
}