// Master Badge Dictionary - Definitive Badge System for Wolfinder
// Based on brainstorming analysis and UI audit

export interface BadgeMasterDefinition {
  name: string;
  slug: string;
  family: 'automatic' | 'quality' | 'growth' | 'verification';
  icon: string;
  color: string;
  description: string;
  requirements: string[];
  calculationMethod: 'automatic' | 'manual' | 'hybrid';
  decayRules?: {
    enabled: boolean;
    period: 'monthly' | 'quarterly' | 'yearly';
    conditions: string[];
  };
  priority: number; // Display order
}

export const BADGE_MASTER_DICTIONARY: BadgeMasterDefinition[] = [
  // 🏆 AUTOMATIC BADGES (5)
  {
    name: "Profilo Completo",
    slug: "complete-profile",
    family: "automatic",
    icon: "🏆",
    color: "#10B981",
    description: "Profilo completo al 100% con tutte le informazioni essenziali",
    requirements: [
      "Descrizione dettagliata (min. 50 caratteri)",
      "Informazioni di contatto complete",
      "Indirizzo completo",
      "Nome dell'attività"
    ],
    calculationMethod: "automatic",
    priority: 1
  },
  {
    name: "Prima Recensione",
    slug: "first-review",
    family: "automatic",
    icon: "🏆",
    color: "#10B981",
    description: "Ricevuta la prima recensione verificata",
    requirements: ["first_review_received"],
    calculationMethod: "automatic",
    priority: 2
  },
  {
    name: "Primo Cliente",
    slug: "primo-cliente",
    family: "growth",
    icon: "🎯",
    color: "#059669",
    description: "Professionista verificato e attivo sulla piattaforma",
    requirements: ["profile_verified_and_claimed"],
    calculationMethod: "automatic",
    priority: 3
  },
  {
    name: "Primo Contatto",
    slug: "first-contact",
    family: "automatic",
    icon: "🏆",
    color: "#10B981",
    description: "Primo contatto avviato con un cliente",
    requirements: ["Prima interazione registrata"],
    calculationMethod: "automatic",
    priority: 3
  },
  {
    name: "Veterano Junior",
    slug: "veteran-junior",
    family: "automatic",
    icon: "🏆",
    color: "#10B981",
    description: "Profilo attivo da almeno 3 mesi",
    requirements: ["Profilo attivo da 90+ giorni"],
    calculationMethod: "automatic",
    priority: 4
  },
  {
    name: "Veterano",
    slug: "veteran",
    family: "automatic",
    icon: "🏆",
    color: "#10B981",
    description: "Profilo attivo da oltre 1 anno",
    requirements: ["Profilo attivo da 365+ giorni"],
    calculationMethod: "automatic",
    priority: 5
  },

  // ⭐ QUALITY BADGES (8)
  {
    name: "Cliente Felice",
    slug: "happy-clients",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "95% di recensioni positive (≥4 stelle) con almeno 10 recensioni",
    requirements: [
      "Almeno 10 recensioni totali",
      "95% delle recensioni ≥4 stelle"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Rating scende sotto 95% positivo"]
    },
    priority: 6
  },
  {
    name: "5 Stelle",
    slug: "five-stars",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "Rating medio ≥4.8 stelle con almeno 10 recensioni",
    requirements: [
      "Almeno 10 recensioni",
      "Rating medio ≥4.8 stelle"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Rating medio scende sotto 4.8"]
    },
    priority: 7
  },
  {
    name: "Top Recensioni",
    slug: "top-reviews",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "20+ recensioni con rating ≥4.5 stelle",
    requirements: [
      "Almeno 20 recensioni",
      "Rating medio ≥4.5 stelle"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Rating scende sotto 4.5"]
    },
    priority: 8
  },
  {
    name: "Top Rated",
    slug: "top-rated",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "Tra i primi 10% nella categoria per rating",
    requirements: ["Top 10% rating nella categoria"],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Esce dal top 10% della categoria"]
    },
    priority: 9
  },
  {
    name: "Esperto Riconosciuto",
    slug: "recognized-expert",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "50+ recensioni verificate",
    requirements: ["Almeno 50 recensioni verificate"],
    calculationMethod: "automatic",
    priority: 10
  },
  {
    name: "Eccellenza",
    slug: "excellence",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "Mantiene 4.9+ stelle per 6 mesi consecutivi",
    requirements: [
      "Rating ≥4.9 stelle",
      "Mantenuto per 6 mesi consecutivi"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Rating scende sotto 4.9"]
    },
    priority: 11
  },
  {
    name: "Esperienza Certificata",
    slug: "certified-experience",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "Oltre 10 anni di esperienza professionale documentata",
    requirements: ["10+ anni esperienza verificata"],
    calculationMethod: "manual",
    priority: 12
  },
  {
    name: "Comunicatore Eccellente",
    slug: "excellent-communicator",
    family: "quality",
    icon: "⭐",
    color: "#F59E0B",
    description: "Rating comunicazione >4.5 su almeno 15 recensioni",
    requirements: [
      "Almeno 15 recensioni con rating comunicazione",
      "Media comunicazione >4.5"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Rating comunicazione scende sotto 4.5"]
    },
    priority: 13
  },

  // 📈 GROWTH BADGES (6)
  {
    name: "In Crescita",
    slug: "growing",
    family: "growth",
    icon: "📈",
    color: "#8B5CF6",
    description: "+20% visualizzazioni nell'ultimo mese",
    requirements: ["Aumento 20%+ visualizzazioni profilo ultimo mese"],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Calo visualizzazioni sotto soglia"]
    },
    priority: 14
  },
  {
    name: "Popolare",
    slug: "popular",
    family: "growth",
    icon: "📈",
    color: "#8B5CF6",
    description: "100+ visualizzazioni profilo nell'ultimo mese",
    requirements: ["100+ visualizzazioni ultimo mese"],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Visualizzazioni scendono sotto 100"]
    },
    priority: 15
  },
  {
    name: "Affidabile",
    slug: "reliable",
    family: "growth",
    icon: "📈",
    color: "#8B5CF6",
    description: "Zero segnalazioni negli ultimi 12 mesi",
    requirements: ["0 segnalazioni negli ultimi 12 mesi"],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Riceve una segnalazione"]
    },
    priority: 16
  },
  {
    name: "Collaborativo",
    slug: "collaborative",
    family: "growth",
    icon: "📈",
    color: "#8B5CF6",
    description: "Risponde a tutte le recensioni ricevute",
    requirements: ["100% tasso risposta alle recensioni"],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Tasso risposta scende sotto 90%"]
    },
    priority: 17
  },
  {
    name: "Responsivo",
    slug: "responsive",
    family: "growth",
    icon: "📈",
    color: "#8B5CF6",
    description: "Tempo medio risposta ≤2 ore nel 90% dei casi",
    requirements: [
      "Tempo medio risposta ≤2 ore",
      "90% delle risposte entro tempi"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "monthly",
      conditions: ["Tempo risposta supera soglia"]
    },
    priority: 18
  },
  {
    name: "Specializzazione Elite",
    slug: "elite-specialization",
    family: "growth",
    icon: "📈",
    color: "#8B5CF6",
    description: "Leader riconosciuto in una specializzazione specifica",
    requirements: [
      "10+ recensioni in categoria specifica",
      "Rating ≥4.7 nella specializzazione"
    ],
    calculationMethod: "automatic",
    decayRules: {
      enabled: true,
      period: "quarterly",
      conditions: ["Rating specializzazione scende sotto 4.7"]
    },
    priority: 19
  },

  // 🛡️ VERIFICATION BADGES (4)
  {
    name: "Identità Confermata",
    slug: "identity-verified",
    family: "verification",
    icon: "🛡️",
    color: "#3B82F6",
    description: "Identità verificata tramite documento ufficiale",
    requirements: ["Documento identità verificato manualmente"],
    calculationMethod: "manual",
    priority: 20
  },
  {
    name: "Locale Verified",
    slug: "local-verified",
    family: "verification",
    icon: "🛡️",
    color: "#3B82F6",
    description: "Sede/studio verificato fisicamente",
    requirements: ["Verifica fisica sede/studio"],
    calculationMethod: "manual",
    priority: 21
  },
  {
    name: "Ordine Professionale",
    slug: "professional-order",
    family: "verification",
    icon: "🛡️",
    color: "#3B82F6",
    description: "Iscritto all'Ordine Professionale competente",
    requirements: ["Iscrizione Ordine Professionale verificata"],
    calculationMethod: "manual",
    priority: 22
  },
  {
    name: "Certificato Professionale",
    slug: "professional-certified",
    family: "verification",
    icon: "🛡️",
    color: "#3B82F6",
    description: "Titoli professionali e abilitazioni verificate",
    requirements: ["Titoli e abilitazioni verificati"],
    calculationMethod: "manual",
    priority: 23
  }
];

export const BADGE_FAMILIES = {
  automatic: {
    name: "Automatici",
    icon: "🏆",
    color: "#10B981",
    description: "Badge ottenuti automaticamente completando azioni specifiche"
  },
  quality: {
    name: "Qualità",
    icon: "⭐",
    color: "#F59E0B",
    description: "Badge basati sulla qualità del servizio e feedback clienti"
  },
  growth: {
    name: "Crescita",
    icon: "📈",
    color: "#8B5CF6",
    description: "Badge che premiano crescita, engagement e professionalità"
  },
  verification: {
    name: "Verifica",
    icon: "🛡️",
    color: "#3B82F6",
    description: "Badge di verifica manuale per credibilità e sicurezza"
  }
} as const;

// Helper functions
export function getBadgeBySlug(slug: string): BadgeMasterDefinition | undefined {
  return BADGE_MASTER_DICTIONARY.find(badge => badge.slug === slug);
}

export function getBadgesByFamily(family: keyof typeof BADGE_FAMILIES): BadgeMasterDefinition[] {
  return BADGE_MASTER_DICTIONARY.filter(badge => badge.family === family);
}

export function getAllBadgesSorted(): BadgeMasterDefinition[] {
  return [...BADGE_MASTER_DICTIONARY].sort((a, b) => a.priority - b.priority);
}