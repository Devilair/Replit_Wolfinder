import { z } from 'zod';

// ============================================================================
// SCHEMI BASE
// ============================================================================

export const emailSchema = z.string().email('Email non valida');
export const passwordSchema = z.string().min(8, 'Password deve essere almeno 8 caratteri');
export const nameSchema = z.string().min(2, 'Nome deve essere almeno 2 caratteri').max(50, 'Nome troppo lungo');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numero di telefono non valido');

// ============================================================================
// SCHEMI UTENTE
// ============================================================================

export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
  userType: z.enum(['consumer', 'professional']),
  acceptTerms: z.boolean().refine(val => val === true, 'Devi accettare i termini')
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password richiesta'),
  rememberMe: z.boolean().optional()
});

export const userProfileUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio troppo lunga').optional(),
  avatar: z.string().url('URL avatar non valido').optional()
});

// ============================================================================
// SCHEMI PROFESSIONISTA
// ============================================================================

export const professionalRegistrationSchema = z.object({
  ...userRegistrationSchema.shape,
  businessName: z.string().min(2, 'Nome attività troppo corto').max(100, 'Nome attività troppo lungo'),
  categoryId: z.string().uuid('Categoria non valida'),
  address: z.object({
    street: z.string().min(5, 'Indirizzo troppo corto'),
    city: z.string().min(2, 'Città troppo corta'),
    province: z.string().length(2, 'Provincia deve essere 2 caratteri'),
    postalCode: z.string().regex(/^\d{5}$/, 'CAP non valido'),
    country: z.string().default('IT')
  }),
  services: z.array(z.string().min(1, 'Servizio non valido')).min(1, 'Almeno un servizio richiesto'),
  description: z.string().min(10, 'Descrizione troppo corta').max(2000, 'Descrizione troppo lunga'),
  hourlyRate: z.number().min(0, 'Tariffa oraria non valida').max(1000, 'Tariffa oraria troppo alta').optional(),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean()
  }).optional()
});

export const professionalUpdateSchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  categoryId: z.string().uuid().optional(),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    province: z.string().length(2),
    postalCode: z.string().regex(/^\d{5}$/),
    country: z.string().default('IT')
  }).optional(),
  services: z.array(z.string().min(1)).min(1).optional(),
  description: z.string().min(10).max(2000).optional(),
  hourlyRate: z.number().min(0).max(1000).optional(),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean()
  }).optional()
});

// ============================================================================
// SCHEMI RICERCA
// ============================================================================

export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Query di ricerca richiesta').max(100, 'Query troppo lunga'),
  category: z.string().uuid().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    radius: z.number().min(1).max(100).default(50)
  }).optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  availability: z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Orario non valido')
  }).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// ============================================================================
// SCHEMI RECENSIONI
// ============================================================================

export const reviewCreateSchema = z.object({
  professionalId: z.string().uuid('ID professionista non valido'),
  rating: z.number().min(1, 'Rating minimo 1').max(5, 'Rating massimo 5'),
  title: z.string().min(5, 'Titolo troppo corto').max(100, 'Titolo troppo lungo'),
  content: z.string().min(10, 'Recensione troppo corta').max(1000, 'Recensione troppo lunga'),
  anonymous: z.boolean().default(false)
});

export const reviewUpdateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(1000).optional(),
  anonymous: z.boolean().optional()
});

// ============================================================================
// SCHEMI PRENOTAZIONI
// ============================================================================

export const bookingCreateSchema = z.object({
  professionalId: z.string().uuid('ID professionista non valido'),
  serviceId: z.string().uuid('ID servizio non valido'),
  date: z.string().datetime('Data non valida'),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Orario non valido'),
  duration: z.number().min(30).max(480, 'Durata massima 8 ore').default(60),
  notes: z.string().max(500, 'Note troppo lunghe').optional()
});

export const bookingUpdateSchema = z.object({
  date: z.string().datetime().optional(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(30).max(480).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional()
});

// ============================================================================
// SCHEMI PAGAMENTI
// ============================================================================

export const paymentIntentSchema = z.object({
  amount: z.number().min(100, 'Importo minimo 1€').max(1000000, 'Importo massimo 10.000€'),
  currency: z.string().default('eur'),
  description: z.string().max(255, 'Descrizione troppo lunga'),
  metadata: z.record(z.string()).optional()
});

export const subscriptionCreateSchema = z.object({
  planId: z.string().uuid('ID piano non valido'),
  paymentMethodId: z.string().min(1, 'Metodo di pagamento richiesto'),
  couponCode: z.string().optional()
});

// ============================================================================
// SCHEMI ADMIN
// ============================================================================

export const adminUserUpdateSchema = z.object({
  userId: z.string().uuid('ID utente non valido'),
  status: z.enum(['active', 'suspended', 'banned']),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  reason: z.string().max(500, 'Motivo troppo lungo').optional()
});

export const adminProfessionalVerifySchema = z.object({
  professionalId: z.string().uuid('ID professionista non valido'),
  verified: z.boolean(),
  documents: z.array(z.string().url('URL documento non valido')).optional(),
  notes: z.string().max(1000, 'Note troppo lunghe').optional()
});

// ============================================================================
// SCHEMI FILE UPLOAD
// ============================================================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File richiesto' }),
  type: z.enum(['avatar', 'document', 'gallery']),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
});

// ============================================================================
// SCHEMI PAGINAZIONE
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// SCHEMI FILTRI
// ============================================================================

export const dateRangeSchema = z.object({
  startDate: z.string().datetime('Data inizio non valida'),
  endDate: z.string().datetime('Data fine non valida')
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Data inizio deve essere precedente alla data fine'
});

export const priceRangeSchema = z.object({
  min: z.number().min(0, 'Prezzo minimo non valido'),
  max: z.number().min(0, 'Prezzo massimo non valido')
}).refine(data => data.min <= data.max, {
  message: 'Prezzo minimo deve essere inferiore al prezzo massimo'
});

// ============================================================================
// SCHEMI NOTIFICHE
// ============================================================================

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  types: z.object({
    bookings: z.boolean().default(true),
    reviews: z.boolean().default(true),
    payments: z.boolean().default(true),
    marketing: z.boolean().default(false)
  })
});

// ============================================================================
// SCHEMI VALIDAZIONE GENERICI
// ============================================================================

export const idParamSchema = z.object({
  id: z.string().uuid('ID non valido')
});

export const queryParamSchema = z.object({
  q: z.string().min(1, 'Query richiesta').max(100, 'Query troppo lunga')
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      throw new Error(`Validazione fallita: ${JSON.stringify(formattedErrors)}`);
    }
    throw error;
  }
};

export const validatePartialInput = <T>(schema: z.ZodSchema<T>, data: unknown): Partial<T> => {
  try {
    // Per validazione parziale, usiamo un approccio diverso
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      // Se la validazione fallisce, proviamo a validare solo i campi presenti
      const partialData = Object.keys(data as object).reduce((acc, key) => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const partialResult = schema.safeParse(partialData);
      if (partialResult.success) {
        return partialResult.data;
      }
    }
    
    // Se tutto fallisce, restituiamo i dati grezzi ma tipizzati
    return data as Partial<T>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      throw new Error(`Validazione fallita: ${JSON.stringify(formattedErrors)}`);
    }
    throw error;
  }
};

// ============================================================================
// SANITIZZAZIONE INPUT
// ============================================================================

export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Rimuove < e >
    .replace(/javascript:/gi, '') // Rimuove javascript:
    .replace(/on\w+=/gi, '') // Rimuove event handlers
    .substring(0, 1000); // Limita lunghezza
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+]/g, ''); // Mantiene solo numeri e +
};

// ============================================================================
// TYPES EXPORT
// ============================================================================

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type ProfessionalRegistration = z.infer<typeof professionalRegistrationSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ReviewCreate = z.infer<typeof reviewCreateSchema>;
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
export type PaymentIntent = z.infer<typeof paymentIntentSchema>; 