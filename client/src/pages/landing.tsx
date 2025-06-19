import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Shield, Users, Award, ArrowRight, Check, User, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Professional {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  reviewCount: number;
  city: string;
  province: string;
  category: Category;
}

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: featuredProfessionals = [] } = useQuery({
    queryKey: ['/api/professionals/featured'],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedCategory) params.append('categoryId', selectedCategory);
    
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/attached_assets/logo_1749382291587.png" 
                alt="Wolfinder" 
                className="h-8 sm:h-10 md:h-12 w-auto" 
              />
            </div>
            <nav className="hidden lg:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">Chi siamo</Link>
              <Link href="/professionals" className="text-gray-700 hover:text-primary transition-colors">Professionisti</Link>
              <Link href="/register-professional" className="text-gray-700 hover:text-primary transition-colors">Registrati</Link>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/login">Accedi</Link>
              </Button>
              <Dialog open={registrationModalOpen} onOpenChange={setRegistrationModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs sm:text-sm">
                    Registrati
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Scegli il tipo di registrazione</DialogTitle>
                    <DialogDescription>
                      Seleziona l'opzione che meglio ti descrive per creare il tuo account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Card 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setRegistrationModalOpen(false);
                        setLocation("/register-consumer");
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Sono un utente</CardTitle>
                            <CardDescription>
                              Cerco professionisti qualificati per i miei progetti
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      </CardHeader>
                    </Card>
                    
                    <Card 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setRegistrationModalOpen(false);
                        setLocation("/register-professional");
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Sono un professionista</CardTitle>
                            <CardDescription>
                              Offro servizi professionali e voglio essere trovato dai clienti
                            </CardDescription>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Inspired by Trustpilot */}
      <section className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-orange-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4 sm:mb-6">
              <div className="flex items-center flex-col sm:flex-row">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 sm:h-8 sm:w-8 text-primary fill-primary" />
                  ))}
                </div>
                <span className="mt-2 sm:mt-0 sm:ml-3 text-sm sm:text-lg font-semibold text-gray-700">Piattaforma Verificata</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Dietro ogni grande decisione<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>c'è una <span className="text-primary">recensione autentica</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Wolfinder è la prima piattaforma italiana che mette la qualità al centro. 
              Solo professionisti verificati, recensioni autentiche e ranking meritocratico. 
              <strong> Zero pay-to-win</strong>.
            </p>
            
            {/* Stats Row - Trustpilot Style */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-8 sm:mb-12 text-xs sm:text-sm text-gray-600 px-4">
              <div className="flex items-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
                <span><strong>100%</strong> Professionisti verificati</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
                <span><strong>Solo</strong> recensioni autentiche</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2" />
                <span><strong>Ranking</strong> meritocratico</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8 sm:mb-12 mx-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    <Input
                      placeholder="Cerca professionista, servizio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <MapPin className="h-4 w-4" />
                    <SelectValue placeholder="Città" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ferrara">Ferrara</SelectItem>
                    <SelectItem value="Livorno">Livorno</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as Category[]).map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="w-full mt-3 sm:mt-4" size="lg">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Cerca Professionisti
              </Button>
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">100% Meritocratico</h3>
                <p className="text-sm sm:text-base text-gray-600">Il ranking si basa solo su qualità e recensioni verificate, mai sui pagamenti</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Professionisti Verificati</h3>
                <p className="text-sm sm:text-base text-gray-600">Ogni professionista è verificato con documenti e controlli di identità</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Recensioni Autentiche</h3>
                <p className="text-gray-600">Solo clienti reali possono lasciare recensioni, eliminate le recensioni false</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section - Trustpilot Style */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cosa dicono i nostri utenti</h2>
            <p className="text-lg text-gray-600">Recensioni autentiche da clienti verificati</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Sample Review Cards */}
            <Card className="bg-white border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-green-500 fill-green-500" />
                  ))}
                </div>
                <p className="text-gray-800 mb-4 italic">
                  "Finalmente una piattaforma che mette davvero al centro la qualità. 
                  Ho trovato l'architetto perfetto per la mia casa."
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Marco T.</span> · Cliente verificato
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-green-500 fill-green-500" />
                  ))}
                </div>
                <p className="text-gray-800 mb-4 italic">
                  "Su Wolfinder non si paga per essere visibili, ma si lavora per meritarlo. 
                  Questo fa la differenza."
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Avv. Giuseppe R.</span> · Professionista verificato
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-green-500 fill-green-500" />
                  ))}
                </div>
                <p className="text-gray-800 mb-4 italic">
                  "Trasparenza totale e professionalità. Ogni recensione è autentica, 
                  si sente subito la differenza."
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Elena M.</span> · Cliente verificato
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Professionisti più apprezzati</h2>
            <p className="text-lg text-gray-600">Selezionati in base a qualità del servizio e recensioni autentiche</p>
          </div>
          
          {featuredProfessionals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProfessionals.slice(0, 6).map((professional: Professional) => (
                <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {professional.category.icon} {professional.category.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verificato
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{professional.businessName || "Professionista"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {professional.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{professional.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({professional.reviewCount} recensioni)</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {professional.city}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-3" size="sm" asChild>
                      <Link href={`/professionals/${professional.id}`}>
                        Vedi Profilo <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Stiamo ancora selezionando i migliori professionisti per la tua zona.</p>
              <Button asChild className="mt-4">
                <Link href="/register-professional">Sei un professionista? Registrati qui</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories - Trustpilot Style */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trova professionisti per categoria</h2>
            <p className="text-lg text-gray-600">Esplora le categorie più richieste su Wolfinder</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
            {categories.slice(0, 12).map((category: Category) => (
              <Link 
                key={category.id} 
                href={`/search?categoryId=${category.id}`}
                className="group"
              >
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-200 hover:bg-blue-50 border-2 hover:border-blue-200">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/search">Vedi tutte le categorie</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Wolfinder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Perché Wolfinder è diverso</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Nessun Pay-to-Win</h3>
                    <p className="text-gray-600">Il tuo posto nei risultati dipende solo dalla qualità del tuo lavoro, non da quanto paghi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Trasparenza Totale</h3>
                    <p className="text-gray-600">Ogni azione è tracciata e verificabile. Saprai sempre perché un professionista è in cima ai risultati</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Solo Eccellenza</h3>
                    <p className="text-gray-600">Accettiamo solo professionisti qualificati che superano i nostri controlli di qualità</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-orange-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Sei un professionista?</h3>
              <p className="mb-6">Unisciti alla prima piattaforma italiana che premia davvero la qualità del tuo lavoro</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Visibilità basata sul merito
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Sistema badge di riconoscimento
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Clienti qualificati e verificati
                </li>
              </ul>
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-50" asChild>
                <Link href="/register-professional">Registrati Ora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Trustpilot Style */}
      <section className="py-16 bg-gradient-to-r from-primary to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto a trovare il professionista giusto?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Unisciti a migliaia di clienti che hanno già scelto la qualità su Wolfinder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-50" asChild>
              <Link href="/search">
                <Search className="h-5 w-5 mr-2" />
                Cerca Professionisti
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/register-professional">
                Registrati come Professionista
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="/attached_assets/logo_1749382291587.png" 
                  alt="Wolfinder" 
                  className="h-12 w-auto" 
                />
              </div>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                La prima piattaforma italiana etica per trovare professionisti affidabili. 
                Solo recensioni autentiche, ranking meritocratico e verifiche rigorose.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-green-400 fill-green-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-300">Eccellente</span>
                </div>
                <div className="text-xs text-gray-400">Valutazioni verificate</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Per i Clienti</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/search" className="hover:text-white transition-colors">Cerca Professionisti</Link></li>
                <li><Link href="/search?city=Ferrara" className="hover:text-white transition-colors">Professionisti Ferrara</Link></li>
                <li><Link href="/search?city=Livorno" className="hover:text-white transition-colors">Professionisti Livorno</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">Come Funziona</Link></li>
                <li><Link href="/reviews-guide" className="hover:text-white transition-colors">Guida alle Recensioni</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Per i Professionisti</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/register-professional" className="hover:text-white transition-colors">Registrati Gratis</Link></li>
                <li><Link href="/subscription-plans" className="hover:text-white transition-colors">Piani Premium</Link></li>
                <li><Link href="/verification" className="hover:text-white transition-colors">Verifica Profilo</Link></li>
                <li><Link href="/badges" className="hover:text-white transition-colors">Sistema Badge</Link></li>
                <li><Link href="/professional-resources" className="hover:text-white transition-colors">Risorse</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Azienda</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">Chi Siamo</Link></li>
                <li><Link href="/ethics" className="hover:text-white transition-colors">I Nostri Valori</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Stampa</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contatti</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Lavora con noi</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400 mb-4 md:mb-0">
                &copy; 2025 Wolfinder. Tutti i diritti riservati. Piattaforma italiana per professionisti etici.
              </div>
              <div className="flex space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Termini di Servizio</Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}