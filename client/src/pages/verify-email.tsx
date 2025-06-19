import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
  userId?: number;
}

export default function VerifyEmail() {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest("GET", `/api/verify-email/${token}`) as Promise<VerificationResult>;
    },
    onSuccess: (response) => {
      if (response.success) {
        setVerificationStatus('success');
        setMessage(response.message || 'Email verificata con successo!');
      } else {
        setVerificationStatus('error');
        setMessage(response.error || 'Errore nella verifica email');
      }
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      setMessage(error?.message || 'Errore durante la verifica. Riprova più tardi.');
    }
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setVerificationStatus('error');
      setMessage('Token di verifica non valido');
    }
  }, [token]);

  const handleContinue = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    // TODO: Implement resend email functionality
    console.log('Resend email clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationStatus === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            {verificationStatus === 'loading' && 'Verifica in corso...'}
            {verificationStatus === 'success' && 'Email verificata!'}
            {verificationStatus === 'error' && 'Verifica fallita'}
          </CardTitle>
          
          <CardDescription>
            {verificationStatus === 'loading' && 'Stiamo verificando il tuo indirizzo email...'}
            {verificationStatus === 'success' && 'Il tuo account è ora attivo e pronto all\'uso'}
            {verificationStatus === 'error' && 'Si è verificato un problema con la verifica'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className={`${
            verificationStatus === 'success' ? 'border-green-200 bg-green-50' : 
            verificationStatus === 'error' ? 'border-red-200 bg-red-50' : 
            'border-blue-200 bg-blue-50'
          }`}>
            <AlertDescription className={`${
              verificationStatus === 'success' ? 'text-green-800' : 
              verificationStatus === 'error' ? 'text-red-800' : 
              'text-blue-800'
            }`}>
              {message}
            </AlertDescription>
          </Alert>

          {verificationStatus === 'success' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Account attivato con successo!</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ora puoi accedere al tuo account</li>
                  <li>• Tutte le funzionalità sono disponibili</li>
                  <li>• Puoi iniziare a utilizzare Wolfinder</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleContinue}
                className="w-full"
              >
                Accedi ora
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Cosa puoi fare:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Controlla se il link è completo</li>
                  <li>• Il token potrebbe essere scaduto (24 ore)</li>
                  <li>• Richiedi un nuovo link di verifica</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Invia nuovo link
                </Button>
                
                <Link href="/register">
                  <Button variant="ghost" className="w-full">
                    Torna alla registrazione
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Attendere prego, la verifica potrebbe richiedere alcuni secondi...
              </p>
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Hai bisogno di aiuto? Contatta{' '}
              <a href="mailto:supporto@wolfinder.it" className="text-blue-600 hover:underline">
                supporto@wolfinder.it
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}