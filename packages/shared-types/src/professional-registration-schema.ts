import { z } from "zod";

export const professionalRegistrationSchema = z.object({
  // Dati Utente
  firstName: z.string().min(2, "Il nome è obbligatorio"),
  lastName: z.string().min(2, "Il cognome è obbligatorio"),
  email: z.string().email("L'email non è valida"),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  // Dati Professionali
  businessName: z.string().optional(),
  categoryId: z.coerce.number().positive("Seleziona una categoria"),
  phoneFixed: z.string().optional(),
  phoneMobile: z.string().optional(),
  city: z.string().min(1, "La città è obbligatoria"),
  address: z.string().min(1, "L'indirizzo è obbligatorio"),
  description: z.string().optional(),
  // Coordinate (opzionali, aggiunte in un secondo momento)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  postalCode: z.string().optional(),
  // Consensi
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Devi accettare i termini e le condizioni.",
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "Devi accettare l'informativa sulla privacy.",
  }),
  marketingConsent: z.boolean().optional(),
});

export type ProfessionalRegistration = z.infer<typeof professionalRegistrationSchema>; 