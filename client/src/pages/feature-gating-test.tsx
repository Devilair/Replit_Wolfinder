import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle, Zap, BarChart3, Camera, Settings, Palette, Smartphone } from "lucide-react";

export default function FeatureGatingTest() {
  const [testResults, setTestResults] = useState<any[]>([]);

  // Get current feature gating status
  const { data: featureStatus, isLoading } = useQuery({
    queryKey: ["/api/test/feature-gating"],
    retry: false,
  });

  // Test mutations for different features
  const testAnalytics = useMutation({
    mutationFn: () => apiRequest("GET", "/api/professional/analytics"),
    onSuccess: (data) => {
      setTestResults(prev => [...prev, { 
        feature: "Analytics Base", 
        success: true, 
        message: "Accesso consentito",
        data: data
      }]);
    },
    onError: (error: any) => {
      setTestResults(prev => [...prev, { 
        feature: "Analytics Base", 
        success: false, 
        message: error.message,
        error: error
      }]);
    }
  });

  const testAdvancedAnalytics = useMutation({
    mutationFn: () => apiRequest("GET", "/api/professional/analytics/advanced"),
    onSuccess: (data) => {
      setTestResults(prev => [...prev, { 
        feature: "Analytics Avanzate", 
        success: true, 
        message: "Accesso consentito",
        data: data
      }]);
    },
    onError: (error: any) => {
      setTestResults(prev => [...prev, { 
        feature: "Analytics Avanzate", 
        success: false, 
        message: error.message,
        error: error
      }]);
    }
  });

  const testApiAccess = useMutation({
    mutationFn: () => apiRequest("GET", "/api/external/data"),
    onSuccess: (data) => {
      setTestResults(prev => [...prev, { 
        feature: "Accesso API", 
        success: true, 
        message: "Accesso consentito",
        data: data
      }]);
    },
    onError: (error: any) => {
      setTestResults(prev => [...prev, { 
        feature: "Accesso API", 
        success: false, 
        message: error.message,
        error: error
      }]);
    }
  });

  const testPhotoUpload = useMutation({
    mutationFn: () => apiRequest("POST", "/api/professional/upload-photo", { 
      filename: "test.jpg",
      description: "Foto di test"
    }),
    onSuccess: (data) => {
      setTestResults(prev => [...prev, { 
        feature: "Upload Foto", 
        success: true, 
        message: "Upload consentito",
        data: data
      }]);
    },
    onError: (error: any) => {
      setTestResults(prev => [...prev, { 
        feature: "Upload Foto", 
        success: false, 
        message: error.message,
        error: error
      }]);
    }
  });

  const testServiceCreation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/professional/services", { 
      name: "Nuovo Servizio Test",
      description: "Servizio di test per limite"
    }),
    onSuccess: (data) => {
      setTestResults(prev => [...prev, { 
        feature: "Creazione Servizio", 
        success: true, 
        message: "Servizio creato",
        data: data
      }]);
    },
    onError: (error: any) => {
      setTestResults(prev => [...prev, { 
        feature: "Creazione Servizio", 
        success: false, 
        message: error.message,
        error: error
      }]);
    }
  });

  const clearResults = () => {
    setTestResults([]);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Test Sistema Feature Gating</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Questa dashboard dimostra il funzionamento del sistema di controllo funzionalità e limiti di utilizzo
          basato sui piani di abbonamento.
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stato Attuale
          </CardTitle>
          <CardDescription>
            Piano corrente e funzionalità disponibili
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {featureStatus && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-medium">Piano Corrente:</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {featureStatus.currentPlan}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Funzionalità Disponibili
                  </h4>
                  {Object.entries(featureStatus.features || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Limiti di Utilizzo
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Foto:</span>
                      <span className="text-sm font-mono">
                        {featureStatus.usage?.currentPhotos || 0} / {featureStatus.limits?.maxPhotos || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Servizi:</span>
                      <span className="text-sm font-mono">
                        {featureStatus.usage?.currentServices || 0} / {featureStatus.limits?.maxServices || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contatti:</span>
                      <span className="text-sm font-mono">
                        0 / {featureStatus.limits?.maxContacts || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Test Funzionalità
          </CardTitle>
          <CardDescription>
            Testa l'accesso alle diverse funzionalità per verificare i controlli di piano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => testAnalytics.mutate()}
              disabled={testAnalytics.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Test Analytics Base
            </Button>

            <Button
              onClick={() => testAdvancedAnalytics.mutate()}
              disabled={testAdvancedAnalytics.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Test Analytics Avanzate
            </Button>

            <Button
              onClick={() => testApiAccess.mutate()}
              disabled={testApiAccess.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Test Accesso API
            </Button>

            <Button
              onClick={() => testPhotoUpload.mutate()}
              disabled={testPhotoUpload.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Test Upload Foto
            </Button>

            <Button
              onClick={() => testServiceCreation.mutate()}
              disabled={testServiceCreation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Test Creazione Servizio
            </Button>

            <Button
              onClick={clearResults}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Pulisci Risultati
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risultati Test</CardTitle>
            <CardDescription>
              Risultati dei test di accesso alle funzionalità
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <Alert key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.feature}</h4>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Successo" : "Bloccato"}
                      </Badge>
                    </div>
                    <AlertDescription className="mt-1">
                      {result.message}
                    </AlertDescription>
                    {result.error?.message && (
                      <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                        {result.error.message}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Guida ai Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Analytics Base:</strong> Disponibili dal piano Essenziale (€29/mese)</p>
            <p><strong>Analytics Avanzate:</strong> Disponibili dal piano Professionale (€59/mese)</p>
            <p><strong>Accesso API:</strong> Disponibile solo nel piano Studio (€99/mese)</p>
            <p><strong>Upload Foto:</strong> Limitato per numero in base al piano</p>
            <p><strong>Creazione Servizi:</strong> Limitato per numero in base al piano</p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              I test bloccati mostrano messaggi di errore 403 con informazioni sui piani richiesti per l'upgrade.
              I test riusciti confermano che l'utente ha accesso alla funzionalità.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}