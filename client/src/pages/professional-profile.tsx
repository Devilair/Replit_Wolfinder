import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Mail, Globe, Award, Users, TrendingUp, Eye, Calendar, Shield, ChevronRight, ExternalLink, Heart, User, Target, CheckCircle, Building, Smartphone, MessageCircle, Flag, Share2, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import InteractiveMap from "@/components/InteractiveMap";
import type { ProfessionalWithDetails, ReviewWithDetails, ProfessionalBadge, User as UserType, ProfessionalCertification, ProfessionalSpecialization } from "@shared/schema";

// Define a specific type for Ranking data, as it's a custom object
interface Ranking {
  cityRank: number;
  cityTotal: number;
  categoryRank: number;
  categoryTotal: number;
}

// Define a more specific type for the badges data we expect
interface BadgeWithDetails extends ProfessionalBadge {
  badge: {
    name: string;
    description: string;
    icon: string;
  }
}

export default function ProfessionalProfile() {
  const { id } = useParams();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const professionalIdNum = parseInt(id || "0", 10);

  // --- DATA FETCHING ---
  const { data: professional, isLoading: loadingProfessional } = useQuery<ProfessionalWithDetails | undefined>({
    queryKey: ['professional', id],
    queryFn: () => fetch(`/api/professionals/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: badges, isLoading: loadingBadges } = useQuery<BadgeWithDetails[]>({
    queryKey: ['professionalBadges', id],
    queryFn: () => fetch(`/api/professionals/${id}/badges`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery<ReviewWithDetails[]>({
    queryKey: ['professionalReviews', id],
    queryFn: () => fetch(`/api/professionals/${id}/reviews`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: ranking, isLoading: loadingRanking } = useQuery<Ranking>({
    queryKey: ['professionalRanking', id],
    queryFn: () => fetch(`/api/professionals/${id}/ranking`).then(res => res.json()),
    initialData: { cityRank: 0, cityTotal: 0, categoryRank: 0, categoryTotal: 0 },
    enabled: !!id,
  });

  const { data: specializations } = useQuery<ProfessionalSpecialization[]>({
    queryKey: ['professionalSpecializations', id],
    queryFn: () => fetch(`/api/professionals/${id}/specializations`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: certifications } = useQuery<ProfessionalCertification[]>({
    queryKey: ['professionalCertifications', id],
    queryFn: () => fetch(`/api/professionals/${id}/certifications`).then(res => res.json()),
    enabled: !!id,
  });

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ['currentUser'],
    queryFn: () => {
      const token = localStorage.getItem('authToken');
      if (!token) return Promise.resolve(null);
      return fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null);
    }
  });

  const isProfessionalOwner = currentUser && currentUser.role === 'professional' && professional && professional.userId === currentUser.id;

  // --- RENDER LOGIC ---

  if (loadingProfessional || loadingBadges || loadingReviews || loadingRanking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Caricamento profilo...</p>
        </motion.div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Professionista non trovato
          </h1>
          <p className="text-gray-500 max-w-md">Il professionista che stai cercando non esiste o non è più disponibile nella nostra piattaforma.</p>
        </motion.div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div className="relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div className="flex flex-col lg:flex-row items-center gap-8 text-white" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div className="flex-shrink-0" variants={itemVariants} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl font-bold shadow-2xl border border-white/20">
                  {professional.businessName?.substring(0, 2).toUpperCase() || "PR"}
                </div>
                {professional.isVerified && (
                  <motion.div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 500 }}>
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.div className="flex-1 text-center lg:text-left" variants={itemVariants}>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <h2 className="text-lg text-blue-100 font-medium">
                  {professional.user?.name || "Professionista"}
                </h2>
                {!professional.isClaimed && (
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1">
                    Reclama Profilo
                  </Button>
                )}
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {professional.businessName || "Studio Professionale"}
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2 backdrop-blur-sm">
                  {professional.category?.name ?? "Categoria"}
                </Badge>
                {professional.isVerified ? (
                  <Badge className="bg-green-500/90 text-white border-green-400/50 text-lg px-4 py-2">
                    <Award className="w-4 h-4 mr-2" />
                    Verificato
                  </Badge>
                ) : null}
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 text-blue-100">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{professional.city ?? "Città"}, {professional.province ?? "Provincia"}</span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="flex">{renderStars(Number(professional.rating ?? 0))}</div>
                  <span className="font-bold text-lg">{Number(professional.rating ?? 0).toFixed(1)}</span>
                </div>
                <span className="text-blue-100">
                  {professional.reviewCount ?? 0} recensioni • {professional.profileViews ?? 0} visualizzazioni
                </span>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {professional.phoneMobile ? (
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Chiama ora
                  </Button>
                ) : null}
                {professional.email ? (
                  <Button variant="outline" size="lg" className="bg-transparent border-white/50 text-white hover:bg-white/10">
                    <Mail className="w-4 h-4 mr-2" />
                    Invia email
                  </Button>
                ) : null}
                {professional.website ? (
                  <Button variant="outline" size="lg" className="bg-transparent border-white/50 text-white hover:bg-white/10">
                    <Globe className="w-4 h-4 mr-2" />
                    Sito web
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="max-w-7xl mx-auto px-4 py-12" variants={containerVariants} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-200/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Panoramica</TabsTrigger>
                <TabsTrigger value="reviews">Recensioni ({reviews?.length || 0})</TabsTrigger>
                <TabsTrigger value="badges">Badge ({badges?.length || 0})</TabsTrigger>
                <TabsTrigger value="map">Mappa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Descrizione</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>{professional.description ?? ""}</p>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Specializzazioni</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {specializations?.map(spec => <li key={spec.id} className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" />{spec.name}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificazioni</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {certifications?.map(cert => <li key={cert.id} className="flex items-center"><Award className="w-4 h-4 mr-2 text-blue-500" />{cert.name}</li>)}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsList
                  professionalId={professionalIdNum}
                  currentUserId={currentUser?.id}
                  isProfessionalOwner={isProfessionalOwner}
                />
              </TabsContent>

              <TabsContent value="badges">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {badges?.map(badge => (
                    <Card key={badge.id}>
                      <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 mb-4 flex items-center justify-center">
                          {/* Assuming badge.badge.icon is a component or URL */}
                          <Award className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="font-bold">{badge.badge.name}</h3>
                        <p className="text-sm text-gray-500">{badge.badge.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="map">
                {professional.latitude != null && professional.longitude != null && (
                  <InteractiveMap
                    latitude={Number(professional.latitude)}
                    longitude={Number(professional.longitude)}
                    professionalName={professional.businessName ?? "Professionista"}
                    address={professional.address}
                    city={professional.city}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posizione in {professional.city ?? "Città"}</span>
                  <span className="font-bold">#{ranking.cityRank ?? 0} di {ranking.cityTotal ?? 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posizione in {professional.category?.name ?? "Categoria"}</span>
                  <span className="font-bold">#{ranking.categoryRank ?? 0} di {ranking.categoryTotal ?? 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Visualizzazioni Profilo</span>
                  <span className="font-bold">{professional.profileViews ?? 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recensioni Ricevute</span>
                  <span className="font-bold">{professional.reviewCount ?? 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Iscritto dal</span>
                  <span className="font-bold">{professional.createdAt ? new Date(professional.createdAt).getFullYear() : ""}</span>
                </div>
              </CardContent>
            </Card>

            <ReviewModal
              professionalId={professionalIdNum}
              professionalName={professional.businessName ?? "Professionista"}
              trigger={
                <Button className="w-full" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" /> Lascia una recensione
                </Button>
              }
            />
          </div>
        </div>
      </motion.div>
      
      {!isProfessionalOwner && (
        <motion.div className="bg-white" variants={itemVariants}>
          <div className="max-w-4xl mx-auto text-center py-12 px-4">
            <p className="text-xl font-semibold mb-2 text-gray-800">Sei il proprietario di questo profilo?</p>
            <p className="text-gray-600 mb-4">Reclama questo profilo per aggiornare le tue informazioni, rispondere alle recensioni e molto altro.</p>
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              Reclama il tuo Profilo Ora
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}