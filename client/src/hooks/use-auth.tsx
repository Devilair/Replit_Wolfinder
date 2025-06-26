import { useAuthStore } from './useAuthStore';
import { api } from '@/lib/api';
import type { User } from '@wolfinder/shared';

export const useAuth = () => {
  const { 
    user, 
    accessToken,
    refreshToken,
    isLoading,
    setUser, 
    setTokens,
    setLoading,
  } = useAuthStore();

  const setAuthTokens = (access: string, refresh: string) => {
    setTokens(access, refresh);
    // You might want to fetch user profile here as well
    // For now, we'll assume the app does this separately or the token contains enough info
  };
  
  const loginWithCode = async (code: string, state: string) => {
    // This function can be implemented if a different OAuth flow requires it
    // For example, calling a backend endpoint that exchanges the code
    const response = await api.get(`/auth/github/callback?code=${code}&state=${state}`);
    const { accessToken, refreshToken, user: apiUser } = response.data;
    setTokens(accessToken, refreshToken);
    setUser(apiUser);
  };

  const logout = () => {
    setTokens(null, null);
    setUser(null);
    window.location.href = '/login';
  };
  
  return { 
    user, 
    accessToken, 
    refreshToken,
    isLoading,
    isLoggedIn: !!accessToken,
    setAuthTokens, 
    loginWithCode,
    logout,
    setUser,
    setLoading,
  };
};