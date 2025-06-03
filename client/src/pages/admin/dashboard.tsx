import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, MessageSquare, Building2, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/admin/recent-activity"],
  });

  const { data: pendingReviews } = useQuery({
    queryKey: ["/api/admin/pending-reviews"],
  });

  const { data: unverifiedProfessionals } = useQuery({
    queryKey: ["/api/admin/unverified-professionals"],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Amministrativa</h1>
        <p className="text-gray-600 mt-2">Panoramica generale della piattaforma Wolfinder</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newUsersThisWeek || 0} questa settimana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionisti</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProfessionals || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.verifiedProfessionals || 0} verificati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recensioni</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingReviews || 0} in attesa di moderazione
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valutazione Media</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating || "0.0"}/5</div>
            <p className="text-xs text-muted-foreground">
              Piattaforma generale
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Azioni Richieste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReviews && pendingReviews.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Recensioni da moderare</p>
                  <p className="text-sm text-gray-600">{pendingReviews.length} recensioni in attesa</p>
                </div>
                <Link href="/admin/reviews">
                  <Badge variant="secondary">Modera</Badge>
                </Link>
              </div>
            )}

            {unverifiedProfessionals && unverifiedProfessionals.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Professionisti da verificare</p>
                  <p className="text-sm text-gray-600">{unverifiedProfessionals.length} profili in attesa</p>
                </div>
                <Link href="/admin/professionals">
                  <Badge variant="secondary">Verifica</Badge>
                </Link>
              </div>
            )}

            {(!pendingReviews || pendingReviews.length === 0) && 
             (!unverifiedProfessionals || unverifiedProfessionals.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Tutto in ordine!</p>
                <p className="text-sm">Non ci sono azioni richieste al momento.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nessuna attività recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/professionals/new" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Aggiungi Professionista</p>
            </Link>
            
            <Link href="/admin/categories" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Gestisci Categorie</p>
            </Link>
            
            <Link href="/admin/reviews" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Modera Recensioni</p>
            </Link>
            
            <Link href="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Gestisci Utenti</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}