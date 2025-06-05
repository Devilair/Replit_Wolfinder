import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  requiredPlan: 'Professionale' | 'Premium';
  currentPlan: string;
  description: string;
}

export function UpgradePrompt({ feature, requiredPlan, currentPlan, description }: UpgradePromptProps) {
  const getIcon = () => {
    switch (requiredPlan) {
      case 'Professionale':
        return <Zap className="h-8 w-8 text-blue-500" />;
      case 'Premium':
        return <Crown className="h-8 w-8 text-purple-500" />;
      default:
        return <Lock className="h-8 w-8 text-gray-400" />;
    }
  };

  const getPrice = () => {
    switch (requiredPlan) {
      case 'Professionale':
        return '€29/mese';
      case 'Premium':
        return '€59/mese';
      default:
        return '';
    }
  };

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5 text-gray-400" />
          {feature}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center items-center gap-2">
          <Badge variant="outline">{currentPlan}</Badge>
          <span className="text-gray-400">→</span>
          <Badge variant="default">{requiredPlan}</Badge>
        </div>
        
        <div className="text-2xl font-bold text-gray-900">
          {getPrice()}
        </div>
        
        <div className="space-y-2">
          <Button className="w-full" size="lg">
            Aggiorna a {requiredPlan}
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            Confronta tutti i piani
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}