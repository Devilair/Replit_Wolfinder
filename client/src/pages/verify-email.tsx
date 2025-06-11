import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [location] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token di verifica mancante');
      return;
    }

    verifyEmail(token);
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/verify-email/${token}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Errore durante la verifica');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Errore di connessione al server');
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/login';
  };

  const handleGoToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifica in corso...'}
            {status === 'success' && 'Email Verificata!'}
            {status === 'error' && 'Verifica Fallita'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'Stiamo verificando il tuo indirizzo email'}
            {status === 'success' && 'Il tuo account è ora attivo'}
            {status === 'error' && 'Si è verificato un problema'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {message}
          </div>

          {status === 'success' && (
            <div className="space-y-3">
              <Button 
                onClick={handleGoToLogin} 
                className="w-full"
              >
                Accedi al tuo Account
              </Button>
              <Button 
                onClick={handleGoToHome} 
                variant="outline" 
                className="w-full"
              >
                Torna alla Home
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={handleGoToHome} 
                className="w-full"
              >
                Torna alla Home
              </Button>
              <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Se il problema persiste, contatta il supporto: supporto@wolfinder.it
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}