import { useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const AuthCallbackPage = () => {
  const { setAuthTokens } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      setAuthTokens(accessToken, refreshToken);
      toast({ title: 'Successo', description: 'Login effettuato con successo.' });
      navigate('/dashboard', { replace: true });
    } else {
        console.error('Missing tokens in auth callback');
        toast({
            variant: 'destructive',
            title: 'Errore di Login',
            description: 'Parametri di autenticazione mancanti o invalidi.',
        });
        navigate('/login', { replace: true });
    }
    // Esegui solo una volta
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Finalizzando il login...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 