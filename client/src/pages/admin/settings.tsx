import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Database, Shield, Mail, Globe } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  
  // Stato per le impostazioni della piattaforma
  const [platformSettings, setPlatformSettings] = useState({
    siteName: "Wolfinder",
    siteDescription: "Trova professionisti affidabili a Ferrara e Livorno",
    allowRegistrations: true,
    requireEmailVerification: true,
    moderateReviews: true,
    autoApproveVerifiedUsers: false,
  });

  // Stato per le impostazioni email
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@wolfinder.com",
    fromName: "Wolfinder",
  });

  const handleSavePlatformSettings = () => {
    // In un'implementazione reale, qui invieresti i dati al backend
    toast({
      title: "Successo",
      description: "Impostazioni della piattaforma salvate con successo",
    });
  };

  const handleSaveEmailSettings = () => {
    // In un'implementazione reale, qui invieresti i dati al backend
    toast({
      title: "Successo", 
      description: "Impostazioni email salvate con successo",
    });
  };

  const handleTestEmail = () => {
    // In un'implementazione reale, qui testeresti la configurazione email
    toast({
      title: "Test Email",
      description: "Email di test inviata. Controlla la tua casella di posta.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impostazioni Sistema</h1>
        <p className="text-gray-600 mt-2">Configura le impostazioni generali della piattaforma</p>
      </div>

      {/* Impostazioni Piattaforma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Impostazioni Piattaforma
          </CardTitle>
          <CardDescription>
            Configura le impostazioni generali della piattaforma Wolfinder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome del Sito</Label>
              <Input
                id="siteName"
                value={platformSettings.siteName}
                onChange={(e) => setPlatformSettings({
                  ...platformSettings,
                  siteName: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">Email Principale</Label>
              <Input
                id="fromEmail"
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  fromEmail: e.target.value
                })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descrizione del Sito</Label>
            <Input
              id="siteDescription"
              value={platformSettings.siteDescription}
              onChange={(e) => setPlatformSettings({
                ...platformSettings,
                siteDescription: e.target.value
              })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Impostazioni Utenti</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Consenti Registrazioni</Label>
                <p className="text-sm text-gray-500">
                  Permetti ai nuovi utenti di registrarsi alla piattaforma
                </p>
              </div>
              <Switch
                checked={platformSettings.allowRegistrations}
                onCheckedChange={(checked) => setPlatformSettings({
                  ...platformSettings,
                  allowRegistrations: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verifica Email Obbligatoria</Label>
                <p className="text-sm text-gray-500">
                  Richiedi la verifica dell'email per completare la registrazione
                </p>
              </div>
              <Switch
                checked={platformSettings.requireEmailVerification}
                onCheckedChange={(checked) => setPlatformSettings({
                  ...platformSettings,
                  requireEmailVerification: checked
                })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Impostazioni Contenuti</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Moderazione Recensioni</Label>
                <p className="text-sm text-gray-500">
                  Le recensioni devono essere approvate prima della pubblicazione
                </p>
              </div>
              <Switch
                checked={platformSettings.moderateReviews}
                onCheckedChange={(checked) => setPlatformSettings({
                  ...platformSettings,
                  moderateReviews: checked
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approvazione Utenti Verificati</Label>
                <p className="text-sm text-gray-500">
                  Approva automaticamente i contenuti degli utenti verificati
                </p>
              </div>
              <Switch
                checked={platformSettings.autoApproveVerifiedUsers}
                onCheckedChange={(checked) => setPlatformSettings({
                  ...platformSettings,
                  autoApproveVerifiedUsers: checked
                })}
              />
            </div>
          </div>

          <Button onClick={handleSavePlatformSettings} className="w-full">
            Salva Impostazioni Piattaforma
          </Button>
        </CardContent>
      </Card>

      {/* Impostazioni Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configurazione Email
          </CardTitle>
          <CardDescription>
            Configura il server SMTP per l'invio delle email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Server SMTP</Label>
              <Input
                id="smtpHost"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpHost: e.target.value
                })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Porta SMTP</Label>
              <Input
                id="smtpPort"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpPort: e.target.value
                })}
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Username SMTP</Label>
              <Input
                id="smtpUser"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpUser: e.target.value
                })}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Password SMTP</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpPassword: e.target.value
                })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">Nome Mittente</Label>
              <Input
                id="fromName"
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  fromName: e.target.value
                })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveEmailSettings} className="flex-1">
              Salva Configurazione
            </Button>
            <Button onClick={handleTestEmail} variant="outline">
              Testa Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informazioni Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informazioni Sistema
          </CardTitle>
          <CardDescription>
            Stato del sistema e informazioni tecniche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Versione Piattaforma</Label>
              <p className="text-sm text-gray-600">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Database</Label>
              <p className="text-sm text-gray-600">PostgreSQL - Connesso</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ultima Sincronizzazione</Label>
              <p className="text-sm text-gray-600">{new Date().toLocaleString('it-IT')}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ambiente</Label>
              <p className="text-sm text-gray-600">Sviluppo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}