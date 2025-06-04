import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  FileText, 
  Users, 
  Lock, 
  Clock, 
  Globe, 
  Mail,
  Phone,
  MapPin,
  Eye,
  Database,
  Server,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { Link } from "wouter";
import SiteLayout from "@/components/site-layout";

export default function Privacy() {
  const sections = [
    {
      id: "intro",
      title: "1. Perché leggere questa informativa",
      icon: Info,
      content: "La presente informativa descrive in modo chiaro e trasparente come Wolfinder S.r.l.s. raccoglie, utilizza, condivide e protegge i dati personali degli utenti che accedono alla nostra piattaforma online per cercare o offrire servizi professionali."
    },
    {
      id: "chi-siamo",
      title: "2. Chi siamo",
      icon: Users,
      content: [
        "Titolare del trattamento: Wolfinder S.r.l.s.",
        "Via Ludovico Antonio Muratori 42, 57124 Livorno (LI) – Italia",
        "C.F./P. IVA 02027540380",
        "Responsabile della Protezione dei Dati (DPO): Mirko Collini",
        "E-mail: privacy@wolfinder.it"
      ]
    }
  ];

  const terminologia = [
    {
      termine: "Piattaforma/Sito/Servizio",
      significato: "Il portale web, le web-app e le eventuali app mobile di Wolfinder, comprese API e widget proprietari."
    },
    {
      termine: "Dati personali pubblici",
      significato: "Le informazioni rese pubbliche su Wolfinder (p. es. recensioni, profilo pubblico, risposta del professionista)."
    },
    {
      termine: "Dati personali privati",
      significato: "Le informazioni non pubblicate sulla piattaforma (p. es. documenti di verifica, e-mail, log di accesso)."
    },
    {
      termine: "Utente Consumatore",
      significato: "Persona fisica che consulta o pubblica recensioni di professionisti."
    },
    {
      termine: "Utente Professionista",
      significato: "Avvocati, commercialisti e altri professionisti che creano un profilo per offrire i propri servizi."
    }
  ];

  const datiPubblici = [
    {
      categoria: "Informazioni di account (consumatori)",
      esempi: "Nome utente (reale o pseudonimo), foto profilo, località (facoltativa)."
    },
    {
      categoria: "Contenuto delle recensioni",
      esempi: "Testo, valutazione in stelle, categoria/specializzazione del professionista, data dell'esperienza, eventuali foto o allegati."
    },
    {
      categoria: "Interazioni social",
      esempi: "Conteggio \"Recensione utile\", like ad altre recensioni."
    },
    {
      categoria: "Profili professionisti",
      esempi: "Nome e cognome o ragione sociale, specializzazione, città, descrizione studio, risposte a recensioni, eventuale logo."
    }
  ];

  const datiPrivati = [
    {
      categoria: "Credenziali di accesso",
      esempi: "Indirizzo e-mail, password cifrata, lingua preferita."
    },
    {
      categoria: "Documenti di verifica",
      esempi: "Copia fatture PDF/JPG, numero ordine, ID pratica, ulteriori prove di servizio conservate integralmente dal nostro team."
    },
    {
      categoria: "Dati di pagamento (professionisti)",
      esempi: "IBAN / dati fiscali per fatturazione dei piani a pagamento."
    },
    {
      categoria: "Dati di utilizzo e log",
      esempi: "Indirizzo IP, user-agent browser, fuso orario, dati evento, tempo di permanenza, cronologia ricerche interne."
    },
    {
      categoria: "Comunicazioni",
      esempi: "Ticket di assistenza, e-mail, registrazioni di chiamate VoIP (se il contatto avviene tramite il nostro centralino)."
    }
  ];

  const finalita = [
    {
      finalita: "Fornire e gestire il servizio (creazione account, pubblicazione recensioni, visualizzazione profili)",
      base: "Art. 6 (1)(b) GDPR – esecuzione di un contratto"
    },
    {
      finalita: "Inviare inviti a recensire da parte dei Professionisti",
      base: "Art. 6 (1)(f) – legittimo interesse del professionista (marketing diretto)"
    },
    {
      finalita: "Verificare autenticità delle recensioni",
      base: "Art. 6 (1)(f) – legittimo interesse di Wolfinder a mantenere integrità della piattaforma"
    },
    {
      finalita: "Fatturazione dei piani a pagamento",
      base: "Art. 6 (1)(c) – obbligo legale contabile"
    },
    {
      finalita: "Attività di analisi interna e miglioramento prodotto",
      base: "Art. 6 (1)(f) – legittimo interesse"
    },
    {
      finalita: "Comunicazioni di servizio e newsletter",
      base: "Art. 6 (1)(b) o (a) – contratto / consenso"
    },
    {
      finalita: "Conservazione log e sicurezza IT",
      base: "Art. 6 (1)(c) e (f) – obbligo legale / interesse legittimo"
    }
  ];

  const conservazione = [
    {
      categoria: "Recensioni e profili",
      periodo: "Fintanto che l'account rimane attivo + 12 mesi; quindi anonimizzati."
    },
    {
      categoria: "Documenti di verifica",
      periodo: "5 anni dalla data di caricamento, salvo contestazioni in corso."
    },
    {
      categoria: "Log di accesso e sicurezza",
      periodo: "24 mesi salvo necessità di investigazione."
    },
    {
      categoria: "Dati di fatturazione",
      periodo: "10 anni ai sensi di normativa fiscale."
    }
  ];

  const diritti = [
    "Accesso ai propri dati personali (art. 15 GDPR)",
    "Rettifica di dati inesatti (art. 16 GDPR)",
    "Cancellazione dei dati (art. 17 GDPR)",
    "Limitazione del trattamento (art. 18 GDPR)",
    "Opposizione al trattamento (art. 21 GDPR)",
    "Portabilità dei dati (art. 20 GDPR)",
    "Revoca del consenso (art. 7 GDPR)"
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
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Informativa sulla Privacy
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                Versione 1.0 – In vigore dal 4 giugno 2025
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Introduzione */}
          <Card className="mb-12 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center text-2xl text-blue-900">
                <Info className="h-6 w-6 mr-3" />
                1. Perché leggere questa informativa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                La presente informativa descrive in modo chiaro e trasparente come Wolfinder S.r.l.s. 
                (di seguito "Wolfinder", "noi", "nostro") raccoglie, utilizza, condivide e protegge i dati 
                personali degli utenti che accedono alla nostra piattaforma online per cercare o offrire 
                servizi professionali.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800 font-medium">
                  La piattaforma di Wolfinder è fondata su un principio di merito e trasparenza; 
                  di conseguenza la tutela dei dati personali dei nostri utenti è un impegno prioritario 
                  e parte integrante del servizio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Chi siamo */}
          <Card className="mb-12 border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <Users className="h-6 w-6 mr-3" />
                2. Chi siamo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Titolare del trattamento</p>
                      <p className="text-gray-700">Wolfinder S.r.l.s.</p>
                      <p className="text-gray-600">Via Ludovico Antonio Muratori 42</p>
                      <p className="text-gray-600">57124 Livorno (LI) – Italia</p>
                      <p className="text-gray-600">C.F./P. IVA 02027540380</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-indigo-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Responsabile della Protezione dei Dati (DPO)</p>
                      <p className="text-gray-700">Mirko Collini</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href="mailto:privacy@wolfinder.it" className="text-indigo-600 hover:text-indigo-800">
                          privacy@wolfinder.it
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terminologia */}
          <Card className="mb-12 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-purple-900">
                <FileText className="h-6 w-6 mr-3" />
                3. Termini utilizzati in questa informativa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-purple-200">
                      <th className="text-left py-3 px-4 font-semibold text-purple-900">Termine</th>
                      <th className="text-left py-3 px-4 font-semibold text-purple-900">Significato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terminologia.map((item, index) => (
                      <tr key={index} className="border-b border-purple-100 hover:bg-purple-25">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.termine}</td>
                        <td className="py-3 px-4 text-gray-700">{item.significato}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Collegamenti a siti di terzi */}
          <Card className="mb-12 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center text-2xl text-amber-900">
                <Globe className="h-6 w-6 mr-3" />
                4. Collegamenti a siti di terzi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">
                  La piattaforma può contenere link a siti esterni di terze parti. Tali siti operano in autonomia 
                  e non sono coperti dalla presente informativa. Invitiamo gli utenti a consultare le rispettive 
                  privacy policy prima di fornire dati personali.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Piattaforma aperta */}
          <Card className="mb-12 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center text-2xl text-green-900">
                <Eye className="h-6 w-6 mr-3" />
                5. Una piattaforma aperta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-green-800 leading-relaxed">
                  Le recensioni pubblicate da un Utente Consumatore, nonché i profili e le eventuali risposte 
                  degli Utenti Professionisti, sono visibili a chiunque navighi su Internet. Al momento della 
                  creazione del profilo l'utente può scegliere quante informazioni personali rendere pubbliche.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dati che trattiamo */}
          <Card className="mb-12 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center text-2xl text-blue-900">
                <Database className="h-6 w-6 mr-3" />
                6. Quali dati trattiamo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Dati pubblici */}
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    6.1 Dati personali pubblici
                  </h3>
                  <div className="space-y-4">
                    {datiPubblici.map((item, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">{item.categoria}</h4>
                        <p className="text-blue-700 text-sm">{item.esempi}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dati privati */}
                <div>
                  <h3 className="text-xl font-semibold text-cyan-900 mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    6.2 Dati personali privati
                  </h3>
                  <div className="space-y-4">
                    {datiPrivati.map((item, index) => (
                      <div key={index} className="p-4 bg-cyan-50 rounded-lg">
                        <h4 className="font-medium text-cyan-900 mb-2">{item.categoria}</h4>
                        <p className="text-cyan-700 text-sm">{item.esempi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Come raccogliamo i dati */}
          <Card className="mb-12 border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <Server className="h-6 w-6 mr-3" />
                7. Come raccogliamo i dati
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-3">Direttamente dall'utente</h4>
                  <p className="text-indigo-700 text-sm">
                    Registrazione account, pubblicazione recensioni, creazione profilo professionista, 
                    caricamento documenti di verifica.
                  </p>
                </div>
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Indirettamente</h4>
                  <p className="text-blue-700 text-sm">
                    Inviti a recensire inviati dal Professionista (marketing diretto), 
                    dati di log raccolti automaticamente.
                  </p>
                </div>
                <div className="p-6 bg-cyan-50 rounded-lg">
                  <h4 className="font-semibold text-cyan-900 mb-3">Cookie e tecnologie simili</h4>
                  <p className="text-cyan-700 text-sm">
                    Cookie tecnici e, previo consenso, cookie di analisi e profilazione. 
                    Lista completa nella Cookie Policy.
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 text-sm">
                  <strong>Nota:</strong> al momento non utilizziamo terze parti per advertising personalizzato; 
                  qualsiasi integrazione futura verrà preventivamente documentata nella Cookie Policy e soggetta a consenso.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Finalità e basi giuridiche */}
          <Card className="mb-12 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
              <CardTitle className="flex items-center text-2xl text-green-900">
                <CheckCircle className="h-6 w-6 mr-3" />
                9. Finalità e basi giuridiche del trattamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-green-200">
                      <th className="text-left py-3 px-4 font-semibold text-green-900">Finalità</th>
                      <th className="text-left py-3 px-4 font-semibold text-green-900">Base giuridica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalita.map((item, index) => (
                      <tr key={index} className="border-b border-green-100 hover:bg-green-25">
                        <td className="py-3 px-4 text-gray-900">{item.finalita}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{item.base}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Condivisione dati */}
          <Card className="mb-12 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-purple-900">
                <Users className="h-6 w-6 mr-3" />
                10. Con chi condividiamo i dati
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Utenti della piattaforma</h4>
                    <p className="text-purple-700 text-sm">I dati personali pubblici sono visibili a chiunque.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Responsabili del trattamento</h4>
                    <p className="text-purple-700 text-sm">
                      Fornitori di hosting situati in Italia (data center Milano) e fornitori di servizi funzionali.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <h4 className="font-semibold text-pink-900 mb-2">Autorità competenti</h4>
                    <p className="text-pink-700 text-sm">Ove richiesto da legge o provvedimento.</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <h4 className="font-semibold text-pink-900 mb-2">Terze parti indipendenti</h4>
                    <p className="text-pink-700 text-sm">
                      Al momento non condividiamo dati con motori di comparazione o API pubbliche.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conservazione */}
          <Card className="mb-12 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardTitle className="flex items-center text-2xl text-amber-900">
                <Clock className="h-6 w-6 mr-3" />
                12. Conservazione dei dati
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-200">
                      <th className="text-left py-3 px-4 font-semibold text-amber-900">Categoria</th>
                      <th className="text-left py-3 px-4 font-semibold text-amber-900">Periodo di conservazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conservazione.map((item, index) => (
                      <tr key={index} className="border-b border-amber-100 hover:bg-amber-25">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.categoria}</td>
                        <td className="py-3 px-4 text-gray-700">{item.periodo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 text-sm">
                  L'utente può richiedere la cancellazione anticipata; alcuni dati potranno essere trattenuti 
                  per obblighi legali o per difesa di diritti in sede giudiziaria.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sicurezza */}
          <Card className="mb-12 border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-red-900">
                <Shield className="h-6 w-6 mr-3" />
                13. Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-900 mb-3">Misure tecniche adottate</h4>
                  <ul className="space-y-2 text-red-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Crittografia dei dati in transito (TLS 1.3)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Accesso role-based</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Backup giornalieri</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Vulnerability scanning periodico</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <AlertTriangle className="h-5 w-5 text-red-600 mb-2" />
                  <p className="text-red-800 text-sm">
                    La trasmissione via Internet non può garantire sicurezza assoluta; 
                    si invita a non inviare informazioni particolarmente sensibili via e-mail.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diritti dell'interessato */}
          <Card className="mb-12 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center text-2xl text-blue-900">
                <FileText className="h-6 w-6 mr-3" />
                15. Diritti dell'interessato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 mb-6">
                Gli utenti possono esercitare in qualsiasi momento i diritti previsti dagli artt. 15-22 GDPR:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {diritti.map((diritto, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-900">{diritto}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Come esercitare i tuoi diritti</h4>
                <div className="flex items-center space-x-2 mb-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700">Scrivi a: </span>
                  <a href="mailto:privacy@wolfinder.it" className="text-blue-600 hover:text-blue-800 font-medium">
                    privacy@wolfinder.it
                  </a>
                </div>
                <p className="text-blue-700 text-sm">
                  È possibile presentare reclamo al Garante per la Protezione dei Dati Personali 
                  (www.garanteprivacy.it) o all'autorità locale competente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Minori */}
          <Card className="mb-12 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center text-2xl text-orange-900">
                <AlertTriangle className="h-6 w-6 mr-3" />
                16. Minori di 18 anni
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p className="text-orange-800 font-medium">
                  La piattaforma è vietata ai minori di 18 anni. Non raccogliamo consapevolmente dati da minori; 
                  qualora ne fossimo a conoscenza, provvederemo alla cancellazione immediata.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modifiche */}
          <Card className="mb-12 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <FileText className="h-6 w-6 mr-3" />
                17. Modifiche alla presente informativa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 leading-relaxed">
                Eventuali aggiornamenti sostanziali saranno pubblicati su questa pagina e, se opportuno, 
                comunicati via e-mail almeno 30 giorni prima dell'entrata in vigore. L'uso continuato dei 
                servizi dopo tale data comporta l'accettazione delle modifiche.
              </p>
            </CardContent>
          </Card>

          {/* Contatti finali */}
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <Mail className="h-6 w-6 mr-3" />
                18. Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Wolfinder S.r.l.s.</p>
                      <p className="text-gray-600">Via Ludovico Antonio Muratori 42</p>
                      <p className="text-gray-600">57124 Livorno (LI)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    <a href="mailto:privacy@wolfinder.it" className="text-indigo-600 hover:text-indigo-800">
                      privacy@wolfinder.it
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <span className="text-gray-700">DPO: Mirko Collini</span>
                  </div>
                </div>
                <div className="p-6 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-3">Reclami</h4>
                  <p className="text-indigo-700 text-sm mb-3">
                    Se ritieni che il trattamento dei tuoi dati violi la normativa, hai diritto di proporre 
                    reclamo al Garante Privacy o all'autorità di controllo dello Stato UE in cui risiedi.
                  </p>
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      Ultima revisione: 4 giugno 2025
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA finale */}
          <div className="text-center mt-16">
            <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
              <h3 className="text-2xl font-bold mb-4">Hai domande sulla nostra Privacy Policy?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Il nostro team è a disposizione per chiarimenti e per aiutarti a esercitare i tuoi diritti.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => {
                  window.location.href = 'mailto:privacy@wolfinder.it?subject=Domanda Privacy Policy';
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contatta il DPO
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                  <Link href="/">
                    Torna alla Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}