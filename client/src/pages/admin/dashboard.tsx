import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Star, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  ShieldCheck,
  Activity,
  BarChart3,
  Calendar,
  Mail,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AdminDashboardStats {
  activeUsers: {
    today: number;
    week: number;
    month: number;
    previousPeriod: number;
    changePercent: number;
  };
  reviews: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    newToday: number;
    averageVerificationTime: number;
  };
  professionals: {
    total: number;
    verified: number;
    pending: number;
    newThisWeek: number;
    conversionRate: number;
  };
  revenue: {
    monthToDate: number;
    projectedMonthly: number;
    subscriptionConversion: number;
    averageRevenue: number;
  };
}

interface AdvancedMetrics {
  userEngagement: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
  systemPerformance: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    apiRequestCount: number;
  };
  businessMetrics: {
    customerLifetimeValue: number;
    churnRate: number;
    mrr: number;
    arpu: number;
  };
}

interface SuspiciousActivity {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEntities: number[];
  confidence: number;
  metadata: any;
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats', timeRange],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: advancedMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/advanced-metrics', timeRange],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: suspiciousActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/suspicious-activity'],
    refetchInterval: 180000 // Refresh every 3 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (statsLoading || metricsLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardStats as AdminDashboardStats;
  const metrics = advancedMetrics as AdvancedMetrics;
  const activities = suspiciousActivity as SuspiciousActivity[];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Amministrativa</h1>
          <p className="text-gray-600 mt-2">Panoramica delle metriche chiave di Wolfinder</p>
        </div>
        
        <div className="flex gap-2">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers.month.toLocaleString()}</div>
            <p className={`text-xs ${getChangeColor(stats?.activeUsers.changePercent || 0)}`}>
              {formatPercent(stats?.activeUsers.changePercent || 0)} dal periodo precedente
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Oggi: {stats?.activeUsers.today} | Settimana: {stats?.activeUsers.week}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recensioni</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reviews.total.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              +{stats?.reviews.newToday} nuove oggi
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Verificate:</span>
                <span className="text-green-600">{stats?.reviews.verified}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>In attesa:</span>
                <span className="text-yellow-600">{stats?.reviews.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionisti</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.professionals.total.toLocaleString()}</div>
            <p className="text-xs text-blue-600">
              +{stats?.professionals.newThisWeek} questa settimana
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Conversione:</span>
                <span>{stats?.professionals.conversionRate}%</span>
              </div>
              <Progress value={stats?.professionals.conversionRate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenue.monthToDate || 0)}</div>
            <p className="text-xs text-green-600">
              Proiezione: {formatCurrency(stats?.revenue.projectedMonthly || 0)}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>ARPU:</span>
                <span>{formatCurrency(stats?.revenue.averageRevenue || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Conv. Abbonamenti:</span>
                <span>{stats?.revenue.subscriptionConversion}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Sicurezza</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Metriche Finanziarie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">MRR (Monthly Recurring Revenue)</span>
                  <span className="font-semibold">{formatCurrency(metrics?.businessMetrics.mrr || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                  <span className="font-semibold">{formatCurrency(metrics?.businessMetrics.customerLifetimeValue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className="font-semibold text-red-600">{metrics?.businessMetrics.churnRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tempo di Verifica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.reviews.averageVerificationTime}h</div>
                <p className="text-xs text-gray-600 mt-1">Tempo medio di verifica recensioni</p>
                <div className="mt-3">
                  <Progress value={Math.min((24 - (stats?.reviews.averageVerificationTime || 0)) / 24 * 100, 100)} />
                  <p className="text-xs text-gray-500 mt-1">Obiettivo: &lt; 24h</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Crescita Settimanale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professionisti</span>
                    <span className="text-green-600 font-semibold">+{stats?.professionals.newThisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recensioni</span>
                    <span className="text-blue-600 font-semibold">+{stats?.reviews.newToday * 7}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utenti Attivi</span>
                    <span className="text-purple-600 font-semibold">+{stats?.activeUsers.week}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Durata Sessione</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.userEngagement.averageSessionDuration}min</div>
                <p className="text-xs text-gray-600">Media per sessione</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pagine per Sessione</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.userEngagement.pagesPerSession}</div>
                <p className="text-xs text-gray-600">Pagine visualizzate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.userEngagement.bounceRate}%</div>
                <p className="text-xs text-gray-600">Sessioni con una sola pagina</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Visitatori di Ritorno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.userEngagement.returnVisitorRate}%</div>
                <p className="text-xs text-gray-600">Utenti che ritornano</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tempo di Risposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.systemPerformance.averageResponseTime}ms</div>
                <p className="text-xs text-gray-600">Media API response time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics?.systemPerformance.errorRate}%</div>
                <p className="text-xs text-gray-600">Percentuale errori</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics?.systemPerformance.uptime}%</div>
                <p className="text-xs text-gray-600">Disponibilità sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Richieste API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.systemPerformance.apiRequestCount.toLocaleString()}</div>
                <p className="text-xs text-gray-600">Richieste questo mese</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Attività Sospette Rilevate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getSeverityColor(activity.severity)}>
                            {activity.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{activity.type}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Confidenza: {activity.confidence}%</span>
                          <span>Entità coinvolte: {activity.affectedEntities?.length || 0}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Investiga
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">Tutto OK!</h3>
                  <p className="text-gray-600">Nessuna attività sospetta rilevata</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}