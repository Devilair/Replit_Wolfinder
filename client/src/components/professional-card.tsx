import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/star-rating";
import { MapPin, Shield, Euro } from "lucide-react";
import type { ProfessionalSummary } from "@shared/schema";

interface ProfessionalCardProps {
  professional: ProfessionalSummary;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const priceRange = professional.priceRangeMin && professional.priceRangeMax
    ? `€${professional.priceRangeMin}-${professional.priceRangeMax}/${professional.priceUnit}`
    : "Prezzo su richiesta";

  return (
    <Link href={`/professional/${professional.id}`}>
      <Card className="hover:shadow-xl transition-shadow cursor-pointer">
        <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-blue-600">
                {professional.businessName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {professional.businessName}
              </h3>
              <p className="text-gray-500 mb-1">{professional.category.name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {professional.city}, {professional.province}
              </div>
            </div>
          </div>
          {professional.isVerified && (
            <Badge className="bg-green-100 text-green-700">
              <Shield className="w-3 h-3 mr-1" />
              Verificato
            </Badge>
          )}
        </div>
        
        <div className="flex items-center mb-4">
          <StarRating rating={Number(professional.rating)} size="sm" />
          <span className="ml-2 font-semibold text-gray-800">
            {Number(professional.rating).toFixed(1)}
          </span>
          <span className="text-gray-500 ml-1">
            ({professional.reviewCount} recensioni)
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {professional.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-blue-600 font-semibold">
            <Euro className="w-4 h-4 mr-1" />
            {priceRange}
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Vedi Profilo
          </Button>
        </div>
        </CardContent>
      </Card>
    </Link>
  );
}
