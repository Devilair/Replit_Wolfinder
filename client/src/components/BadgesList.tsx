import { useState } from "react";
import { Badge, ProfessionalBadge } from "@wolfinder/shared";
import { BadgeCard } from "@/components/ui/badge-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Award, CheckCircle, Trophy } from "lucide-react";

interface BadgesListProps {
  badges: (ProfessionalBadge & { badge: Badge })[];
  isLoading?: boolean;
  onCheckAutomaticBadges?: () => void;
  canCheckBadges?: boolean;
}

export function BadgesList({ 
  badges, 
  isLoading = false, 
  onCheckAutomaticBadges,
  canCheckBadges = false
}: BadgesListProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Filtri per tipo di badge
  const automaticBadges = badges.filter(b => b.badge.type === "automatic");
  const verifiedBadges = badges.filter(b => b.badge.type === "verified");
  const achievementBadges = badges.filter(b => b.badge.type === "achievement");

  // Badge attivi (non revocati né scaduti)
  const activeBadges = badges.filter(b => {
    const isExpired = b.expiresAt && new Date(b.expiresAt) < new Date();
    const isRevoked = b.revokedAt;
    return !isExpired && !isRevoked;
  });

  const getFilteredBadges = () => {
    switch (activeTab) {
      case "automatic":
        return automaticBadges;
      case "verified":
        return verifiedBadges;
      case "achievement":
        return achievementBadges;
      case "active":
        return activeBadges;
      default:
        return badges;
    }
  };

  const filteredBadges = getFilteredBadges();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>I miei badge ({badges.length})</span>
          </CardTitle>
          
          {canCheckBadges && onCheckAutomaticBadges && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCheckAutomaticBadges}
              className="text-sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verifica nuovi badge
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {badges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun badge ancora
            </h3>
            <p className="text-gray-500 mb-4">
              Completa il tuo profilo e ottieni recensioni per sbloccare i primi badge automatici.
            </p>
            {canCheckBadges && onCheckAutomaticBadges && (
              <Button onClick={onCheckAutomaticBadges}>
                Verifica badge disponibili
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Filtri per tipo di badge */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="text-xs">
                  Tutti ({badges.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Attivi ({activeBadges.length})
                </TabsTrigger>
                <TabsTrigger value="automatic" className="text-xs">
                  Automatici ({automaticBadges.length})
                </TabsTrigger>
                <TabsTrigger value="verified" className="text-xs">
                  Verificati ({verifiedBadges.length})
                </TabsTrigger>
                <TabsTrigger value="achievement" className="text-xs">
                  Traguardi ({achievementBadges.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {filteredBadges.length === 0 ? (
                  <div className="text-center py-8">
                    <Filter className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      Nessun badge trovato per questo filtro.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBadges.map((badge) => (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        size="md"
                        showDescription={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}