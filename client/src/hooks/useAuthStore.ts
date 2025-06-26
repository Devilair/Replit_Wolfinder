import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
<<<<<<< HEAD
import type { User } from '@wolfinder/shared-types';
=======
import type { User } from '@wolfinder/shared';
>>>>>>> c674766a33746b3a9795c1c81da0821d46cadf00

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    }
  )
); 