import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeProgressCard } from "@/components/BadgeProgressCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge, ProfessionalBadge } from "@shared/schema";
import { Award, TrendingUp, Clock, RefreshCw } from "lucide-react";

export default function ProfessionalBadgesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch badge progress data
  const { data: badgeProgress = [], isLoading } = useQuery({
    queryKey: ["/api/professional/badges/progress"],
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
      
      // Refresh badge progress
      queryClient.invalidateQueries({ queryKey: ["/api/professional/badges/progress"] });
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
  const earnedBadges = badgeProgress.filter(bp => bp.isEarned);
  const almostEarnedBadges = badgeProgress.filter(bp => !bp.isEarned && bp.progress >= 80);
  const inProgressBadges = badgeProgress.filter(bp => !bp.isEarned && bp.progress > 0 && bp.progress < 80);

  // Group badges by type
  const badgesByType = {
    all: badgeProgress,
    earned: earnedBadges,
    almost: almostEarnedBadges,
    inProgress: inProgressBadges,
    notStarted: badgeProgress.filter(bp => !bp.isEarned && bp.progress === 0)
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">I miei badge</h1>
          <p className="text-muted-foreground">
            Caricamento progresso badge...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">I miei badge</h1>
          <p className="text-muted-foreground">
            Gestisci e monitora i tuoi badge di qualità professionale
          </p>
        </div>
        <Button 
          onClick={() => checkBadgesMutation.mutate()}
          disabled={checkBadgesMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${checkBadgesMutation.isPending ? 'animate-spin' : ''}`} />
          Controlla Badge
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badge Ottenuti</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              su {badgeProgress.length} disponibili
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quasi Completati</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{almostEarnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              80%+ completati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Corso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressBadges.length}</div>
            <p className="text-xs text-muted-foreground">
              In sviluppo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Totale</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {badgeProgress.length > 0 ? Math.round((earnedBadges.length / badgeProgress.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badge Progress Cards */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Tutti ({badgesByType.all.length})
          </TabsTrigger>
          <TabsTrigger value="earned">
            Ottenuti ({badgesByType.earned.length})
          </TabsTrigger>
          <TabsTrigger value="almost">
            Quasi ({badgesByType.almost.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Corso ({badgesByType.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="notStarted">
            Da Iniziare ({badgesByType.notStarted.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(badgesByType).map(([key, badges]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {badges.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessun badge in questa categoria
                  </h3>
                  <p className="text-gray-500">
                    {key === 'earned' && "Non hai ancora ottenuto badge. Completa i requisiti per sbloccarli!"}
                    {key === 'almost' && "Nessun badge è vicino al completamento."}
                    {key === 'inProgress' && "Nessun badge è attualmente in corso."}
                    {key === 'notStarted' && "Tutti i badge sono stati iniziati!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badgeData, index) => (
                  <BadgeProgressCard
                    key={badgeData.badge.id}
                    badgeProgress={badgeData}
                    onAction={() => checkBadgesMutation.mutate()}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}