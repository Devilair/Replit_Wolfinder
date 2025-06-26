import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { api } from '../lib/api';

console.log('[useAuthPersistence] hook importato');

export const useAuthPersistence = () => {
  const { accessToken, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    console.log('[useAuthPersistence] useEffect chiamato');
    const checkUserStatus = async () => {
      console.log('[useAuthPersistence] accessToken:', accessToken);
      if (!accessToken) {
        setLoading(false);
        console.log('[useAuthPersistence] Nessun accessToken, setLoading(false)');
        return;
      }

      try {
        console.log('[useAuthPersistence] Chiamo /auth/me...');
        const response = await api.get('/auth/me');
        setUser(response.data);
        console.log('[useAuthPersistence] Utente caricato:', response.data);
      } catch (error) {
        console.error('[useAuthPersistence] Session verification failed, logging out.', error);
        logout();
      } finally {
        setLoading(false);
        console.log('[useAuthPersistence] setLoading(false)');
      }
    };

    checkUserStatus();
  }, [accessToken, setUser, setLoading, logout]);
}; 