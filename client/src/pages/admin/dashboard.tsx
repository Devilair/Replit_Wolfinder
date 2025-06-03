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

interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalProfessionals: number;
  verifiedProfessionals: number;
  totalReviews: number;
  pendingReviews: number;
  averageRating: string;
}

export default function AdminDashboard() {
  // Fetch admin statistics with real data from database
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats']
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dashboard amministrativa...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Utenti Totali",
      value: stats?.totalUsers || 0,
      change: `+${stats?.newUsersThisWeek || 0} questa settimana`,
      icon: Users,
      trend: "up",
      color: "text-blue-600"
    },
    {
      title: "Professionisti Verificati", 
      value: stats?.verifiedProfessionals || 0,
      change: `${Math.round(((stats?.verifiedProfessionals || 0) / (stats?.totalProfessionals || 1)) * 100)}% del totale`,
      icon: UserCheck,
      trend: "up",
      color: "text-green-600"
    },
    {
      title: "Recensioni Totali",
      value: stats?.totalReviews || 0,
      change: `Rating medio: ${stats?.averageRating || '0.0'}⭐`,
      icon: Star,
      trend: "up", 
      color: "text-yellow-600"
    },
    {
      title: "Recensioni Pendenti",
      value: stats?.pendingReviews || 0,
      change: "Richiedono moderazione",
      icon: AlertTriangle,
      trend: (stats?.pendingReviews || 0) > 10 ? "down" : "neutral",
      color: "text-orange-600"
    }
  ];

  const criticalMetrics = [
    {
      label: "Tempo Risposta Medio",
      value: "245ms",
      status: "success"
    },
    {
      label: "Tasso di Conversione",
      value: "12.4%",
      status: "success"
    },
    {
      label: "Uptime Sistema",
      value: "99.8%",
      status: "success"
    },
    {
      label: "Sessioni Attive",
      value: "47",
      status: "success"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "user_registration",
      description: "Nuovo utente registrato: marco.verdi@email.com",
      timestamp: "2 minuti fa",
      severity: "info"
    },
    {
      id: 2,
      type: "review_submitted",
      description: "Nuova recensione per Avv. Mario Rossi",
      timestamp: "15 minuti fa", 
      severity: "info"
    },
    {
      id: 3,
      type: "professional_verified",
      description: "Professionista verificato: Ing. Laura Bianchi",
      timestamp: "1 ora fa",
      severity: "success"
    },
    {
      id: 4,
      type: "suspicious_activity",
      description: "Rilevata attività sospetta: IP multipli per stesso utente",
      timestamp: "2 ore fa",
      severity: "warning"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Amministrativa</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Gestione completa della piattaforma Wolfinder
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Sistema Operativo
              </Badge>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Esporta Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {kpi.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {kpi.trend === "up" && <TrendingUp className="w-3 h-3 mr-1 text-green-500" />}
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="professionals">Professionisti</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            <TabsTrigger value="security">Sicurezza</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Critical Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Metriche Critiche
                  </CardTitle>
                  <CardDescription>
                    Monitoraggio real-time delle performance chiave
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {criticalMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{metric.label}</p>
                          <p className="text-lg font-bold">{metric.value}</p>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${
                          metric.status === 'success' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Attività Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          item.severity === 'success' ? 'bg-green-500' :
                          item.severity === 'warning' ? 'bg-yellow-500' :
                          item.severity === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crescita Utenti</CardTitle>
                  <CardDescription>Registrazioni negli ultimi 30 giorni</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mr-2" />
                    Grafico delle registrazioni utenti
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione Professioni</CardTitle>
                  <CardDescription>Suddivisione per categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avvocati</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={35} className="w-24" />
                        <span className="text-sm text-muted-foreground">35%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Commercialisti</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={25} className="w-24" />
                        <span className="text-sm text-muted-foreground">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ingegneri</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={20} className="w-24" />
                        <span className="text-sm text-muted-foreground">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Architetti</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={15} className="w-24" />
                        <span className="text-sm text-muted-foreground">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notai</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={5} className="w-24" />
                        <span className="text-sm text-muted-foreground">5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Utenti</CardTitle>
                <CardDescription>
                  Panoramica completa degli utenti registrati ({stats?.totalUsers || 0} utenti)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sistema di Gestione Utenti</h3>
                  <p className="text-muted-foreground mb-4">
                    Accesso completo alla gestione degli utenti della piattaforma
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
                      <div className="text-sm text-muted-foreground">Utenti Registrati</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats?.newUsersThisWeek || 0}</div>
                      <div className="text-sm text-muted-foreground">Nuovi Questa Settimana</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">18</div>
                      <div className="text-sm text-muted-foreground">Utenti Attivi Oggi</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Professionisti</CardTitle>
                <CardDescription>Sistema di verifica e gestione professionisti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gestione Professionale</h3>
                  <p className="text-muted-foreground mb-4">
                    Sistema di verifica e gestione dei {stats?.totalProfessionals || 0} professionisti
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats?.verifiedProfessionals || 0}</div>
                      <div className="text-sm text-muted-foreground">Professionisti Verificati</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats?.totalProfessionals || 0}</div>
                      <div className="text-sm text-muted-foreground">Totale Professionisti</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Recensioni</CardTitle>
                <CardDescription>Moderazione e controllo qualità delle recensioni</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sistema di Moderazione</h3>
                  <p className="text-muted-foreground mb-4">
                    Gestione delle {stats?.totalReviews || 0} recensioni con rating medio {stats?.averageRating || '0.0'}⭐
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats?.totalReviews || 0}</div>
                      <div className="text-sm text-muted-foreground">Recensioni Totali</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats?.pendingReviews || 0}</div>
                      <div className="text-sm text-muted-foreground">Pendenti</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats?.averageRating || '0.0'}</div>
                      <div className="text-sm text-muted-foreground">Rating Medio</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoraggio Sicurezza</CardTitle>
                <CardDescription>Sistema di sicurezza e rilevamento anomalie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sistema di Sicurezza Avanzato</h3>
                  <p className="text-muted-foreground mb-4">
                    Monitoraggio real-time e protezione della piattaforma
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">99.8%</div>
                      <div className="text-sm text-muted-foreground">Uptime Sistema</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-muted-foreground">Minacce Rilevate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Avanzati</CardTitle>
                <CardDescription>Analisi dettagliate e reportistica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Business Intelligence</h3>
                  <p className="text-muted-foreground mb-4">
                    Analisi approfondite delle performance della piattaforma
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">12.4%</div>
                      <div className="text-sm text-muted-foreground">Tasso di Conversione</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">245ms</div>
                      <div className="text-sm text-muted-foreground">Tempo Risposta</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}