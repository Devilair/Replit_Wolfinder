import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Phone, Mail, Globe, Award, Users, TrendingUp, Eye, Calendar, Shield, ChevronRight, ExternalLink, Heart, User, Target, CheckCircle, Building, Smartphone, MessageCircle, Flag, Share2, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import ReviewModal from "@/components/ReviewModal";
import InteractiveMap from "@/components/InteractiveMap";

export default function ProfessionalProfile() {
  const { id } = useParams();
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const { data: professional, isLoading: loadingProfessional } = useQuery({
    queryKey: [`/api/professionals/${id}`],
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: [`/api/professionals/${id}/badges`],
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: [`/api/professionals/${id}/reviews`],
  });

  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: [`/api/professionals/${id}/ranking`],
  });

  const { data: specializations } = useQuery({
    queryKey: [`/api/professionals/${id}/specializations`],
  });

  const { data: certifications } = useQuery({
    queryKey: [`/api/professionals/${id}/certifications`],
  });

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header Section */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-8 text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Avatar */}
            <motion.div 
              className="flex-shrink-0"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl font-bold shadow-2xl border border-white/20">
                  {professional?.businessName?.substring(0, 2).toUpperCase() || "PR"}
                </div>
                {professional?.isVerified && (
                  <motion.div 
                    className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Info */}
            <motion.div className="flex-1 text-center lg:text-left" variants={itemVariants}>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <h2 className="text-lg text-blue-100 font-medium">
                  {professional?.user?.name || "Professionista"}
                </h2>
                {!professional?.isClaimed && (
                  <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                  >
                    Reclama Profilo
                  </Button>
                )}
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {professional?.businessName || "Studio Professionale"}
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2 backdrop-blur-sm">
                  {professional?.category?.name || "Categoria"}
                </Badge>
                {professional?.isVerified && (
                  <Badge className="bg-green-500/90 text-white border-green-400/50 text-lg px-4 py-2">
                    <Award className="w-4 h-4 mr-2" />
                    Verificato
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 text-blue-100">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{professional?.city || "Città"}, {professional?.province || "Provincia"}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="flex">{renderStars(parseFloat(professional?.rating || "0"))}</div>
                  <span className="font-bold text-lg">{parseFloat(professional?.rating || "0").toFixed(1)}</span>
                </div>
                <span className="text-blue-100">
                  {professional?.reviewCount || 0} recensioni • {professional?.profileViews || 0} visualizzazioni
                </span>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                {professional?.phoneFixed && (
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Chiama ora
                  </Button>
                )}
                {professional?.email && (
                  <Button variant="outline" size="lg" className="bg-transparent border-white/50 text-white hover:bg-white/10">
                    <Mail className="w-4 h-4 mr-2" />
                    Invia email
                  </Button>
                )}
                {professional?.website && (
                  <Button variant="outline" size="lg" className="bg-transparent border-white/50 text-white hover:bg-white/10">
                    <Globe className="w-4 h-4 mr-2" />
                    Sito web
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {professional?.description && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Users className="w-6 h-6" />
                      Chi siamo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-gray-700 text-lg leading-relaxed">{professional.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sistema Badge Completo */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-purple-50/30">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Award className="w-6 h-6" />
                    Medaglie e Riconoscimenti
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    
                    {/* Badge Standard */}
                    {(professional?.verificationStatus === 'approved' || professional?.verificationStatus === 'verified') && (
                      <div className="group relative bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center">
                          <div className="text-3xl mb-2">✅</div>
                          <h4 className="font-bold text-sm text-green-800">Verificato</h4>
                          <p className="text-xs text-green-600">Identità confermata</p>
                        </div>
                      </div>
                    )}

                    {professional?.lastActivityAt && new Date(professional.lastActivityAt) > new Date(Date.now() - 30*24*60*60*1000) && (
                      <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center">
                          <div className="text-3xl mb-2">📅</div>
                          <h4 className="font-bold text-sm text-blue-800">Attivo</h4>
                          <p className="text-xs text-blue-600">Profilo aggiornato</p>
                        </div>
                      </div>
                    )}

                    {professional?.reviewCount > 0 && (
                      <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🧾</div>
                          <h4 className="font-bold text-sm text-orange-800">Recensito</h4>
                          <p className="text-xs text-orange-600">{professional.reviewCount} recensioni</p>
                        </div>
                      </div>
                    )}

                    {/* Badge Meritocratici */}
                    {ranking?.cityRank <= 3 && ranking?.cityTotal > 5 && (
                      <div className="group relative bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🥇</div>
                          <h4 className="font-bold text-sm text-yellow-800">Top 3 Città</h4>
                          <p className="text-xs text-yellow-600">#{ranking.cityRank} a {professional?.city}</p>
                        </div>
                      </div>
                    )}

                    {parseFloat(professional?.rating || "0") >= 4.8 && professional?.reviewCount >= 10 && (
                      <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🏅</div>
                          <h4 className="font-bold text-sm text-purple-800">Alta Soddisfazione</h4>
                          <p className="text-xs text-purple-600">Rating {professional?.rating}</p>
                        </div>
                      </div>
                    )}

                    {!professional?.isProblematic && (
                      <div className="group relative bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🛡️</div>
                          <h4 className="font-bold text-sm text-cyan-800">Zero Segnalazioni</h4>
                          <p className="text-xs text-cyan-600">Profilo pulito</p>
                        </div>
                      </div>
                    )}

                    {/* Badge dinamici dal database */}
                    {badges?.map((badgeData: any, index: number) => (
                      <div 
                        key={badgeData?.badge?.id || index}
                        className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{badgeData?.badge?.icon || "🏆"}</div>
                          <h4 className="font-bold text-sm text-gray-800">{badgeData?.badge?.name}</h4>
                          <p className="text-xs text-gray-600">{badgeData?.badge?.description}</p>
                        </div>
                      </div>
                    ))}

                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bio e Presentazione Professionale */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50/30">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <User className="w-6 h-6" />
                    Chi sono e cosa faccio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Bio professionale */}
                  <div className="mb-8">
                    <p className="text-lg leading-relaxed text-gray-700 mb-6">
                      {professional?.description || "Descrizione professionale non disponibile."}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <div>
                          <span className="text-sm text-gray-600">In attività dal</span>
                          <p className="font-semibold text-gray-800">
                            {professional?.createdAt ? new Date(professional.createdAt).getFullYear() : "Non specificato"}
                          </p>
                        </div>
                      </div>
                      
                      {professional?.verificationStatus === "verified" && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="text-sm text-gray-600">Stato verifica</span>
                            <p className="font-semibold text-green-800">Professionista verificato</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specializzazioni */}
                  {specializations && Array.isArray(specializations) && specializations.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Specializzazioni
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specializations.map((spec: any, index: number) => (
                          <div key={spec.id || index} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                            <h4 className="font-semibold text-indigo-800 mb-2">{spec.specialization?.name || spec.name}</h4>
                            {spec.experienceYears && (
                              <p className="text-sm text-indigo-600">{spec.experienceYears} anni di esperienza</p>
                            )}
                            {spec.specialization?.description && (
                              <p className="text-sm text-gray-600 mt-1">{spec.specialization.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificazioni */}
                  {certifications && Array.isArray(certifications) && certifications.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        Certificazioni e Albo
                      </h3>
                      <div className="space-y-4">
                        {certifications.map((cert: any, index: number) => (
                          <div key={cert.id || index} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-1">{cert.name}</h4>
                                <p className="text-indigo-600 font-medium mb-2">{cert.issuingOrganization}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {cert.issueDate && (
                                    <span>Rilasciato: {new Date(cert.issueDate).toLocaleDateString('it-IT')}</span>
                                  )}
                                  {cert.certificationNumber && (
                                    <span>N. {cert.certificationNumber}</span>
                                  )}
                                </div>
                              </div>
                              {cert.verificationStatus === "verified" && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verificato
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contatti e Studio Completi */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30">
                <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Building className="w-6 h-6" />
                    Contatti e Studio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Informazioni di contatto */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Come contattarmi</h3>
                      <div className="space-y-4">
                        
                        {professional?.email && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <Mail className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-sm text-gray-600">Email</span>
                              <p className="font-semibold text-gray-800">{professional.email}</p>
                            </div>
                          </div>
                        )}

                        {professional?.phoneFixed && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <Phone className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-sm text-gray-600">Telefono fisso</span>
                              <p className="font-semibold text-gray-800">{professional.phoneFixed}</p>
                            </div>
                          </div>
                        )}

                        {professional?.phoneMobile && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <Smartphone className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-sm text-gray-600">Cellulare</span>
                              <p className="font-semibold text-gray-800">{professional.phoneMobile}</p>
                            </div>
                          </div>
                        )}

                        {professional?.whatsappNumber && (
                          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-sm text-gray-600">WhatsApp</span>
                              <p className="font-semibold text-gray-800">{professional.whatsappNumber}</p>
                            </div>
                          </div>
                        )}

                        {professional?.website && (
                          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <Globe className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="text-sm text-gray-600">Sito web</span>
                              <p className="font-semibold text-blue-600 hover:underline cursor-pointer">{professional.website}</p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Social Media */}
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Seguimi sui social</h4>
                        <div className="flex gap-3">
                          {professional?.facebookUrl && (
                            <Button size="sm" variant="outline" className="p-2">
                              <span className="sr-only">Facebook</span>
                              📘
                            </Button>
                          )}
                          {professional?.instagramUrl && (
                            <Button size="sm" variant="outline" className="p-2">
                              <span className="sr-only">Instagram</span>
                              📷
                            </Button>
                          )}
                          {professional?.linkedinUrl && (
                            <Button size="sm" variant="outline" className="p-2">
                              <span className="sr-only">LinkedIn</span>
                              💼
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Indirizzo e mappa */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Dove trovarmi</h3>
                      
                      <div className="mb-6">
                        <div className="p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-semibold text-gray-800 mb-1">{professional?.businessName}</p>
                              <p className="text-gray-600">
                                {professional?.address}<br />
                                {professional?.city}, {professional?.province} {professional?.postalCode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mappa interattiva */}
                      {professional?.latitude && professional?.longitude ? (
                        <InteractiveMap
                          latitude={parseFloat(professional.latitude)}
                          longitude={parseFloat(professional.longitude)}
                          professionalName={`${professional?.firstName || ""} ${professional?.lastName || ""}`.trim() || professional?.businessName || "Professionista"}
                          address={professional.address || ""}
                          city={professional.city || ""}
                          height="320px"
                        />
                      ) : (
                        <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center border border-gray-200">
                          <div className="text-center text-gray-500">
                            <MapPin className="w-8 h-8 mx-auto mb-2" />
                            <p>Posizione non disponibile</p>
                            <p className="text-sm">Coordinate non geocodificate</p>
                          </div>
                        </div>
                      )}

                      {/* Città aggiuntive */}
                      {professional?.additionalCities && professional.additionalCities.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Opera anche in:</h4>
                          <div className="flex flex-wrap gap-2">
                            {professional.additionalCities.map((city: string, index: number) => (
                              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews Section */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-yellow-50/30">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Star className="w-6 h-6" />
                    Recensioni ({professional?.reviewCount || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews?.map((review: any, index: number) => (
                        <motion.div 
                          key={review?.id || index}
                          className="bg-gradient-to-r from-white to-gray-50/50 p-6 rounded-2xl shadow-lg border border-gray-100"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {review?.user?.name?.substring(0, 1).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <span className="font-bold text-gray-800">{review?.user?.name || "Utente"}</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    {renderStars(review?.rating || 0)}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 text-lg leading-relaxed">{review?.content || "Nessun commento"}</p>
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {review?.createdAt ? new Date(review.createdAt).toLocaleDateString('it-IT') : "Data non disponibile"}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">Nessuna recensione ancora</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Sii il primo a condividere la tua esperienza con questo professionista
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Ranking Card */}
            {ranking && (
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <TrendingUp className="w-5 h-5" />
                      Posizionamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <span className="font-medium text-gray-700">Nella città</span>
                      <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                        #{ranking?.cityRank || 0} di {ranking?.cityTotal || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <span className="font-medium text-gray-700">Nella categoria</span>
                      <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                        #{ranking?.categoryRank || 0} di {ranking?.categoryTotal || 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stats Card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50/30">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    Statistiche
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{professional?.profileViews || 0}</div>
                      <div className="text-xs text-gray-600">Visualizzazioni</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 mb-1">{professional?.reviewCount || 0}</div>
                      <div className="text-xs text-gray-600">Recensioni</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">{professional?.rating ? parseFloat(professional.rating).toFixed(1) : '0.0'}</div>
                      <div className="text-xs text-gray-600">Rating medio</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {professional?.createdAt ? new Date(professional.createdAt).getFullYear() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Anno iscrizione</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Card */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Hai lavorato con questo professionista?</h3>
                  <p className="text-pink-100 mb-6 leading-relaxed">
                    La tua recensione aiuta altri utenti a fare la scelta giusta
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-pink-600 hover:bg-pink-50 font-bold text-lg py-3 shadow-lg"
                  >
                    Scrivi recensione
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        professionalId={id || ""}
        professionalName={`${professional?.firstName || ""} ${professional?.lastName || ""}`.trim() || professional?.businessName || "Professionista"}
      />
    </div>
  );
}