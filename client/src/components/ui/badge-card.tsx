import { Badge, ProfessionalBadge } from "@wolfinder/shared";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  MessageSquare, 
  Star, 
  Calendar, 
  Trophy, 
  Shield, 
  Award, 
  Crown, 
  Zap, 
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface BadgeCardProps {
  badge: ProfessionalBadge & { badge: Badge };
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

const badgeIcons = {
  CheckCircle,
  MessageSquare,
  Star,
  Calendar,
  Trophy,
  Shield,
  Award,
  Crown,
  Zap,
  MessageCircle,
  HelpCircle
};

const badgeTypeStyles = {
  automatic: "bg-blue-50 border-blue-200 text-blue-700",
  verified: "bg-green-50 border-green-200 text-green-700",
  achievement: "bg-orange-50 border-orange-200 text-orange-700"
};

const badgeTypeLabels = {
  automatic: "Automatico",
  verified: "Verificato", 
  achievement: "Traguardo"
};

export function BadgeCard({ badge, size = "md", showDescription = true, className }: BadgeCardProps) {
  const IconComponent = badgeIcons[badge.badge.icon as keyof typeof badgeIcons] || HelpCircle;
  const isExpired = badge.expiresAt && new Date(badge.expiresAt) < new Date();
  const isRevoked = badge.revokedAt;
  
  const sizeClasses = {
    sm: "p-2 space-y-1",
    md: "p-3 space-y-2", 
    lg: "p-4 space-y-3"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative border rounded-lg transition-all duration-200 hover:shadow-md",
              badgeTypeStyles[badge.badge.type as keyof typeof badgeTypeStyles],
              sizeClasses[size],
              isExpired || isRevoked ? "opacity-50 grayscale" : "",
              className
            )}
            style={{ borderColor: badge.badge.color || undefined }}
          >
            {/* Badge Status Indicator */}
            {(isExpired || isRevoked) && (
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            )}

            {/* Badge Icon & Color */}
            <div className="flex items-center space-x-2">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: badge.badge.color ? badge.badge.color + '20' : undefined }}
              >
                <IconComponent 
                  className={cn(iconSizes[size])} 
                  style={{ color: badge.badge.color || undefined }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium truncate",
                  size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
                )}>
                  {badge.badge.name}
                </h4>
                
                {size !== "sm" && (
                  <p className="text-xs opacity-75">
                    {badgeTypeLabels[badge.badge.type as keyof typeof badgeTypeLabels]}
                  </p>
                )}
              </div>
            </div>

            {/* Badge Description */}
            {showDescription && size !== "sm" && (
              <p className={cn(
                "text-xs opacity-80 line-clamp-2",
                size === "lg" ? "text-sm" : ""
              )}>
                {badge.badge.description}
              </p>
            )}

            {/* Award Date */}
            {size !== "sm" && (
              <div className="flex items-center justify-between text-xs opacity-60">
                <span>
                  Ottenuto il {new Date(badge.awardedAt).toLocaleDateString('it-IT')}
                </span>
                {badge.expiresAt && (
                  <span className={isExpired ? "text-red-600" : ""}>
                    {isExpired ? "Scaduto" : `Scade il ${new Date(badge.expiresAt).toLocaleDateString('it-IT')}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{badge.badge.name}</p>
            <p className="text-sm">{badge.badge.description}</p>
            <div className="text-xs opacity-75 pt-1 border-t">
              <p>Tipo: {badgeTypeLabels[badge.badge.type as keyof typeof badgeTypeLabels]}</p>
              <p>Ottenuto: {new Date(badge.awardedAt).toLocaleDateString('it-IT')}</p>
              {badge.expiresAt && (
                <p>Scadenza: {new Date(badge.expiresAt).toLocaleDateString('it-IT')}</p>
              )}
              {isRevoked && (
                <p className="text-red-600">Revocato: {badge.revokeReason}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}