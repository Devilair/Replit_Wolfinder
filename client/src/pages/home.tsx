import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchForm from "@/components/search-form";
import ProfessionalCard from "@/components/professional-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gavel, 
  Zap, 
  UserCheck, 
  Hammer, 
  Compass, 
  Wrench, 
  Torus, 
  MoreHorizontal,
  Star,
  Shield,
  Users,
  TrendingUp
} from "lucide-react";
import type { Category, ProfessionalSummary } from "@shared/schema";

const categoryIcons = {
  "avvocati": Gavel,
  "elettricisti": Zap,
  "medici": UserCheck,
  "muratori": Hammer,
  "architetti": Compass,
  "idraulici": Wrench,
  "dentisti": Torus,
};

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProfessionals } = useQuery<ProfessionalSummary[]>({
    queryKey: ["/api/professionals/featured"],
  });

  const getCategoryIcon = (slug: string) => {
    const IconComponent = categoryIcons[slug as keyof typeof categoryIcons] || MoreHorizontal;
    return IconComponent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Trova il <span className="text-amber-400">Professionista</span><br />
              Giusto per Te
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light">
              Scopri professionisti verificati e affidabili nella tua zona attraverso recensioni autentiche
            </p>
            
            <SearchForm />

            {/* Category Quick Access */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="text-blue-200 mr-2">Categorie popolari:</span>
              {categories?.slice(0, 4).map((category) => (
                <Badge 
                  key={category.id}
                  variant="secondary" 
                  className="bg-blue-600 bg-opacity-50 text-white hover:bg-opacity-70 transition-all cursor-pointer"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats?.professionalsCount?.toLocaleString() || "0"}+
              </div>
              <div className="text-gray-500 font-medium">Professionisti Verificati</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats?.reviewsCount?.toLocaleString() || "0"}+
              </div>
              <div className="text-gray-500 font-medium">Recensioni Autentiche</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats?.citiesCount || "0"}+
              </div>
              <div className="text-gray-500 font-medium">Città Coperte</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats?.averageRating || "0"}/5
              </div>
              <div className="text-gray-500 font-medium">Soddisfazione Media</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Professionisti in Evidenza
            </h2>
            <p className="text-xl text-gray-500">
              I migliori professionisti nella tua zona, scelti dalla community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProfessionals?.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>

          <div className="text-center mt-12">
            <a 
              href="/professionals"
              className="bg-amber-500 text-white px-8 py-3 rounded-xl hover:bg-amber-600 transition-colors font-semibold text-lg shadow-lg inline-block"
            >
              Vedi Tutti i Professionisti
            </a>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Esplora per Categoria
            </h2>
            <p className="text-xl text-gray-500">
              Trova il professionista giusto per ogni esigenza
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              return (
                <Card 
                  key={category.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardContent className="p-6">
                    <div className="text-blue-600 text-4xl mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      {category.description}
                    </p>
                    <div className="text-blue-600 font-medium text-sm">
                      {category.count} professionisti
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Come Funziona
            </h2>
            <p className="text-xl text-gray-500">
              Trovare il professionista giusto non è mai stato così semplice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Cerca e Filtra</h3>
              <p className="text-gray-600">
                Usa i nostri filtri avanzati per trovare professionisti nella tua zona per categoria, prezzo e valutazione.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Confronta Profili</h3>
              <p className="text-gray-600">
                Leggi recensioni autentiche, confronta prezzi e scopri i dettagli di ogni professionista verificato.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contatta e Recensisci</h3>
              <p className="text-gray-600">
                Contatta direttamente il professionista e lascia una recensione per aiutare altri utenti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sei un Professionista?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Unisciti a migliaia di professionisti che hanno scelto Wolfinder per far crescere la loro attività
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Più Visibilità</h3>
              <p className="text-blue-100">Raggiungi nuovi clienti nella tua zona</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profilo Verificato</h3>
              <p className="text-blue-100">Distinguiti con il badge di verifica</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cresci Online</h3>
              <p className="text-blue-100">Gestisci la tua reputazione digitale</p>
            </div>
          </div>
          <div className="space-x-4">
            <button className="bg-amber-500 text-white px-8 py-4 rounded-xl hover:bg-amber-600 transition-colors font-semibold text-lg shadow-lg">
              Registrati Come Professionista
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg">
              Scopri di Più
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
