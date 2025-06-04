import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  UserCheck,
  Mail,
  MapPin,
  Scale,
  Book,
  Settings,
  Lock,
  Globe,
  Info,
  Clock,
  XCircle,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import SiteLayout from "@/components/site-layout";

export default function Terms() {
  const definizioni = [
    {
      termine: "Utente / tu",
      significato: "Persona fisica che accede alla Piattaforma per cercare professionisti o pubblicare recensioni."
    },
    {
      termine: "Professionista",
      significato: "Iscritto con profilo pubblico che offre servizi professionali attraverso Wolfinder."
    },
    {
      termine: "Contenuti dell'Utente",
      significato: "Recensioni, commenti, immagini, video, o altri materiali creati o caricati dall'Utente."
    },
    {
      termine: "Linee guida",
      significato: "Regole che disciplinano la pubblicazione di recensioni e l'utilizzo della Piattaforma."
    }
  ];

  const requisitiAccount = [
    {
      requisito: "Account singolo",
      descrizione: "Ciascun Utente può registrare un solo profilo personale."
    },
    {
      requisito: "Età minima",
      descrizione: "L'Utente deve avere almeno 18 anni."
    },
    {
      requisito: "Credenziali",
      descrizione: "L'iscrizione può avvenire tramite e-mail (con codice di verifica) o account social (Google / Apple / Facebook)."
    },
    {
      requisito: "Nome utente",
      descrizione: "Deve essere unico e non contenere termini offensivi, domini (.com, .it, ecc.) né riferimenti che inducano in errore su identità o ruolo."
    },
    {
      requisito: "Responsabilità",
      descrizione: "L'Utente è responsabile di tutte le attività effettuate dal proprio account. In caso di uso non autorizzato contatti subito support@wolfinder.it."
    }
  ];

  const regoleCondotta = [
    "Utilizzare la Piattaforma in conformità ai presenti Termini, alle Linee guida e alle leggi vigenti",
    "Non pubblicare recensioni false, diffamatorie o manipolate",
    "Non compromettere la sicurezza o l'integrità del sito (iniezioni di codice, virus, scraping non autorizzato, ecc.)",
    "Non utilizzare la Piattaforma per finalità promozionali personali o marketing non richiesto",
    "Non molestare o minacciare altri utenti o il personale Wolfinder",
    "Non decodificare, decompilare, copiare o sfruttare commercialmente la Piattaforma senza consenso scritto"
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center space-y-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-2">
                <FileText className="h-4 w-4 mr-2" />
                Termini e Condizioni
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Termini di utilizzo per i Consumatori
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">
                Versione 1.0 – In vigore dal 4 giugno 2025
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Introduzione */}
          <Card className="mb-12 border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <Info className="h-6 w-6 mr-3" />
                1. Introduzione
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Benvenuto su Wolfinder, la piattaforma di recensioni meritocratiche che connette cittadini 
                  e professionisti (avvocati, commercialisti, architetti, notai, ecc.) per costruire fiducia 
                  e trasparenza.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Accedendo, navigando, cercando o pubblicando contenuti su Wolfinder (di seguito la "Piattaforma"), 
                  accetti integralmente i presenti Termini di utilizzo ("Termini").
                </p>
                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-indigo-800 font-medium mb-2">Wolfinder è gestita da:</p>
                  <p className="text-indigo-700">
                    Wolfinder S.r.l.s., Via Ludovico Antonio Muratori 42, 57124 Livorno (LI) – Italia, 
                    C.F./P. IVA 02027540380
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">I presenti Termini si integrano con:</h4>
                  <ul className="space-y-2 text-purple-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>La nostra Informativa Privacy (Versione 1.0)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Le Linee guida per le Recensioni Wolfinder</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Eventuali ulteriori policy e codici pubblicati sul sito legal.wolfinder.it</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mb-2" />
                  <p className="text-amber-800 font-medium">
                    Se in qualsiasi momento non condividi i Termini o le Policy, devi astenerti dall'utilizzare la Piattaforma.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Definizioni */}
          <Card className="mb-12 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-purple-900">
                <Book className="h-6 w-6 mr-3" />
                2. Definizioni principali
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
                    {definizioni.map((item, index) => (
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

          {/* Iscrizione e Account */}
          <Card className="mb-12 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center text-2xl text-blue-900">
                <UserCheck className="h-6 w-6 mr-3" />
                3. Iscrizione e Account Utente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-6">
                {requisitiAccount.map((item, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      {item.requisito}
                    </h4>
                    <p className="text-blue-700 text-sm">{item.descrizione}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regole di condotta */}
          <Card className="mb-12 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center text-2xl text-green-900">
                <Shield className="h-6 w-6 mr-3" />
                4. Regole di condotta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 mb-6">L'Utente si impegna a:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {regoleCondotta.map((regola, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-900 text-sm">{regola}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Linee guida Recensioni */}
          <Card className="mb-12 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center text-2xl text-amber-900">
                <Settings className="h-6 w-6 mr-3" />
                5. Linee guida Recensioni e Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <p className="text-amber-800 leading-relaxed">
                  Le Linee guida Recensioni definiscono in dettaglio cosa è consentito pubblicare. 
                  Wolfinder può aggiornarle in qualsiasi momento; le modifiche si applicano immediatamente. 
                  L'ignoranza delle Linee guida non esonera da responsabilità.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Proprietà intellettuale */}
          <Card className="mb-12 border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-red-900">
                <Lock className="h-6 w-6 mr-3" />
                6. Proprietà intellettuale
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Tutti i diritti su software, grafica, database, marchi "Wolfinder" e relativi loghi 
                  appartengono a Wolfinder o ai suoi licenzianti.
                </p>
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <AlertTriangle className="h-5 w-5 text-red-600 mb-2" />
                  <p className="text-red-800 font-medium">
                    È vietato riprodurre o utilizzare tali contenuti senza nostro espresso consenso scritto.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenuti dell'Utente */}
          <Card className="mb-12 border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <FileText className="h-6 w-6 mr-3" />
                7. Contenuti dell'Utente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  L'Utente mantiene la titolarità dei propri Contenuti dell'Utente ma concede a Wolfinder 
                  una licenza gratuita, irrevocabile, mondiale e non esclusiva a utilizzare, riprodurre, 
                  distribuire, modificare, tradurre e comunicare tali contenuti al pubblico, anche a scopo 
                  di promozione della Piattaforma, senza obbligo di corrispettivo.
                </p>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600 mb-2" />
                  <p className="text-indigo-800">
                    I Contenuti dell'Utente resteranno visibili finché l'account rimane attivo o finché 
                    non vengano rimossi per violazione dei Termini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistenza */}
          <Card className="mb-12 border-cyan-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-cyan-900">
                <Users className="h-6 w-6 mr-3" />
                10. Assistenza
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <h4 className="font-semibold text-cyan-900 mb-2">Centro Assistenza</h4>
                  <p className="text-cyan-700 text-sm">FAQ e tutorial sono disponibili nel Centro Assistenza.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Supporto</h4>
                  <p className="text-blue-700 text-sm">Per supporto ulteriore contatta support@wolfinder.it</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sospensione account */}
          <Card className="mb-12 border-orange-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center text-2xl text-orange-900">
                <XCircle className="h-6 w-6 mr-3" />
                14. Sospensione o chiusura account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-semibold text-orange-900 mb-2">Sospensione da parte di Wolfinder</h4>
                  <p className="text-orange-800 text-sm">
                    Wolfinder può sospendere o chiudere l'account che violi ripetutamente i Termini o le Linee guida. 
                    Quando possibile, forniremo preavviso con relative motivazioni.
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-900 mb-2">Eliminazione da parte dell'Utente</h4>
                  <p className="text-red-800 text-sm">
                    L'Utente può eliminare il proprio account in qualsiasi momento: in tal caso, 
                    tutte le recensioni saranno definitivamente cancellate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Esclusione responsabilità */}
          <Card className="mb-12 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <AlertTriangle className="h-6 w-6 mr-3" />
                15. Esclusione di responsabilità
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  La Piattaforma è fornita "così com'è" senza garanzia di continuità o assenza di errori. 
                  Nei limiti massimi di legge, Wolfinder non sarà responsabile per danni indiretti, 
                  consequenziali o perdita di profitto.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                  <p className="text-gray-800 font-medium">
                    La responsabilità complessiva, in qualsiasi circostanza, non potrà eccedere 100 € (cento euro).
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    L'Utente terrà indenne Wolfinder da pretese di terzi derivanti da violazioni dei Termini 
                    o utilizzo illecito della Piattaforma.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controversie */}
          <Card className="mb-12 border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center text-2xl text-purple-900">
                <Scale className="h-6 w-6 mr-3" />
                16. Controversie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Per qualsiasi controversia l'Utente si impegna, preliminarmente, a contattare Wolfinder 
                  per una soluzione amichevole.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Foro competente</h4>
                    <p className="text-purple-700 text-sm">
                      In assenza di accordo, è competente in via esclusiva il Foro di Livorno, 
                      fatto salvo il foro inderogabile del consumatore ai sensi dell'art. 66-bis Cod. Cons.
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">Legge applicabile</h4>
                    <p className="text-indigo-700 text-sm">La legge applicabile è quella italiana.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modifiche */}
          <Card className="mb-12 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
              <CardTitle className="flex items-center text-2xl text-green-900">
                <Settings className="h-6 w-6 mr-3" />
                17. Modifiche ai Termini e alla Piattaforma
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 mb-2">Modifiche ai Termini</h4>
                  <p className="text-green-800 text-sm">
                    Wolfinder può aggiornare i Termini in qualsiasi momento: le modifiche saranno pubblicate 
                    su questa pagina con indicazione della data di entrata in vigore e diverranno operative 
                    decorsi 30 giorni. L'uso continuato del servizio costituisce accettazione.
                  </p>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                  <h4 className="font-semibold text-teal-900 mb-2">Modifiche alla Piattaforma</h4>
                  <p className="text-teal-800 text-sm">
                    Ci riserviamo di modificare, sospendere o disattivare la Piattaforma (in tutto o in parte) 
                    per ragioni tecniche, legali o commerciali, con preavviso ove tecnicamente possibile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forza maggiore */}
          <Card className="mb-12 border-yellow-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
              <CardTitle className="flex items-center text-2xl text-yellow-900">
                <Zap className="h-6 w-6 mr-3" />
                18. Forza maggiore
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-800">
                  Non saremo responsabili per ritardi o inadempimenti causati da eventi fuori dal nostro 
                  ragionevole controllo (es. blackout, attacchi DDoS, calamità naturali).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contatti */}
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <Mail className="h-6 w-6 mr-3" />
                Contatti
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
                    <a href="mailto:support@wolfinder.it" className="text-indigo-600 hover:text-indigo-800">
                      support@wolfinder.it
                    </a>
                  </div>
                </div>
                <div className="p-6 bg-indigo-50 rounded-lg text-center">
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200 mb-4">
                    Ultima revisione: 4 giugno 2025
                  </Badge>
                  <p className="text-indigo-700 text-sm">
                    La nullità di una clausola non pregiudica la validità delle restanti. 
                    In caso di conflitto tra versioni, prevale la versione italiana.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA finale */}
          <div className="text-center mt-16">
            <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white">
              <h3 className="text-2xl font-bold mb-4">Hai domande sui nostri Termini di utilizzo?</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Il nostro team di supporto è a disposizione per chiarimenti sui termini e condizioni.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50" onClick={() => {
                  window.location.href = 'mailto:support@wolfinder.it?subject=Domanda Termini e Condizioni';
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Contatta il Supporto
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600" asChild>
                  <Link href="/privacy">
                    Privacy Policy
                  </Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600" asChild>
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