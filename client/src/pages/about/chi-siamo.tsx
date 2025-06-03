import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Trophy, 
  Target, 
  Eye, 
  Heart, 
  Zap, 
  MessageCircle,
  CheckCircle,
  Star,
  Award,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import SiteLayout from "@/components/site-layout";

export default function ChiSiamo() {
  const valori = [
    {
      icon: Eye,
      valore: "Trasparenza",
      significato: "Recensioni pubbliche, criteri di ranking visibili"
    },
    {
      icon: Shield,
      valore: "Equità", 
      significato: "Opportunità identiche per tutti i professionisti"
    },
    {
      icon: Heart,
      valore: "Integrità",
      significato: "Controlli serrati su falsi account o recensioni artefatte"
    },
    {
      icon: Zap,
      valore: "Innovazione",
      significato: "Tecnologie AI e blockchain per la prova d'integrità dei dati"
    },
    {
      icon: Users,
      valore: "Comunità",
      significato: "Incentiviamo il confronto e la crescita reciproca"
    }
  ];

  const caratteristiche = [
    {
      icon: Shield,
      titolo: "Verifica a prova di frode",
      descrizione: "Tecnologia proprietaria + controlli manuali"
    },
    {
      icon: Trophy,
      titolo: "No pay-to-win",
      descrizione: "Niente piani a pagamento che alterano la classifica"
    },
    {
      icon: Target,
      titolo: "Ancoraggio locale",
      descrizione: "Partiamo da due città reali per creare community fisiche"
    },
    {
      icon: Star,
      titolo: "Focus specializzato",
      descrizione: "Esclusivamente professionisti non medicali"
    },
    {
      icon: TrendingUp,
      titolo: "Metriche trasparenti",
      descrizione: "Punteggi basati su parametri oggettivi"
    }
  ];

  const servizi = [
    {
      icon: CheckCircle,
      titolo: "Piattaforma di recensioni verificate",
      descrizione: "Ogni feedback passa filtri anti-frode multilivello"
    },
    {
      icon: Award,
      titolo: "Ranking meritocratico",
      descrizione: "Nessuno può 'comprarsi' il posizionamento"
    },
    {
      icon: Users,
      titolo: "Profilo chiaro del professionista",
      descrizione: "Competenze, casi studio, tariffe indicative"
    },
    {
      icon: MessageCircle,
      titolo: "Dialogo aperto",
      descrizione: "I professionisti possono replicare, migliorare e crescere"
    },
    {
      icon: Zap,
      titolo: "Educazione alla qualità",
      descrizione: "Guide, webinar e metriche per capire cosa significa 'lavoro ben fatto'"
    }
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              Chi siamo
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Chi siamo
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Il passaparola digitale, verificato e meritocratico
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Missione e Visione */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-l-blue-500">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">La nostra missione</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Aiutiamo cittadini e imprese a trovare professionisti affidabili grazie a recensioni autentiche, 
                verificate e libere da logiche pay-to-play. Vogliamo rendere il mercato dei servizi più trasparente, 
                equo e meritocratico.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-l-4 border-l-indigo-500">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                  <Eye className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">La nostra visione</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Diventare il punto di riferimento nazionale dove qualità, integrità e fiducia guidano la scelta 
                di avvocati, commercialisti, notai, ingegneri, architetti, geometri, consulenti del lavoro e altre 
                figure non medicali, a partire da Ferrara e Livorno e via via in tutta Italia.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cosa facciamo in concreto */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cosa facciamo in concreto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Servizi concreti per professionisti e cittadini
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servizi.map((servizio, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      <servizio.icon className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{servizio.titolo}</h3>
                    <p className="text-gray-600 leading-relaxed">{servizio.descrizione}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Perché siamo diversi */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Perché siamo diversi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cinque caratteristiche che ci distinguono nel panorama italiano
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caratteristiche.map((caratteristica, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-t-4 border-t-blue-500">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors flex-shrink-0">
                      <caratteristica.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{caratteristica.titolo}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{caratteristica.descrizione}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* I nostri valori */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">I nostri valori</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Principi che guidano ogni nostra decisione
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valori.map((valore, index) => (
              <Card key={index} className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <valore.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{valore.valore}</h3>
                    <p className="text-blue-100 leading-relaxed">{valore.significato}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Il nostro team */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Il nostro team
            </h2>
          </div>
          
          <Card className="max-w-4xl mx-auto hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  Siamo professionisti dell'IT, legali e consulenti che hanno unito competenze complementari. 
                  <span className="font-semibold text-blue-600"> Mirko Collini (Founder)</span> porta oltre vent'anni 
                  di esperienza nella gestione documentale e nell'enterprise software.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Vuoi fare parte di Wolfinder?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center space-y-6">
                <div className="p-4 bg-blue-100 rounded-2xl inline-block group-hover:bg-blue-200 transition-colors">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Se sei un professionista</h3>
                <Link href="/auth/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                    Crea il tuo profilo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center space-y-6">
                <div className="p-4 bg-indigo-100 rounded-2xl inline-block group-hover:bg-indigo-200 transition-colors">
                  <Target className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Se cerchi un professionista</h3>
                <Link href="/cerca">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-3">
                    Inizia la ricerca
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-8 text-center space-y-6">
                <div className="p-4 bg-green-100 rounded-2xl inline-block group-hover:bg-green-200 transition-colors">
                  <Star className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Se vuoi lasciare una recensione</h3>
                <Link href="/auth/register">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                    Registrati gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </SiteLayout>
  );
}