import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Activity,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

interface AdminStats {
  totalUsers: string;
  newUsersThisWeek: string;
  activeUsersToday: string;
  activeUsersWeek: string;
  activeUsersMonth: string;
  totalProfessionals: string;
  verifiedProfessionals: string;
  totalReviews: string;
  verifiedReviews: string;
  pendingReviews: string;
  rejectedReviews: string;
  newReviewsToday: string;
  averageRating: string;
  averageVerificationTime: string;
  conversionRate: string;
}

interface ReviewAnalytics {
  totalReviews: number;
  verifiedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  averageRating: string;
  averageVerificationTime: string;
}

interface ProfessionalsByCategory {
  categoryName: string;
  categoryId: number;
  count: number;
  verified: number;
  avgRating: string;
}

interface AdvancedMetrics {
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    avgSessionDuration: string;
    returnVisitorRate: string;
  };
  businessMetrics: {
    verificationRate: string;
    premiumConversionRate: string;
    totalProfessionals: number;
    verifiedProfessionals: number;
    premiumProfessionals: number;
  };
  systemPerformance: {
    avgResponseTime: string;
    uptime: string;
    errorRate: string;
  };
}

interface SuspiciousActivity {
  rapidReviewers: Array<{
    userId: number;
    reviewCount: number;
    userName: string;
    userEmail: string;
    severity: string;
  }>;
  suspiciousRatings: Array<{
    professionalId: number;
    businessName: string;
    reviewCount: number;
    avgRating: string;
    severity: string;
  }>;
}

interface GeographicDistribution {
  city: string;
  province: string;
  totalProfessionals: number;
  verifiedProfessionals: number;
  avgRating: string;
  verificationRate: string;
}

export default function AdvancedDashboard() {
  // Fetch all advanced analytics data
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: reviewAnalytics } = useQuery<ReviewAnalytics>({
    queryKey: ["/api/admin/analytics/reviews"],
  });

  const { data: professionalsByCategory } = useQuery<ProfessionalsByCategory[]>({
    queryKey: ["/api/admin/analytics/professionals-by-category"],
  });

  const { data: advancedMetrics } = useQuery<AdvancedMetrics>({
    queryKey: ["/api/admin/analytics/advanced-metrics"],
  });

  const { data: suspiciousActivity } = useQuery<SuspiciousActivity>({
    queryKey: ["/api/admin/security/suspicious-activity"],
  });

  const { data: geographicDistribution } = useQuery<GeographicDistribution[]>({
    queryKey: ["/api/admin/analytics/geographic-distribution"],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Amministrativa Avanzata</h1>
          <p className="text-muted-foreground">
            Sistema completo di monitoraggio e gestione per Wolfinder
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="professionals">Professionisti</TabsTrigger>
          <TabsTrigger value="security">Sicurezza</TabsTrigger>
          <TabsTrigger value="geographic">Geografia</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Critici */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utenti Attivi Oggi</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeUsersToday || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeUsersWeek || '0'} questa settimana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuove Recensioni</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.newReviewsToday || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingReviews || '0'} in attesa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasso Conversione</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.conversionRate || '0'}%</div>
                <p className="text-xs text-muted-foreground">
                  Verifica professionisti
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating Medio</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageRating || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Su {stats?.verifiedReviews || '0'} recensioni
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attività Critiche */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Code di Lavoro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recensioni in attesa</span>
                  <Badge variant={parseInt(stats?.pendingReviews || '0') > 10 ? 'destructive' : 'default'}>
                    {stats?.pendingReviews || '0'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Professionisti non verificati</span>
                  <Badge variant="secondary">
                    {(parseInt(stats?.totalProfessionals || '0') - parseInt(stats?.verifiedProfessionals || '0')).toString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo medio verifica</span>
                  <span className="text-sm font-medium">{stats?.averageVerificationTime || '0'}h</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuzione Recensioni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Verificate</span>
                    <span>{stats?.verifiedReviews || '0'}</span>
                  </div>
                  <Progress 
                    value={parseInt(stats?.verifiedReviews || '0') / parseInt(stats?.totalReviews || '1') * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>In attesa</span>
                    <span>{stats?.pendingReviews || '0'}</span>
                  </div>
                  <Progress 
                    value={parseInt(stats?.pendingReviews || '0') / parseInt(stats?.totalReviews || '1') * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rifiutate</span>
                    <span>{stats?.rejectedReviews || '0'}</span>
                  </div>
                  <Progress 
                    value={parseInt(stats?.rejectedReviews || '0') / parseInt(stats?.totalReviews || '1') * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Utenti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Utenti attivi oggi</span>
                  <span className="font-medium">{stats?.activeUsersToday || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Utenti attivi settimana</span>
                  <span className="font-medium">{stats?.activeUsersWeek || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Utenti attivi mese</span>
                  <span className="font-medium">{stats?.activeUsersMonth || '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Recensioni</CardTitle>
                <CardDescription>Statistiche dettagliate sulle recensioni</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewAnalytics && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reviewAnalytics.verifiedReviews}
                        </div>
                        <div className="text-sm text-muted-foreground">Verificate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {reviewAnalytics.pendingReviews}
                        </div>
                        <div className="text-sm text-muted-foreground">In attesa</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Rating medio</span>
                        <span className="font-medium">{reviewAnalytics.averageRating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tempo medio verifica</span>
                        <span className="font-medium">{reviewAnalytics.averageVerificationTime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recensioni segnalate</span>
                        <span className="font-medium">{reviewAnalytics.flaggedReviews}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metriche Business</CardTitle>
                <CardDescription>KPI di business e performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {advancedMetrics && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasso di verifica</span>
                        <Badge variant="outline">
                          {advancedMetrics.businessMetrics.verificationRate}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Conversione Premium</span>
                        <Badge variant="outline">
                          {advancedMetrics.businessMetrics.premiumConversionRate}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Utenti attivi giornalieri</span>
                        <span className="font-medium">
                          {advancedMetrics.userEngagement.dailyActiveUsers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Durata sessione media</span>
                        <span className="font-medium">
                          {advancedMetrics.userEngagement.avgSessionDuration}min
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="professionals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professionisti per Categoria</CardTitle>
              <CardDescription>Distribuzione e performance per categoria professionale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {professionalsByCategory?.map((category) => (
                  <div key={category.categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{category.categoryName}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.count} professionisti totali
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">{category.verified}</div>
                        <div className="text-xs text-muted-foreground">Verificati</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{category.avgRating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <Badge variant="outline">
                        {Math.round((category.verified / category.count) * 100)}% verificati
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Attività Sospette
                </CardTitle>
                <CardDescription>Rilevamento automatico di comportamenti anomali</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suspiciousActivity?.rapidReviewers && suspiciousActivity.rapidReviewers.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">Recensioni Rapide</h4>
                    {suspiciousActivity.rapidReviewers.map((reviewer) => (
                      <div key={reviewer.userId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{reviewer.userName}</div>
                          <div className="text-xs text-muted-foreground">{reviewer.userEmail}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{reviewer.reviewCount} recensioni</span>
                          <Badge variant={getSeverityColor(reviewer.severity) as any}>
                            {reviewer.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2" />
                    <p>Nessuna attività sospetta rilevata</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-yellow-500" />
                  Rating Anomali
                </CardTitle>
                <CardDescription>Professionisti con pattern di rating sospetti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {suspiciousActivity?.suspiciousRatings && suspiciousActivity.suspiciousRatings.length > 0 ? (
                  <div className="space-y-3">
                    {suspiciousActivity.suspiciousRatings.map((rating) => (
                      <div key={rating.professionalId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{rating.businessName}</div>
                          <div className="text-xs text-muted-foreground">
                            {rating.reviewCount} recensioni
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Rating: {rating.avgRating}</span>
                          <Badge variant={getSeverityColor(rating.severity) as any}>
                            {rating.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Nessun pattern anomalo rilevato</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distribuzione Geografica
              </CardTitle>
              <CardDescription>Professionisti per città (Ferrara e Livorno)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicDistribution?.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{location.city}, {location.province}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.totalProfessionals} professionisti totali
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-green-600">
                          {location.verifiedProfessionals}
                        </div>
                        <div className="text-xs text-muted-foreground">Verificati</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{location.avgRating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <Badge variant="outline">
                        {location.verificationRate}% verificati
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Tempo di Risposta</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {advancedMetrics?.systemPerformance.avgResponseTime || '0'}ms
                </div>
                <p className="text-sm text-muted-foreground mt-2">Tempo medio API</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Uptime Sistema</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {advancedMetrics?.systemPerformance.uptime || '0'}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">Disponibilità</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Tasso Errori</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {advancedMetrics?.systemPerformance.errorRate || '0'}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">Errori sistema</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}