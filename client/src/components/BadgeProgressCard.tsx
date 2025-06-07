import { Badge, ProfessionalBadge } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Lock, Trophy, Star, Shield, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeRequirement {
  description: string;
  current: number;
  target: number;
  completed: boolean;
  suggestion?: string;
}

interface BadgeProgressData {
  badge: Badge;
  isEarned: boolean;
  progress: number; // 0-100
  requirements: BadgeRequirement[];
  earnedBadge?: ProfessionalBadge;
}

interface BadgeProgressCardProps {
  badgeProgress: BadgeProgressData;
  onAction?: () => void;
}

const getBadgeIcon = (type: string, isEarned: boolean) => {
  const iconClass = cn(
    "w-6 h-6",
    isEarned ? "text-yellow-500" : "text-gray-400"
  );

  switch (type) {
    case "automatic":
      return <Trophy className={iconClass} />;
    case "verified":
      return <Shield className={iconClass} />;
    case "achievement":
      return <Award className={iconClass} />;
    default:
      return <Star className={iconClass} />;
  }
};

const getStatusColor = (progress: number, isEarned: boolean) => {
  if (isEarned) return "text-green-600 bg-green-50";
  if (progress >= 80) return "text-orange-600 bg-orange-50";
  if (progress >= 40) return "text-blue-600 bg-blue-50";
  return "text-gray-600 bg-gray-50";
};

const getStatusText = (progress: number, isEarned: boolean) => {
  if (isEarned) return "Ottenuto";
  if (progress >= 80) return "Quasi completato";
  if (progress >= 40) return "In corso";
  return "Non iniziato";
};

export function BadgeProgressCard({ badgeProgress, onAction }: BadgeProgressCardProps) {
  const { badge, isEarned, progress, requirements = [] } = badgeProgress;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isEarned && "ring-2 ring-green-200",
      progress >= 80 && !isEarned && "ring-2 ring-orange-200"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getBadgeIcon(badge.type, isEarned)}
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {badge.name}
                {isEarned && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {badge.description}
              </p>
            </div>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(progress, isEarned)
          )}>
            {getStatusText(progress, isEarned)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {!isEarned && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Requirements List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {isEarned ? "Requisiti completati:" : "Requisiti:"}
          </h4>
          <div className="space-y-2">
            {requirements && requirements.length > 0 ? requirements.map((req, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {req.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    req.completed ? "text-green-700" : "text-gray-700"
                  )}>
                    {req.text || req.description}
                  </p>
                  {!req.completed && req.current !== undefined && req.target !== undefined && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-xs text-gray-500">
                        {req.current}/{req.target}
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={(req.current / req.target) * 100} 
                          className="h-1" 
                        />
                      </div>
                    </div>
                  )}
                  {req.suggestion && !req.completed && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      💡 {req.suggestion}
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Nessun requisito specifico disponibile.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {!isEarned && progress >= 80 && onAction && (
          <Button 
            onClick={onAction}
            className="w-full"
            variant="default"
          >
            Verifica Badge
          </Button>
        )}

        {/* Badge Details */}
        {isEarned && badgeProgress.earnedAt && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Ottenuto il:</strong> {' '}
              {new Date(badgeProgress.earnedAt).toLocaleDateString('it-IT')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}