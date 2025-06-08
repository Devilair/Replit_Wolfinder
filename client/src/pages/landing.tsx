import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Shield, Users, Award, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

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
              <span className="text-2xl font-bold text-blue-600">Wolfinder</span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Etico</Badge>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Chi siamo</Link>
              <Link href="/professionals" className="text-gray-700 hover:text-blue-600 transition-colors">Professionisti</Link>
              <Link href="/register-professional" className="text-gray-700 hover:text-blue-600 transition-colors">Registrati</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Accedi</Link>
              </Button>
              <Button asChild>
                <Link href="/register-professional">Unisciti</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trova professionisti <span className="text-blue-600">veramente</span> affidabili
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Su Wolfinder il successo si guadagna con la qualità, non con i pagamenti. 
              Solo recensioni autentiche e verifiche rigorose determinano la visibilità.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Cerca professionista, servizio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4" />
                    <SelectValue placeholder="Città" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ferrara">Ferrara</SelectItem>
                    <SelectItem value="Livorno">Livorno</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="w-full mt-4" size="lg">
                <Search className="h-5 w-5 mr-2" />
                Cerca Professionisti
              </Button>
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">100% Meritocratico</h3>
                <p className="text-gray-600">Il ranking si basa solo su qualità e recensioni verificate, mai sui pagamenti</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Professionisti Verificati</h3>
                <p className="text-gray-600">Ogni professionista è verificato con documenti e controlli di identità</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Recensioni Autentiche</h3>
                <p className="text-gray-600">Solo clienti reali possono lasciare recensioni, eliminate le recensioni false</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Professionisti in Evidenza</h2>
            <p className="text-lg text-gray-600">I migliori professionisti selezionati in base a qualità e affidabilità</p>
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

      {/* Why Wolfinder */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Perché Wolfinder è diverso</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Nessun Pay-to-Win</h3>
                    <p className="text-gray-600">Il tuo posto nei risultati dipende solo dalla qualità del tuo lavoro, non da quanto paghi</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Trasparenza Totale</h3>
                    <p className="text-gray-600">Ogni azione è tracciata e verificabile. Saprai sempre perché un professionista è in cima ai risultati</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Solo Eccellenza</h3>
                    <p className="text-gray-600">Accettiamo solo professionisti qualificati che superano i nostri controlli di qualità</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg p-8 text-white">
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
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/register-professional">Registrati Ora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Wolfinder</h3>
              <p className="text-gray-300 text-sm">
                La prima piattaforma italiana etica per trovare professionisti affidabili.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Per i Clienti</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/search" className="hover:text-white">Cerca Professionisti</Link></li>
                <li><Link href="/categories" className="hover:text-white">Categorie</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">Come Funziona</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Per i Professionisti</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/register-professional" className="hover:text-white">Registrati</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Piani e Prezzi</Link></li>
                <li><Link href="/verification" className="hover:text-white">Processo di Verifica</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Azienda</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/about" className="hover:text-white">Chi Siamo</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contatti</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Termini di Servizio</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Wolfinder. Tutti i diritti riservati. Piattaforma italiana per professionisti etici.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}