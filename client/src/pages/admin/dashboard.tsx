import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  Star, 
  AlertTriangle, 
  TrendingUp, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Shield,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      window.location.href = '/';
    }
  }, [user, authLoading]);

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !authLoading && user?.role === 'admin'
  });

  const { data: criticalMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/critical-metrics'],
    enabled: !authLoading && user?.role === 'admin'
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    enabled: !authLoading && user?.role === 'admin'
  });

  const { data: moderationQueue, isLoading: queueLoading } = useQuery({
    queryKey: ['/api/admin/moderation-queue'],
    enabled: !authLoading && user?.role === 'admin'
  });

  const { data: suspiciousActivity, isLoading: suspiciousLoading } = useQuery({
    queryKey: ['/api/admin/suspicious-activity'],
    enabled: !authLoading && user?.role === 'admin'
  });

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                Dashboard Amministrativa
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Controllo e gestione completa della piattaforma Wolfinder
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Activity className="w-4 h-4 mr-1" />
                Sistema Operativo
              </Badge>
              <Badge variant="secondary">Admin: {user.name}</Badge>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        {suspiciousActivity && suspiciousActivity.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Attività Sospette Rilevate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suspiciousActivity.slice(0, 3).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getSeverityColor(activity.severity)}>
                        {activity.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{activity.type}</span>
                      <span className="text-sm text-gray-600">{activity.description}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Investiga
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="professionals">Professionisti</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="security">Sicurezza</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : dashboardStats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats?.newUsersThisWeek || 0} questa settimana
                  </p>
                  <Progress value={65} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Professionisti Verificati</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : dashboardStats?.verifiedProfessionals || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.totalProfessionals || 0} totali
                  </p>
                  <Progress value={75} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recensioni Totali</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : dashboardStats?.totalReviews || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rating medio: {dashboardStats?.averageRating || "0.0"}
                  </p>
                  <Progress value={80} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Azioni Pendenti</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : dashboardStats?.pendingReviews || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Richiede moderazione
                  </p>
                  <Progress value={30} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Metriche di Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo di risposta medio</span>
                    <Badge variant="secondary">
                      {criticalMetrics?.averageResponseTime || "N/A"} min
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasso di conversione</span>
                    <Badge variant="secondary">
                      {criticalMetrics?.conversionRate || "0"}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime sistema</span>
                    <Badge className="bg-green-500">
                      {criticalMetrics?.systemUptime || "99.9"}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessioni attive</span>
                    <Badge variant="outline">
                      {criticalMetrics?.activeSessions || "0"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Attività Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {activity.timestamp}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
                <CardDescription>
                  Gestione veloce delle operazioni più comuni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-auto p-4 flex flex-col items-center gap-2">
                    <UserCheck className="h-6 w-6" />
                    <span>Verifica Professionisti</span>
                    <Badge variant="destructive" className="text-xs">
                      {moderationQueue?.professionals || 0} pendenti
                    </Badge>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Star className="h-6 w-6" />
                    <span>Modera Recensioni</span>
                    <Badge variant="destructive" className="text-xs">
                      {moderationQueue?.reviews || 0} pendenti
                    </Badge>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Report Analytics</span>
                    <Badge variant="secondary" className="text-xs">
                      Generazione
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Professionisti</CardTitle>
                <CardDescription>
                  Verifica, approva e gestisci i professionisti della piattaforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Funzionalità di gestione professionisti in fase di implementazione...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Utenti</CardTitle>
                <CardDescription>
                  Amministra utenti, sospensioni e permessi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Funzionalità di gestione utenti in fase di implementazione...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderazione Recensioni</CardTitle>
                <CardDescription>
                  Approva, rifiuta e gestisci le recensioni degli utenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Sistema di moderazione recensioni in fase di implementazione...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Avanzate</CardTitle>
                <CardDescription>
                  Statistiche dettagliate e business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Dashboard analytics in fase di implementazione...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Centro Sicurezza</CardTitle>
                <CardDescription>
                  Monitoraggio sicurezza e rilevazione anomalie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suspiciousLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    suspiciousActivity?.map((activity: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(activity.severity)}>
                              {activity.severity}
                            </Badge>
                            <span className="font-medium">{activity.type}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Confidence: {activity.confidence}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm">Investiga</Button>
                          <Button size="sm" variant="outline">Ignora</Button>
                          <Button size="sm" variant="destructive">Blocca</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}