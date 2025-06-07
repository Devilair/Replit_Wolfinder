import { Badge, ProfessionalBadge } from "@shared/schema";
import { BadgeCard } from "@/components/ui/badge-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface BadgesWidgetProps {
  badges: (ProfessionalBadge & { badge: Badge })[];
  isLoading?: boolean;
  maxDisplay?: number;
}

export function BadgesWidget({ 
  badges, 
  isLoading = false, 
  maxDisplay = 3 
}: BadgesWidgetProps) {
  // Mostra solo i badge attivi (non scaduti né revocati)
  const activeBadges = badges.filter(b => {
    const isExpired = b.expiresAt && new Date(b.expiresAt) < new Date();
    const isRevoked = b.revokedAt;
    return !isExpired && !isRevoked;
  });

  // Priorità: verified > achievement > automatic, poi per data di ottenimento
  const sortedBadges = activeBadges.sort((a, b) => {
    const priorityOrder = { verified: 3, achievement: 2, automatic: 1 };
    const aPriority = priorityOrder[a.badge.type as keyof typeof priorityOrder];
    const bPriority = priorityOrder[b.badge.type as keyof typeof priorityOrder];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime();
  });

  const displayBadges = sortedBadges.slice(0, maxDisplay);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">I miei badge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>I miei badge</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {activeBadges.length} attivi
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {activeBadges.length === 0 ? (
          <div className="text-center py-6">
            <Award className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              Nessun badge ancora
            </p>
            <Link href="/dashboard/professional/badges">
              <Button size="sm" variant="outline" className="text-xs">
                Scopri come ottenerli
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {displayBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                size="sm"
                showDescription={false}
                className="cursor-pointer hover:shadow-sm"
              />
            ))}
            
            {activeBadges.length > maxDisplay && (
              <Link href="/dashboard/professional/badges">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs mt-2"
                >
                  Vedi tutti ({activeBadges.length})
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}