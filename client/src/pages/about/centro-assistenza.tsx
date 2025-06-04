import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle,
  MessageSquare, 
  Search, 
  User, 
  Star,
  Shield,
  CreditCard,
  Settings,
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  Eye,
  Lock,
  Trash2,
  Edit,
  Flag,
  Award
} from "lucide-react";
import { Link } from "wouter";
import SiteLayout from "@/components/site-layout";

export default function CentroAssistenza() {
  const faqCategorie = [
    {
      categoria: "Account e Registrazione",
      icon: User,
      color: "blue",
      domande: [
        {
          domanda: "Come posso registrarmi su Wolfinder?",
          risposta: "Puoi registrarti facilmente usando la tua email o tramite account social (Google, Facebook, Apple). Clicca su 'Registrati' in alto a destra e segui la procedura guidata."
        },
        {
          domanda: "Posso avere più di un account?",
          risposta: "No, ogni utente può avere un solo account personale su Wolfinder. Questo ci aiuta a mantenere l'integrità e l'autenticità delle recensioni."
        },
        {
          domanda: "Come posso eliminare il mio account?",
          risposta: "Vai nelle impostazioni del tuo profilo e seleziona 'Elimina account'. Attenzione: questa azione cancellerà permanentemente tutte le tue recensioni e non può essere annullata."
        },
        {
          domanda: "Ho dimenticato la password, cosa faccio?",
          risposta: "Clicca su 'Password dimenticata?' nella pagina di login e inserisci la tua email. Riceverai un link per reimpostare la password."
        }
      ]
    },
    {
      categoria: "Recensioni",
      icon: Star,
      color: "green",
      domande: [
        {
          domanda: "Posso scrivere una recensione anonima?",
          risposta: "Tutte le recensioni su Wolfinder richiedono un account verificato per garantire autenticità. Puoi scegliere di mostrare solo il tuo nome utente invece del nome reale."
        },
        {
          domanda: "Quanto tempo ho per scrivere una recensione?",
          risposta: "Puoi scrivere una recensione fino a 2 anni dalla data del servizio ricevuto. Questo limite ci aiuta a mantenere le recensioni rilevanti e accurate."
        },
        {
          domanda: "Posso modificare o eliminare la mia recensione?",
          risposta: "Puoi modificare la tua recensione entro 48 ore dalla pubblicazione. Dopo questo periodo, contatta il supporto per richieste di modifica giustificate."
        },
        {
          domanda: "Il professionista ha risposto alla mia recensione, posso replicare?",
          risposta: "Al momento non è possibile rispondere alle risposte dei professionisti per evitare discussioni prolungate. Se hai ulteriori preoccupazioni, contatta il nostro supporto."
        },
        {
          domanda: "La mia recensione non è stata pubblicata, perché?",
          risposta: "Le recensioni passano attraverso un processo di verifica. Potrebbero essere necessarie 24-48 ore. Se supera questo tempo, la recensione potrebbe non rispettare le nostre linee guida."
        }
      ]
    },
    {
      categoria: "Ricerca Professionisti",
      icon: Search,
      color: "purple",
      domande: [
        {
          domanda: "Come posso trovare il professionista giusto per me?",
          risposta: "Usa i filtri di ricerca per categoria, città, valutazione e specializzazione. Leggi attentamente le recensioni per valutare l'esperienza di altri clienti."
        },
        {
          domanda: "Perché vedo solo professionisti di Ferrara e Livorno?",
          risposta: "Attualmente Wolfinder è attivo solo nelle città di Ferrara e Livorno. Stiamo lavorando per espandere il servizio in altre città italiane."
        },
        {
          domanda: "Come sono ordinati i risultati di ricerca?",
          risposta: "I risultati sono ordinati secondo il nostro algoritmo meritocratico che considera valutazioni, numero di recensioni verificate, completezza del profilo e attività recente."
        },
        {
          domanda: "Posso contattare direttamente un professionista?",
          risposta: "Sì, ogni profilo mostra i contatti pubblici del professionista. Wolfinder non gestisce le comunicazioni dirette tra utenti e professionisti."
        }
      ]
    },
    {
      categoria: "Per i Professionisti",
      icon: Building,
      color: "orange",
      domande: [
        {
          domanda: "Come posso registrarmi come professionista?",
          risposta: "Clicca su 'Per i Professionisti' e compila il modulo di registrazione. Dovrai verificare la tua identità professionale caricando i documenti richiesti."
        },
        {
          domanda: "Quanto costa avere un profilo su Wolfinder?",
          risposta: "Il profilo base è gratuito. Offriamo anche piani premium con funzionalità aggiuntive come maggiore visibilità e statistiche avanzate."
        },
        {
          domanda: "Come posso migliorare la mia posizione nei risultati?",
          risposta: "Completa il tuo profilo, mantieni informazioni aggiornate, rispondi professionalmente alle recensioni e offri sempre un servizio di qualità per ottenere recensioni positive."
        },
        {
          domanda: "Posso rimuovere una recensione negativa?",
          risposta: "Le recensioni possono essere rimosse solo se violano le nostre linee guida. Puoi segnalare recensioni inappropriate o rispondere pubblicamente per chiarire la tua posizione."
        }
      ]
    },
    {
      categoria: "Privacy e Sicurezza",
      icon: Shield,
      color: "red",
      domande: [
        {
          domanda: "Come vengono protetti i miei dati personali?",
          risposta: "Wolfinder rispetta rigorosamente il GDPR. I tuoi dati sono crittografati e utilizzati solo per i servizi della piattaforma. Leggi la nostra Privacy Policy per dettagli completi."
        },
        {
          domanda: "Chi può vedere le mie recensioni?",
          risposta: "Le recensioni sono pubbliche e visibili a tutti gli utenti di internet. Puoi scegliere di mostrare solo il tuo nome utente invece del nome reale."
        },
        {
          domanda: "Come segnalo un comportamento inappropriato?",
          risposta: "Usa il pulsante 'Segnala' presente su ogni recensione o profilo, oppure contatta direttamente il nostro supporto con dettagli specifici."
        },
        {
          domanda: "Posso richiedere la cancellazione dei miei dati?",
          risposta: "Sì, hai diritto alla cancellazione dei tuoi dati secondo il GDPR. Contatta privacy@wolfinder.it per esercitare questo diritto."
        }
      ]
    }
  ];

  const contattiSupporto = [
    {
      tipo: "Email Generale",
      contatto: "support@wolfinder.it",
      descrizione: "Per domande generali, problemi tecnici e assistenza account",
      tempoRisposta: "24-48 ore",
      icon: Mail
    },
    {
      tipo: "Privacy e GDPR",
      contatto: "privacy@wolfinder.it",
      descrizione: "Per questioni relative alla privacy, richieste GDPR e protezione dati",
      tempoRisposta: "48-72 ore",
      icon: Lock
    },
    {
      tipo: "Segnalazioni",
      contatto: "moderation@wolfinder.it",
      descrizione: "Per segnalare contenuti inappropriati, recensioni false o violazioni",
      tempoRisposta: "12-24 ore",
      icon: Flag
    }
  ];

  const risorseTutorial = [
    {
      titolo: "Come scrivere una recensione efficace",
      descrizione: "Guida passo-passo per scrivere recensioni utili e dettagliate",
      link: "/linee-guida-recensioni",
      categoria: "Recensioni"
    },
    {
      titolo: "Registrazione e verifica professionista",
      descrizione: "Processo completo per creare e verificare il tuo profilo professionale",
      link: "/auth/register",
      categoria: "Professionisti"
    },
    {
      titolo: "Privacy e protezione dati",
      descrizione: "Come proteggiamo i tuoi dati e come gestire le impostazioni privacy",
      link: "/privacy",
      categoria: "Privacy"
    },
    {
      titolo: "Termini di utilizzo",
      descrizione: "Regole e condizioni per l'uso della piattaforma Wolfinder",
      link: "/terms",
      categoria: "Legale"
    }
  ];

  const problemiComuni = [
    {
      problema: "Non riesco ad accedere al mio account",
      soluzioni: [
        "Verifica di aver inserito email e password corrette",
        "Prova a reimpostare la password",
        "Controlla che l'account non sia stato sospeso",
        "Cancella cache e cookies del browser"
      ]
    },
    {
      problema: "La mia recensione non appare",
      soluzioni: [
        "Attendi 24-48 ore per il processo di verifica",
        "Verifica che rispetti le linee guida recensioni",
        "Controlla di non aver già recensito lo stesso professionista",
        "Assicurati di aver completato tutti i campi obbligatori"
      ]
    },
    {
      problema: "Non trovo il professionista che cerco",
      soluzioni: [
        "Verifica che operi nelle città coperte (Ferrara/Livorno)",
        "Prova ricerche con parole chiave diverse",
        "Contatta il professionista per invitarlo su Wolfinder",
        "Usa filtri meno restrittivi nella ricerca"
      ]
    }
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center space-y-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-6 py-2">
                <HelpCircle className="h-4 w-4 mr-2" />
                Centro Assistenza
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Come possiamo aiutarti?
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
                Trova risposte alle tue domande o contatta il nostro team di supporto
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Ricerca rapida */}
          <Card className="mb-12 border-purple-200 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Ricerca rapida</h2>
                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Cerca nelle FAQ... (es. come scrivere recensione, eliminare account)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-gray-600">Oppure esplora le categorie qui sotto</p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ per categoria */}
          <div className="space-y-8 mb-16">
            {faqCategorie.map((categoria, index) => {
              const IconComponent = categoria.icon;
              const colorClasses = {
                blue: "border-blue-200 bg-blue-50 text-blue-900",
                green: "border-green-200 bg-green-50 text-green-900",
                purple: "border-purple-200 bg-purple-50 text-purple-900",
                orange: "border-orange-200 bg-orange-50 text-orange-900",
                red: "border-red-200 bg-red-50 text-red-900"
              };

              return (
                <Card key={index} className={`shadow-lg ${colorClasses[categoria.color].split(' ')[0]}`}>
                  <CardHeader className={`${colorClasses[categoria.color]}`}>
                    <CardTitle className="flex items-center text-2xl">
                      <IconComponent className="h-6 w-6 mr-3" />
                      {categoria.categoria}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {categoria.domande.map((faq, faqIndex) => (
                        <div key={faqIndex} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-start">
                            <HelpCircle className="h-5 w-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            {faq.domanda}
                          </h3>
                          <p className="text-gray-700 leading-relaxed ml-7">{faq.risposta}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Problemi comuni */}
          <Card className="mb-12 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center text-2xl text-amber-900">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Problemi comuni e soluzioni rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {problemiComuni.map((item, index) => (
                  <div key={index} className="p-6 bg-amber-50 rounded-lg">
                    <h3 className="font-semibold text-amber-900 mb-4">{item.problema}</h3>
                    <div className="space-y-2">
                      {item.soluzioni.map((soluzione, solIndex) => (
                        <div key={solIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-800 text-sm">{soluzione}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risorse e tutorial */}
          <Card className="mb-12 border-indigo-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-indigo-900">
                <FileText className="h-6 w-6 mr-3" />
                Guide e tutorial
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {risorseTutorial.map((risorsa, index) => (
                  <div key={index} className="p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-indigo-900 mb-2">{risorsa.titolo}</h3>
                        <p className="text-indigo-700 text-sm mb-3">{risorsa.descrizione}</p>
                        <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                          {risorsa.categoria}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild className="ml-4">
                        <Link href={risorsa.link}>
                          Leggi
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contatti supporto */}
          <Card className="mb-12 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <MessageSquare className="h-6 w-6 mr-3" />
                Contatta il supporto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {contattiSupporto.map((contatto, index) => {
                  const IconComponent = contatto.icon;
                  return (
                    <div key={index} className="p-6 bg-gray-50 rounded-lg text-center">
                      <IconComponent className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">{contatto.tipo}</h3>
                      <p className="text-gray-700 text-sm mb-3">{contatto.descrizione}</p>
                      <a 
                        href={`mailto:${contatto.contatto}`}
                        className="text-blue-600 hover:text-blue-800 font-medium block mb-2"
                      >
                        {contatto.contatto}
                      </a>
                      <div className="flex items-center justify-center space-x-1 text-gray-500 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Risposta in {contatto.tempoRisposta}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">Orari di supporto</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <strong>Email:</strong> 24/7 (risposta durante orari lavorativi)
                  </div>
                  <div>
                    <strong>Orari lavorativi:</strong> Lun-Ven 9:00-18:00 CET
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center text-2xl text-green-900">
                <Award className="h-6 w-6 mr-3" />
                Aiutaci a migliorare
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <p className="text-gray-700 max-w-2xl mx-auto">
                  Non hai trovato quello che cercavi? Il tuo feedback ci aiuta a migliorare 
                  continuamente il nostro centro assistenza e i nostri servizi.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    window.location.href = 'mailto:support@wolfinder.it?subject=Feedback Centro Assistenza';
                  }}>
                    <Mail className="h-4 w-4 mr-2" />
                    Invia Feedback
                  </Button>
                  <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => {
                    window.location.href = 'mailto:support@wolfinder.it?subject=Suggerimento FAQ';
                  }}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Suggerisci una FAQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
}