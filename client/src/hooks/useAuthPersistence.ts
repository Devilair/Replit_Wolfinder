import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useAuthPersistence() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check for stored auth token on app load
    const token = localStorage.getItem('userToken');
    
    if (token) {
      // Set default authorization header for API requests
      const originalFetch = window.fetch;
      window.fetch = function(input, init = {}) {
        return originalFetch(input, {
          ...init,
          headers: {
            ...init.headers,
            'Authorization': `Bearer ${token}`,
          },
        });
      };
    }

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userToken' && !e.newValue) {
        // Token was removed, clear all cached data
        queryClient.clear();
        window.location.href = '/';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queryClient]);
}