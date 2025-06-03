import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Lightbulb, 
  Code, 
  Users, 
  Target, 
  TrendingUp,
  Shield,
  Award,
  Heart,
  ArrowRight,
  CheckCircle,
  Zap
} from "lucide-react";
import { Link } from "wouter";

export default function LaNostraStoria() {
  const timeline = [
    {
      anno: "2016",
      luogo: "Ferrara",
      evento: "L'idea nasce",
      descrizione: "Dovevo trovare lo specialista giusto per un problema legale: tre preventivi, zero recensioni affidabili, molta confusione.",
      icon: Lightbulb,
      color: "from-yellow-400 to-orange-500"
    },
    {
      anno: "2018-2022",
      luogo: "Italia",
      evento: "Ricerca sul campo",
      descrizione: "Interviste a clienti e studi professionali per comprendere le reali esigenze del mercato.",
      icon: Users,
      color: "from-blue-400 to-blue-600"
    },
    {
      anno: "Ottobre 2023",
      luogo: "Digital",
      evento: "Nasce Wolfinder",
      descrizione: "Dal nome in codice 'Passaparola Digitale' evolve in Wolfinder: il lupo come guida, la community come branco.",
      icon: Target,
      color: "from-indigo-400 to-purple-600"
    },
    {
      anno: "Gennaio 2024",
      luogo: "Tech Stack",
      evento: "Sviluppo MVP",
      descrizione: "Scelta dello stack Next.js 14 + MongoDB per un MVP agile. Avvio dello sviluppo con assistenza AI.",
      icon: Code,
      color: "from-green-400 to-emerald-600"
    },
    {
      anno: "Marzo-Aprile 2025",
      luogo: "Beta Testing",
      evento: "Testing chiuso",
      descrizione: "80 utenti, oltre 300 recensioni verificate. Prime validazioni del sistema anti-frode.",
      icon: Shield,
      color: "from-red-400 to-pink-600"
    },
    {
      anno: "Giugno 2025",
      luogo: "Ferrara & Livorno",
      evento: "Lancio pubblico",
      descrizione: "Apertura limitata alle prime due città pilota per creare community locali solide.",
      icon: Award,
      color: "from-purple-400 to-indigo-600"
    }
  ];

  const ostacoli = [
    {
      problema: "Falsi feedback",
      soluzione: "Motore anti-frode proprietario + verifica documentale",
      icon: Shield
    },
    {
      problema: "Pay-to-play diffuso nel settore",
      soluzione: "Modello freemium senza influenze sul ranking",
      icon: Award
    },
    {
      problema: "Debiti personali del fondatore",
      soluzione: "Massima trasparenza per attrarre partner nel medio termine",
      icon: Heart
    }
  ];

  const obiettivi2025 = [
    {
      obiettivo: "Coprire tutta l'Emilia-Romagna e la Toscana",
      icon: MapPin
    },
    {
      obiettivo: "Integrare metriche di performance dai software gestionali",
      icon: TrendingUp
    },
    {
      obiettivo: "Lanciare il Programma Ambasciatori per validazione recensioni",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              La nostra storia
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              La nostra storia
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed">
              Da un bisogno personale a un progetto di fiducia collettiva
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Dove tutto è cominciato */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Dove tutto è cominciato
          </h2>
        </div>

        <Card className="max-w-5xl mx-auto hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
          <CardContent className="p-12">
            <div className="flex items-start space-x-6 mb-8">
              <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl">
                <MapPin className="h-10 w-10 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-lg px-4 py-1">Ferrara, 2016</Badge>
                </div>
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  Dovevo trovare lo specialista giusto per un problema legale: tre preventivi, zero recensioni affidabili, 
                  molta confusione. Fu la classica "goccia": anni di lavoro nell'IT mi avevano insegnato quanto la trasparenza 
                  dei dati cambi i mercati; eppure nel mondo dei servizi professionali regnava l'opacità.
                </p>
                <blockquote className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg">
                  <p className="text-xl font-medium text-blue-900 italic">
                    "Se esiste TripAdvisor per hotel, perché non qualcosa di serio per avvocati e consulenti?"
                  </p>
                  <cite className="text-blue-700 font-semibold mt-2 block">— Mirko Collini</cite>
                </blockquote>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline - Dall'idea al prototipo */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Dall'idea al prototipo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Il percorso di evoluzione di Wolfinder attraverso gli anni
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
            
            <div className="space-y-16">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <Card className={`w-full max-w-lg group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                    <CardContent className="p-8">
                      <div className={`flex items-center space-x-4 ${index % 2 === 0 ? '' : 'flex-row-reverse space-x-reverse'}`}>
                        <div className={`p-4 bg-gradient-to-br ${item.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className={`flex-1 ${index % 2 === 0 ? '' : 'text-right'}`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-sm">{item.anno}</Badge>
                            <Badge variant="secondary" className="text-sm">{item.luogo}</Badge>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.evento}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.descrizione}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gli ostacoli (e le soluzioni) */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Gli ostacoli (e le soluzioni)
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ogni sfida è diventata un'opportunità per innovare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {ostacoli.map((ostacolo, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="p-4 bg-red-100 rounded-2xl inline-block group-hover:bg-red-200 transition-colors">
                      <ostacolo.icon className="h-10 w-10 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Problema</h3>
                      <p className="text-red-700 font-medium mb-6">{ostacolo.problema}</p>
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Soluzione</h4>
                        <p className="text-green-700 leading-relaxed">{ostacolo.soluzione}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Dove stiamo andando */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Dove stiamo andando
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Entro fine 2025 vogliamo raggiungere questi obiettivi ambiziosi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {obiettivi2025.map((obiettivo, index) => (
              <Card key={index} className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <obiettivo.icon className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-lg text-white leading-relaxed">{obiettivo.obiettivo}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Un invito */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Un invito
            </h2>
          </div>

          <Card className="max-w-5xl mx-auto hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-12">
              <div className="text-center space-y-8">
                <p className="text-2xl text-gray-700 leading-relaxed">
                  Se anche tu credi che la <span className="font-bold text-blue-600">fiducia sia un bene pubblico</span>, 
                  unisciti a noi come utente, professionista o investitore. 
                  La tua voce renderà il mercato dei servizi più giusto per tutti.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <Link href="/auth/register">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4 group">
                      <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Unisciti come utente
                    </Button>
                  </Link>
                  
                  <Link href="/auth/register">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-4 group">
                      <Award className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Diventa professionista
                    </Button>
                  </Link>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-4 group" onClick={() => {
                    window.location.href = 'mailto:info@wolfinder.com?subject=Interesse investimento';
                  }}>
                    <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Investi con noi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}