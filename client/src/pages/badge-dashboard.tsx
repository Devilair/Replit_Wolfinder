import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Star, TrendingUp, Shield, Clock, Users, Target, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BadgeData {
  id: number;
  name: string;
  slug: string;
  family: string;
  icon: string;
  color: string;
  description: string;
  requirements: string[];
  priority: number;
  isActive: boolean;
}

interface ProfessionalBadge {
  id: number;
  badgeId: number;
  professionalId: number;
  earnedAt: string;
  awardedBy: string;
  isVisible: boolean;
  badge: BadgeData;
}

const FAMILY_ICONS = {
  esperienza: Award,
  qualita: Star,
  engagement: Users,
  eccellenza: Shield
};

const FAMILY_COLORS = {
  esperienza: "text-blue-600 bg-blue-50",
  qualita: "text-yellow-600 bg-yellow-50", 
  engagement: "text-green-600 bg-green-50",
  eccellenza: "text-purple-600 bg-purple-50"
};

export default function BadgeDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFamily, setSelectedFamily] = useState<string>("all");

  const { data: allBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/badges"],
  });

  const { data: professionalBadges, isLoading: profBadgesLoading } = useQuery({
    queryKey: ["/api/auth/user", "badges"],
    queryFn: async () => {
      const user = await apiRequest("GET", "/api/auth/user");
      if (user.professional?.id) {
        return await apiRequest("GET", `/api/professionals/${user.professional.id}/badges`);
      }
      return [];
    }
  });

  const initializeBadgesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/badges/initialize"),
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Sistema badge inizializzato correttamente"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante l'inizializzazione dei badge",
        variant: "destructive"
      });
    }
  });

  const evaluateBadgesMutation = useMutation({
    mutationFn: (professionalId: number) => 
      apiRequest("POST", `/api/badges/evaluate/${professionalId}`),
    onSuccess: (result) => {
      toast({
        title: "Valutazione completata",
        description: `${result.awarded?.length || 0} nuovi badge assegnati`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user", "badges"] });
    }
  });

  const filteredBadges = allBadges?.filter((badge: BadgeData) => 
    selectedFamily === "all" || badge.family === selectedFamily
  ) || [];

  const earnedBadgeIds = professionalBadges?.map((pb: ProfessionalBadge) => pb.badgeId) || [];

  const badgeStats = {
    total: allBadges?.length || 0,
    earned: professionalBadges?.length || 0,
    byFamily: {
      esperienza: professionalBadges?.filter((pb: ProfessionalBadge) => 
        pb.badge.family === "esperienza").length || 0,
      qualita: professionalBadges?.filter((pb: ProfessionalBadge) => 
        pb.badge.family === "qualita").length || 0,
      engagement: professionalBadges?.filter((pb: ProfessionalBadge) => 
        pb.badge.family === "engagement").length || 0,
      eccellenza: professionalBadges?.filter((pb: ProfessionalBadge) => 
        pb.badge.family === "eccellenza").length || 0,
    }
  };

  // Data for progress charts
  const progressData = [
    { name: 'Esperienza', earned: badgeStats.byFamily.esperienza, total: 4, color: '#3B82F6' },
    { name: 'Qualità', earned: badgeStats.byFamily.qualita, total: 4, color: '#F59E0B' },
    { name: 'Engagement', earned: badgeStats.byFamily.engagement, total: 4, color: '#10B981' },
    { name: 'Eccellenza', earned: badgeStats.byFamily.eccellenza, total: 4, color: '#8B5CF6' },
  ];

  const overallProgress = badgeStats.total > 0 ? (badgeStats.earned / badgeStats.total) * 100 : 0;

  if (badgesLoading || profBadgesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema Badge Meritocratico</h1>
          <p className="text-muted-foreground">
            Gestisci e monitora i badge dei professionisti
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => initializeBadgesMutation.mutate()}
            disabled={initializeBadgesMutation.isPending}
            variant="outline"
          >
            {initializeBadgesMutation.isPending ? "Inizializzando..." : "Inizializza Badge"}
          </Button>
        </div>
      </div>

      {/* Badge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Badge Totali</p>
                <p className="text-2xl font-bold">{badgeStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Badge Ottenuti</p>
                <p className="text-2xl font-bold">{badgeStats.earned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(badgeStats.byFamily).map(([family, count]) => {
          const Icon = FAMILY_ICONS[family as keyof typeof FAMILY_ICONS];
          return (
            <Card key={family}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{family}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progresso per Famiglia
            </CardTitle>
            <CardDescription>
              Visualizza il progresso dei badge diviso per famiglia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earned" fill="#8884d8" name="Ottenuti" />
                <Bar dataKey="total" fill="#e0e0e0" name="Totali" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso Complessivo
            </CardTitle>
            <CardDescription>
              {badgeStats.earned} di {badgeStats.total} badge ottenuti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Ottenuti', value: badgeStats.earned, fill: '#10B981' },
                      { name: 'Rimanenti', value: badgeStats.total - badgeStats.earned, fill: '#e0e0e0' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Ottenuti', value: badgeStats.earned, fill: '#10B981' },
                      { name: 'Rimanenti', value: badgeStats.total - badgeStats.earned, fill: '#e0e0e0' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {overallProgress.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Completamento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedFamily} onValueChange={setSelectedFamily}>
        <TabsList>
          <TabsTrigger value="all">Tutti i Badge</TabsTrigger>
          <TabsTrigger value="esperienza">Esperienza</TabsTrigger>
          <TabsTrigger value="qualita">Qualità</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="eccellenza">Eccellenza</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedFamily} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge: BadgeData) => {
              const isEarned = earnedBadgeIds.includes(badge.id);
              const Icon = FAMILY_ICONS[badge.family as keyof typeof FAMILY_ICONS] || Award;
              
              return (
                <Card 
                  key={badge.id} 
                  className={`transition-all ${isEarned ? 'ring-2 ring-green-500' : 'opacity-70'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${FAMILY_COLORS[badge.family as keyof typeof FAMILY_COLORS]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {badge.family}
                          </Badge>
                        </div>
                      </div>
                      {isEarned && (
                        <Badge variant="default" className="bg-green-600">
                          Ottenuto
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-3">
                      {badge.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Requisiti:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {badge.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}