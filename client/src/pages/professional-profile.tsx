import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  MessageSquare,
  Euro,
  Clock,
  Shield,
  User,
  Building
} from "lucide-react";
import { useState } from "react";
import ClaimProfileDialog from "@/components/claim-profile-dialog";

export default function ProfessionalProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const { data: professional, isLoading } = useQuery({
    queryKey: ["/api/professionals", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Professionista non trovato</h1>
          <p className="text-gray-600 mb-4">Il professionista che stai cercando non esiste.</p>
          <Button onClick={() => setLocation("/")}>Torna alla home</Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatPrice = (min?: number, max?: number, unit?: string) => {
    if (!min && !max) return "Prezzo su richiesta";
    if (min && max && min !== max) {
      return `€${min} - €${max}${unit ? `/${unit}` : ""}`;
    }
    return `€${min || max}${unit ? `/${unit}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          ← Torna ai risultati
        </Button>

        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {professional.businessName}
                </CardTitle>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {professional.category?.name}
                  </Badge>
                  {professional.isVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verificato
                    </Badge>
                  )}
                  {!professional.isClaimed && (
                    <Badge variant="outline" className="border-orange-300 text-orange-600">
                      <User className="w-3 h-3 mr-1" />
                      Non reclamato
                    </Badge>
                  )}
                </div>
                
                {/* Rating */}
                {professional.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">{renderStars(professional.rating)}</div>
                    <span className="text-sm text-gray-600">
                      {professional.rating.toFixed(1)} ({professional.reviewCount} recensioni)
                    </span>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{professional.address}, {professional.city} ({professional.province})</span>
                </div>
              </div>

              {/* Claim Button */}
              {!professional.isClaimed && (
                <Button 
                  onClick={() => setShowClaimDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Reclama questo profilo
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Descrizione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {professional.description || "Nessuna descrizione disponibile."}
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            {professional.services && professional.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Servizi offerti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {professional.services.map((service: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recensioni ({professional.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {professional.reviews && professional.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {professional.reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.user?.name || "Utente anonimo"}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-medium mb-1">{review.title}</h4>
                        )}
                        <p className="text-gray-700">{review.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nessuna recensione disponibile
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contatti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {professional.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${professional.phone}`} className="text-blue-600 hover:underline">
                      {professional.phone}
                    </a>
                  </div>
                )}
                {professional.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href={`mailto:${professional.email}`} className="text-blue-600 hover:underline">
                      {professional.email}
                    </a>
                  </div>
                )}
                {professional.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a 
                      href={professional.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Sito web
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  Tariffe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-900">
                  {formatPrice(professional.priceRangeMin, professional.priceRangeMax, professional.priceUnit)}
                </p>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni aggiuntive</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Su Wolfinder dal {new Date(professional.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {professional.yearsOfExperience && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {professional.yearsOfExperience} anni di esperienza
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Claim Profile Dialog */}
      <ClaimProfileDialog
        isOpen={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        professional={professional}
      />
    </div>
  );
}