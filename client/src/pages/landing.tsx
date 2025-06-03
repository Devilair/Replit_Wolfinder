import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Star, 
  MapPin, 
  Shield, 
  Eye, 
  Scale, 
  CheckCircle, 
  Users, 
  Award,
  FileCheck,
  BarChart3,
  Quote,
  ChevronRight,
  Zap,
  Plus,
  Minus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Professional, Category } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";

export default function Landing() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: professionals } = useQuery<(Professional & { user: any; category: Category })[]>({
    queryKey: ["/api/professionals/featured"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = () => {
    let searchUrl = "/professionals";
    const params = new URLSearchParams();
    
    if (selectedCategory) params.append("category", selectedCategory);
    if (searchLocation) params.append("location", searchLocation);
    
    if (params.toString()) {
      searchUrl += "?" + params.toString();
    }
    
    window.location.href = searchUrl;
  };

  const faqs = [
    {
      question: "Come vengono verificate le recensioni su Wolfinder?",
      answer: "Ogni recensione può essere supportata da documenti come fatture o altri attestati di servizio ricevuto. Il nostro team verifica manualmente l'autenticità di questi documenti e la corrispondenza con il professionista recensito."
    },
    {
      question: "Chi può iscriversi come professionista?",
      answer: "Possono iscriversi avvocati, commercialisti, notai, ingegneri e architetti regolarmente iscritti ai rispettivi albi professionali nelle città di Ferrara e Livorno."
    },
    {
      question: "È completamente gratuito utilizzare Wolfinder come utente?",
      answer: "Sì, la ricerca e la consultazione di professionisti e recensioni è completamente gratuita per gli utenti. Pagano solo i professionisti per essere presenti sulla piattaforma."
    },
    {
      question: "Cosa succede se ricevo una recensione negativa?",
      answer: "Le recensioni negative autentiche rimangono visibili in quanto parte integrante della trasparenza. Tuttavia, hai la possibilità di rispondere pubblicamente per chiarire la tua posizione."
    },
    {
      question: "Come funziona l'algoritmo di ranking dei professionisti?",
      answer: "Il ranking si basa al 60% sulla qualità delle recensioni (con peso maggiore per quelle verificate), 15% sul numero di recensioni, 10% sui tempi di risposta, 10% sulla completezza del profilo e 5% sull'engagement."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold text-gray-900">Wolfinder</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">Chi Siamo</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">Come Funziona</Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">Categorie</Link>
              <Link href="/for-professionals" className="text-gray-600 hover:text-gray-900 transition-colors">Per i Professionisti</Link>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost">Accedi</Button>
              <Button className="bg-amber-600 hover:bg-amber-700">Registrati</Button>
              <Link href="/admin-login">
                <Button variant="outline" size="sm" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:py-32 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Trova professionisti 
              <span className="text-amber-600"> affidabili</span>, 
              basandoti su esperienze reali
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
              Wolfinder trasforma il modo in cui scegli avvocati, commercialisti e altri professionisti 
              grazie a recensioni verificate e un sistema 100% meritocratico
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-16">
              <div className="grid md:grid-cols-3 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-14 text-left">
                    <SelectValue placeholder="Categoria professionale" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Città o CAP"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="h-14"
                />
                
                <Button 
                  onClick={handleSearch}
                  className="h-14 bg-amber-600 hover:bg-amber-700 font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Trova Professionisti
                </Button>
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-wrap justify-center gap-12 text-gray-600">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {professionals?.length || 0}+
                </div>
                <div className="text-sm font-medium">professionisti verificati</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2,847</div>
                <div className="text-sm font-medium">recensioni autentiche</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">2</div>
                <div className="text-sm font-medium">città italiane</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trovare il professionista giusto in tre semplici passi
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <Search className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Cerca nella tua zona</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Filtra per categoria, specializzazione e località per trovare esattamente ciò di cui hai bisogno
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Scale className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Confronta recensioni verificate</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Leggi esperienze autentiche di altri clienti, con prove di acquisto verificate dal nostro team
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Scegli con fiducia</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Seleziona il professionista più adatto a te, basandoti su dati reali e trasparenti
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline" 
              size="lg"
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              Inizia la tua ricerca
            </Button>
          </div>
        </div>
      </section>

      {/* Perché Wolfinder è Diverso */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Un nuovo standard di trasparenza professionale
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Wolfinder nasce per risolvere un problema reale: come distinguere tra recensioni autentiche 
                e quelle manipolate o false. Ecco cosa ci rende diversi:
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FileCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verificazione rigorosa</h3>
                    <p className="text-gray-600">
                      Ogni recensione può essere supportata da prove di acquisto verificate dal nostro team
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Algoritmo meritocratico</h3>
                    <p className="text-gray-600">
                      I professionisti emergono per la qualità del loro servizio, non per quanto spendono in pubblicità
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Trasparenza totale</h3>
                    <p className="text-gray-600">
                      I criteri di valutazione e ranking sono pubblici e consultabili da tutti
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Zero manipolazione</h3>
                    <p className="text-gray-600">
                      Nessuna possibilità di nascondere recensioni negative o promuovere quelle positive
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-12 shadow-xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Award className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sistema di Verifica</h3>
                <p className="text-gray-600 mb-8">
                  Ogni recensione passa attraverso il nostro rigoroso processo di controllo per garantire autenticità
                </p>
                <div className="flex items-center justify-center gap-3 text-green-600">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Certificato Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorie Professionali */}
      <section id="categories" className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Esplora per categoria professionale
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories?.map((category) => (
              <Link key={category.id} href={`/professionals?category=${category.slug}`}>
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 hover:border-amber-600">
                  <CardHeader className="text-center p-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                      <Users className="w-8 h-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2 group-hover:text-amber-600 transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      <span className="font-semibold text-gray-900">{category.count || 0}</span> professionisti verificati
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">4.8 media</span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/categories">
              <Button variant="outline" size="lg" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                Vedi tutte le categorie
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Come Garantiamo l'Autenticità */}
      <section className="px-4 py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Il nostro processo di verifica in 4 passaggi
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Registrazione verificata</h3>
              <p className="text-gray-600">
                Ogni utente deve verificare la propria identità con email e numero di telefono
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Prova di servizio</h3>
              <p className="text-gray-600">
                Gli utenti possono caricare fatture o altri documenti che attestano il servizio ricevuto
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Verifica del team</h3>
              <p className="text-gray-600">
                Il nostro team controlla l'autenticità dei documenti e la corrispondenza con il professionista
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Badge di verifica</h3>
              <p className="text-gray-600">
                Le recensioni verificate ricevono un badge speciale visibile a tutti
              </p>
            </div>
          </div>
          
          <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-blue-900">Nota informativa</span>
            </div>
            <p className="text-blue-800">
              Le recensioni non verificate sono comunque visibili ma chiaramente etichettate e hanno un peso minore nel rating complessivo.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonianze */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Esperienze di chi ha scelto con Wolfinder
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardContent className="p-0">
                <Quote className="w-12 h-12 text-amber-600 mb-6" />
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  "Dovevo trovare un commercialista affidabile per la mia startup. Su Wolfinder ho trovato recensioni dettagliate e verificate che mi hanno aiutato a scegliere il professionista perfetto."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Marco R.</div>
                    <div className="text-sm text-gray-600">Imprenditore, Ferrara</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-8">
              <CardContent className="p-0">
                <Quote className="w-12 h-12 text-amber-600 mb-6" />
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  "Come avvocato, apprezzo la trasparenza di Wolfinder. Qui il mio impegno per la qualità viene riconosciuto e premiato con una maggiore visibilità."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Avv. Sara M.</div>
                    <div className="text-sm text-gray-600">Studio Legale, Livorno</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Per i Professionisti */}
      <section className="px-4 py-24 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Sei un professionista? Emergere per merito è possibile
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Su Wolfinder, la qualità del tuo servizio parla più forte di qualsiasi pubblicità
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Profilo verificato che ispira fiducia</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Visibilità basata sul merito e sulle recensioni autentiche</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Strumenti di analisi per comprendere e migliorare la tua reputazione</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">Differenziati dalla concorrenza grazie alla trasparenza</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-100 font-semibold">
                  Registra la tua attività
                </Button>
                <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
                  Scopri i nostri piani
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-12">
                <Award className="w-24 h-24 mx-auto mb-6 text-white" />
                <h3 className="text-2xl font-bold mb-4">Eccellenza Premiata</h3>
                <p className="text-lg opacity-90">
                  I professionisti che offrono un servizio eccellente vengono automaticamente promossi 
                  nei risultati di ricerca
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Domande frequenti
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/faq">
              <Button variant="outline" size="lg" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                Vedi tutte le FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Finale */}
      <section className="px-4 py-24 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto a trovare il professionista perfetto per le tue esigenze?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
            Unisciti alla comunità di Wolfinder e trasforma il modo in cui scegli e valuti i servizi professionali
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-4"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5 mr-2" />
              Cerca professionisti
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4"
            >
              Registra la tua attività
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-8 w-8 text-amber-600" />
                <span className="text-2xl font-bold text-gray-900">Wolfinder</span>
              </div>
              <p className="text-gray-600 mb-6">
                La piattaforma che trasforma il modo in cui scegli i professionisti, 
                basandoti su trasparenza e merito.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Navigazione</h3>
              <div className="space-y-3">
                <Link href="/" className="block text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
                <Link href="/about" className="block text-gray-600 hover:text-gray-900 transition-colors">Chi Siamo</Link>
                <Link href="/how-it-works" className="block text-gray-600 hover:text-gray-900 transition-colors">Come Funziona</Link>
                <Link href="/categories" className="block text-gray-600 hover:text-gray-900 transition-colors">Categorie</Link>
                <Link href="/for-professionals" className="block text-gray-600 hover:text-gray-900 transition-colors">Per i Professionisti</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Categorie</h3>
              <div className="space-y-3">
                {categories?.slice(0, 5).map((category) => (
                  <Link 
                    key={category.id}
                    href={`/professionals?category=${category.slug}`} 
                    className="block text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Informazioni</h3>
              <div className="space-y-3">
                <Link href="/terms" className="block text-gray-600 hover:text-gray-900 transition-colors">Termini e Condizioni</Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link>
                <Link href="/cookies" className="block text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</Link>
                <Link href="/guidelines" className="block text-gray-600 hover:text-gray-900 transition-colors">Linee guida recensioni</Link>
                <Link href="/support" className="block text-gray-600 hover:text-gray-900 transition-colors">Centro assistenza</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">
              © 2024 Wolfinder. Tutti i diritti riservati.
            </p>
            <p className="text-sm text-gray-500">
              Ospitato su server in Italia • GDPR Compliant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}