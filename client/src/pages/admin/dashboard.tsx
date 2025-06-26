import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

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
    conversionRate: number;
  };
  revenue: {
    monthToDate: number;
    projectedMonthly: number;
    subscriptionConversion: number;
    averageRevenue: number;
  };
}

interface PendingAction {
  id: number;
  title: string;
  description: string;
  icon: string;
  priority: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: pendingActions, isLoading: actionsLoading } = useQuery<PendingAction[]>({
    queryKey: ['/api/admin/pending-actions'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        {/* Metriche Operative Uniche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attività Oggi</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeUsers?.today || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers?.changePercent && stats?.activeUsers?.changePercent > 0 ? '+' : ''}{stats?.activeUsers?.changePercent || 0}% vs ieri
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Medio Verifica</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                24h
              </div>
              <p className="text-xs text-muted-foreground">
                Documenti professionali
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescita Settimanale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                +{stats?.professionals.newThisWeek || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Nuovi professionisti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversione</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.revenue?.subscriptionConversion || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Abbonamenti attivati
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Attività Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 py-2">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingActions && Array.isArray(pendingActions) && pendingActions.length > 0 ? (
                      pendingActions.slice(0, 5).map((action: any) => {
                        const getIcon = (iconName: string) => {
                          switch (iconName) {
                            case 'Shield': return <Shield className="h-4 w-4 text-blue-500" />;
                            case 'Star': return <Star className="h-4 w-4 text-yellow-500" />;
                            case 'UserCheck': return <CheckCircle className="h-4 w-4 text-green-500" />;
                            default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
                          }
                        };

                        const getPriorityColor = (priority: string) => {
                          switch (priority) {
                            case 'high': return 'text-red-600';
                            case 'medium': return 'text-yellow-600';
                            case 'low': return 'text-gray-600';
                            default: return 'text-gray-600';
                          }
                        };

                        const timeAgo = (date: string) => {
                          const now = new Date();
                          const actionDate = new Date(date);
                          const diffInMinutes = Math.floor((now.getTime() - actionDate.getTime()) / 60000);
                          
                          if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
                          if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ore fa`;
                          return `${Math.floor(diffInMinutes / 1440)} giorni fa`;
                        };

                        return (
                          <div key={action.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer">
                            <div className="flex items-center gap-3">
                              {getIcon(action.icon)}
                              <div>
                                <span className="text-sm font-medium">{action.title}</span>
                                <p className="text-xs text-gray-500">{action.description}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-muted-foreground">{timeAgo(action.createdAt)}</span>
                              <span className={`text-xs font-medium ${getPriorityColor(action.priority)}`}>
                                {action.priority === 'high' ? 'Urgente' : action.priority === 'medium' ? 'Medio' : 'Basso'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nessuna azione pending</p>
                        <p className="text-xs text-gray-400">Tutto sotto controllo!</p>
                      </div>
                    )}
                    
                    {pendingActions && Array.isArray(pendingActions) && pendingActions.length > 5 && (
                      <div className="pt-2 border-t">
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Vedi tutti ({pendingActions.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
                    <span className="text-sm font-semibold text-green-600">
                      +{stats?.professionals.newThisWeek || 0} questa settimana
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recensioni verificate</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {stats?.reviews.verified || 0} totali
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversione abbonamenti</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {stats?.revenue?.subscriptionConversion || 0}% conversion
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Gestione Professionisti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Gestisci verifiche e profili professionali.
                </p>
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Vai alla Gestione
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Moderazione Recensioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Modera e verifica le recensioni degli utenti.
                </p>
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Vai alla Moderazione
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Report Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Visualizza report dettagliati e analytics.
                </p>
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Vai agli Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}