import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Star,
  Shield,
  TrendingUp,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity
} from "lucide-react";

interface AdminStats {
  activeUsers: {
    today: number;
    week: number;
    month: number;
    changePercent: number;
  };
  reviews: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    newToday: number;
  };
  professionals: {
    total: number;
    verified: number;
    pending: number;
    newThisWeek: number;
  };
  revenue: {
    monthToDate: number;
    projectedMonthly: number;
    subscriptionConversion: number;
  };
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/dashboard-stats'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/attached_assets/logo_1749382291587.png" 
                alt="Wolfinder Admin" 
                className="h-10 w-auto mr-3" 
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Amministrativa
              </h1>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Amministratore
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.activeUsers.month.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers.changePercent && stats.activeUsers.changePercent > 0 ? '+' : ''}
                {stats?.activeUsers.changePercent}% dal mese scorso
              </p>
              <div className="mt-2 text-sm text-gray-600">
                Oggi: {stats?.activeUsers.today || 0} | 
                Settimana: {stats?.activeUsers.week || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recensioni</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.reviews.total.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.reviews.newToday || 0} nuove oggi
              </p>
              <div className="mt-2 flex gap-3 text-sm">
                <span className="text-green-600">
                  ✓ {stats?.reviews.verified || 0}
                </span>
                <span className="text-orange-600">
                  ⏳ {stats?.reviews.pending || 0}
                </span>
                <span className="text-red-600">
                  ✗ {stats?.reviews.rejected || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Professionisti</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.professionals.total.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.professionals.newThisWeek || 0} nuovi questa settimana
              </p>
              <div className="mt-2 flex gap-3 text-sm">
                <span className="text-green-600">
                  ✓ {stats?.professionals.verified || 0}
                </span>
                <span className="text-orange-600">
                  ⏳ {stats?.professionals.pending || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ricavi</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                €{stats?.revenue.monthToDate.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Proiezione: €{stats?.revenue.projectedMonthly.toLocaleString() || 0}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                Conversione: {stats?.revenue.subscriptionConversion || 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="professionals">Professionisti</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Attività Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Nuovo professionista verificato</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2 min fa</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Nuova recensione da moderare</span>
                      </div>
                      <span className="text-xs text-muted-foreground">5 min fa</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Segnalazione da verificare</span>
                      </div>
                      <span className="text-xs text-muted-foreground">15 min fa</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crescita della Piattaforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nuovi professionisti</span>
                      <span className="text-sm font-semibold text-green-600">+12 questa settimana</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recensioni verificate</span>
                      <span className="text-sm font-semibold text-blue-600">+45 questo mese</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Abbonamenti attivi</span>
                      <span className="text-sm font-semibold text-purple-600">89% retention</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Button className="h-24 flex flex-col gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Gestione Professionisti</span>
              </Button>
              
              <Button className="h-24 flex flex-col gap-2" variant="outline">
                <Star className="h-6 w-6" />
                <span>Moderazione Recensioni</span>
              </Button>
              
              <Button className="h-24 flex flex-col gap-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>Report Analytics</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="professionals">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Professionisti</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Interfaccia per la gestione dei professionisti in fase di sviluppo.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Moderazione Recensioni</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Interfaccia per la moderazione delle recensioni in fase di sviluppo.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Avanzate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Dashboard analytics avanzate in fase di sviluppo.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Impostazioni Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Configurazioni di sistema in fase di sviluppo.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}