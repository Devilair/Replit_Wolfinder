import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star,
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Camera,
  Clock,
  Users,
  Eye,
  Flag,
  Award,
  Search,
  MessageSquare,
  ThumbsUp,
  Scale,
  Mail
} from "lucide-react";
import { Link } from "wouter";
import SiteLayout from "@/components/site-layout";

export default function LineeGuidaRecensioni() {
  const regoleBase = [
    {
      titolo: "Esperienza reale e verificabile",
      descrizione: "Scrivi solo recensioni basate su un'esperienza diretta e verificabile con il professionista.",
      icon: CheckCircle,
      tipo: "obbligatorio"
    },
    {
      titolo: "Onestà e correttezza",
      descrizione: "Sii onesto e imparziale. Evita esagerazioni eccessive sia positive che negative.",
      icon: Scale,
      tipo: "obbligatorio"
    },
    {
      titolo: "Rispetto e linguaggio appropriato",
      descrizione: "Usa un linguaggio rispettoso e professionale. Evita insulti, volgarità o attacchi personali.",
      icon: Users,
      tipo: "obbligatorio"
    },
    {
      titolo: "Dettagli specifici e utili",
      descrizione: "Fornisci dettagli specifici sul servizio ricevuto per aiutare altri utenti nella scelta.",
      icon: FileText,
      tipo: "consigliato"
    }
  ];

  const contenutoRecensione = [
    {
      elemento: "Valutazione a stelle",
      descrizione: "Da 1 a 5 stelle in base all'esperienza complessiva",
      obbligatorio: true
    },
    {
      elemento: "Tipo di servizio ricevuto",
      descrizione: "Specifica il tipo di consulenza o servizio (es. consulenza fiscale, pratica notarile)",
      obbligatorio: true
    },
    {
      elemento: "Qualità del servizio",
      descrizione: "Descrivi la qualità della prestazione professionale ricevuta",
      obbligatorio: false
    },
    {
      elemento: "Professionalità e competenza",
      descrizione: "Valuta l'approccio professionale e le competenze dimostrate",
      obbligatorio: false
    },
    {
      elemento: "Tempi di risposta",
      descrizione: "Indica se i tempi sono stati rispettati e la reattività del professionista",
      obbligatorio: false
    },
    {
      elemento: "Chiarezza nelle comunicazioni",
      descrizione: "Valuta quanto sono state chiare le spiegazioni e la comunicazione",
      obbligatorio: false
    },
    {
      elemento: "Rapporto qualità-prezzo",
      descrizione: "Esprimi un giudizio sul valore del servizio rispetto al costo",
      obbligatorio: false
    }
  ];

  const cosaNonScrivere = [
    "Recensioni false o inventate",
    "Contenuti diffamatori o calunniosi",
    "Informazioni personali del professionista (indirizzo privato, telefono personale)",
    "Dati sensibili relativi al caso trattato",
    "Linguaggio offensivo, volgare o minaccioso",
    "Contenuti promozionali o pubblicitari",
    "Recensioni duplicate o spam",
    "Accuse non supportate da prove concrete"
  ];

  const processoVerifica = [
    {
      step: "1",
      titolo: "Invio recensione",
      descrizione: "L'utente pubblica la recensione sulla piattaforma"
    },
    {
      step: "2", 
      titolo: "Verifica automatica",
      descrizione: "I nostri algoritmi controllano la recensione per potenziali violazioni"
    },
    {
      step: "3",
      titolo: "Moderazione umana",
      descrizione: "Il team di moderazione verifica manualmente le recensioni segnalate"
    },
    {
      step: "4",
      titolo: "Richiesta documentazione",
      descrizione: "Se necessario, richiediamo prove dell'esperienza (fatture, contratti)"
    },
    {
      step: "5",
      titolo: "Pubblicazione",
      descrizione: "La recensione viene pubblicata dopo aver superato tutti i controlli"
    }
  ];

  const segnalazioni = [
    {
      motivo: "Recensione falsa",
      descrizione: "La recensione sembra inventata o non basata su esperienza reale"
    },
    {
      motivo: "Linguaggio inappropriato",
      descrizione: "Contenuti offensivi, volgari o minacciosi"
    },
    {
      motivo: "Violazione privacy",
      descrizione: "Divulgazione di informazioni personali o riservate"
    },
    {
      motivo: "Spam o duplicato",
      descrizione: "Recensioni ripetute o contenuti promozionali non richiesti"
    },
    {
      motivo: "Diffamazione",
      descrizione: "Accuse gravi non supportate da prove"
    }
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center space-y-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-2">
                <Star className="h-4 w-4 mr-2" />
                Linee Guida
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Linee guida per le recensioni
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                Come scrivere recensioni utili, oneste e verificabili su Wolfinder
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Introduzione */}
          <Card className="mb-12 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="flex items-center text-2xl text-blue-900">
                <Award className="h-6 w-6 mr-3" />
                Perché le recensioni sono importanti
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-blue-900 mb-2">Trasparenza</h3>
                  <p className="text-blue-700 text-sm">Le tue recensioni aiutano a creare un ecosistema trasparente e meritocratico</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-green-900 mb-2">Aiutare gli altri</h3>
                  <p className="text-green-700 text-sm">Condividi la tua esperienza per guidare altri utenti nella scelta</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-purple-900 mb-2">Qualità</h3>
                  <p className="text-purple-700 text-sm">Premia l'eccellenza e incoraggia il miglioramento continuo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regole base */}
          <Card className="mb-12 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center text-2xl text-green-900">
                <CheckCircle className="h-6 w-6 mr-3" />
                Regole fondamentali
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-6">
                {regoleBase.map((regola, index) => {
                  const IconComponent = regola.icon;
                  return (
                    <div key={index} className={`p-6 rounded-lg border-l-4 ${
                      regola.tipo === 'obbligatorio' 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <IconComponent className={`h-6 w-6 mt-1 ${
                          regola.tipo === 'obbligatorio' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                        <div>
                          <h3 className={`font-semibold mb-2 ${
                            regola.tipo === 'obbligatorio' ? 'text-red-900' : 'text-blue-900'
                          }`}>
                            {regola.titolo}
                            <Badge variant="outline" className={`ml-2 ${
                              regola.tipo === 'obbligatorio' 
                                ? 'text-red-700 border-red-300' 
                                : 'text-blue-700 border-blue-300'
                            }`}>
                              {regola.tipo}
                            </Badge>
                          </h3>
                          <p className={`text-sm ${
                            regola.tipo === 'obbligatorio' ? 'text-red-700' : 'text-blue-700'
                          }`}>
                            {regola.descrizione}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cosa includere */}
          <Card className="mb-12 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center text-2xl text-purple-900">
                <FileText className="h-6 w-6 mr-3" />
                Cosa includere nella recensione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-3 px-4 font-semibold text-purple-900">Elemento</th>
                      <th className="text-left py-3 px-4 font-semibold text-purple-900">Descrizione</th>
                      <th className="text-left py-3 px-4 font-semibold text-purple-900">Obbligatorio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contenutoRecensione.map((item, index) => (
                      <tr key={index} className="border-b border-purple-100 hover:bg-purple-25">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.elemento}</td>
                        <td className="py-3 px-4 text-gray-700">{item.descrizione}</td>
                        <td className="py-3 px-4">
                          {item.obbligatorio ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                              Sì
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 border-gray-300">
                              Consigliato
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cosa NON scrivere */}
          <Card className="mb-12 border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-red-900">
                <XCircle className="h-6 w-6 mr-3" />
                Cosa NON includere
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {cosaNonScrivere.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-900 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <AlertTriangle className="h-5 w-5 text-amber-600 mb-2" />
                <p className="text-amber-800 font-medium">
                  Attenzione: Le violazioni di queste regole possono comportare la rimozione della recensione 
                  e la sospensione dell'account.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Processo di verifica */}
          <Card className="mb-12 border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <Shield className="h-6 w-6 mr-3" />
                Processo di verifica delle recensioni
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {processoVerifica.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-indigo-900 mb-1">{step.titolo}</h3>
                      <p className="text-indigo-700 text-sm">{step.descrizione}</p>
                    </div>
                    {index < processoVerifica.length - 1 && (
                      <div className="w-px h-16 bg-indigo-200 ml-5"></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Tempi di verifica</h4>
                <p className="text-indigo-700 text-sm">
                  Le recensioni vengono solitamente verificate entro 24-48 ore. In caso di necessità 
                  di documentazione aggiuntiva, i tempi possono estendersi fino a 5 giorni lavorativi.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Segnalazioni */}
          <Card className="mb-12 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center text-2xl text-orange-900">
                <Flag className="h-6 w-6 mr-3" />
                Come segnalare una recensione inappropriata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-orange-900 mb-4">Motivi di segnalazione</h3>
                  <div className="space-y-3">
                    {segnalazioni.map((item, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-1">{item.motivo}</h4>
                        <p className="text-orange-700 text-sm">{item.descrizione}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 mb-4">Come segnalare</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                      <Flag className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Pulsante di segnalazione</h4>
                        <p className="text-red-700 text-sm">
                          Clicca sull'icona della bandiera accanto alla recensione che vuoi segnalare
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Fornisci dettagli</h4>
                        <p className="text-red-700 text-sm">
                          Spiega brevemente il motivo della segnalazione per velocizzare la revisione
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                      <Clock className="h-5 w-5 text-red-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Attendi la revisione</h4>
                        <p className="text-red-700 text-sm">
                          Il nostro team esaminerà la segnalazione entro 24 ore
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risposta del professionista */}
          <Card className="mb-12 border-cyan-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-cyan-900">
                <MessageSquare className="h-6 w-6 mr-3" />
                Risposta del professionista
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <h4 className="font-semibold text-cyan-900 mb-2">Come funziona</h4>
                  <p className="text-cyan-700 text-sm mb-3">
                    I professionisti possono rispondere pubblicamente alle recensioni per:
                  </p>
                  <ul className="space-y-1 text-cyan-700 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Ringraziare per i feedback positivi</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Chiarire eventuali malintesi</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3" />
                      <span>Dimostrare impegno nel miglioramento</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Moderazione delle risposte</h4>
                  <p className="text-blue-700 text-sm">
                    Anche le risposte dei professionisti sono soggette alle nostre linee guida. 
                    Non sono ammesse risposte aggressive, diffamatorie o che violino la privacy del cliente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="text-center">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl text-white">
              <h3 className="text-2xl font-bold mb-4">Pronto a condividere la tua esperienza?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Aiuta altri utenti a scegliere i migliori professionisti con la tua recensione onesta e dettagliata.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/professionals">
                    <Search className="h-4 w-4 mr-2" />
                    Trova un Professionista
                  </Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
                  window.location.href = 'mailto:support@wolfinder.it?subject=Domanda Linee Guida Recensioni';
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Hai domande?
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}