import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgesList } from "@/components/BadgesList";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, ProfessionalBadge } from "@shared/schema";
import { Award, TrendingUp, Clock } from "lucide-react";

export default function ProfessionalBadgesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch professional badges
  const { data: badges = [], isLoading } = useQuery<(ProfessionalBadge & { badge: Badge })[]>({
    queryKey: ["/api/professional/badges"],
  });

  // Check automatic badges mutation
  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/professional/badges/check-automatic");
    },
    onSuccess: (data) => {
      toast({
        title: "Badge verificati",
        description: data.message,
        variant: data.newBadges.length > 0 ? "default" : "default",
      });
      
      // Refresh badges list
      queryClient.invalidateQueries({ queryKey: ["/api/professional/badges"] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile verificare i badge automatici",
        variant: "destructive",
      });
    },
  });

  // Badge statistics
  const activeBadges = badges.filter(b => {
    const isExpired = b.expiresAt && new Date(b.expiresAt) < new Date();
    const isRevoked = b.revokedAt;
    return !isExpired && !isRevoked;
  });

  const recentBadges = badges.filter(b => {
    const awardedDate = new Date(b.awardedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return awardedDate > weekAgo;
  });

  const badgeTypes = {
    automatic: badges.filter(b => b.badge.type === "automatic").length,
    verified: badges.filter(b => b.badge.type === "verified").length,
    achievement: badges.filter(b => b.badge.type === "achievement").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">I miei badge</h1>
        <p className="text-muted-foreground">
          Gestisci e monitora i tuoi badge di qualità professionale
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badge Attivi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              su {badges.length} totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuovi Questa Settimana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              {recentBadges.length > 0 ? "Continua così!" : "Continua a migliorare"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badge Verificati</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgeTypes.verified}</div>
            <p className="text-xs text-muted-foreground">
              Certificazioni ufficiali
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuzione per tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{badgeTypes.automatic}</div>
              <div className="text-sm text-blue-600">Badge Automatici</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ottenuti automaticamente
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{badgeTypes.verified}</div>
              <div className="text-sm text-green-600">Badge Verificati</div>
              <div className="text-xs text-muted-foreground mt-1">
                Verificati dallo staff
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{badgeTypes.achievement}</div>
              <div className="text-sm text-orange-600">Traguardi</div>
              <div className="text-xs text-muted-foreground mt-1">
                Obiettivi raggiunti
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Badges List */}
      <BadgesList
        badges={badges}
        isLoading={isLoading}
        onCheckAutomaticBadges={() => checkBadgesMutation.mutate()}
        canCheckBadges={true}
      />

      {/* How to Earn More Badges */}
      {badges.length < 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Come ottenere più badge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Badge Automatici</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Completa il profilo al 100%</li>
                  <li>• Ottieni recensioni positive</li>
                  <li>• Mantieni un alto rating</li>
                  <li>• Aggiorna regolarmente le informazioni</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Badge Verificati</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Carica documenti di verifica</li>
                  <li>• Conferma appartenenza ad ordini professionali</li>
                  <li>• Partecipa a controlli di qualità</li>
                  <li>• Mantieni standard elevati</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}