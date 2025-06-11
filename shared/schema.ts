import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("user").notNull(), // 'user', 'professional', 'admin', 'moderator'
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationMethod: text("verification_method"), // 'email', 'phone', 'document'
  // Enhanced authentication fields
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  phone: text("phone"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  lastFailedLogin: timestamp("last_failed_login"),
  marketingConsent: boolean("marketing_consent").default(false),
  privacyConsent: boolean("privacy_consent").default(true),
  // Existing fields
  lastLoginAt: timestamp("last_login_at"),
  lastActivityAt: timestamp("last_activity_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }).default("0"),
  acquisitionSource: text("acquisition_source"), // 'organic', 'social', 'referral', 'paid'
  isSuspended: boolean("is_suspended").default(false).notNull(),
  suspensionReason: text("suspension_reason"),
  suspensionUntil: timestamp("suspension_until"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User sessions for JWT refresh token management
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verification tokens for email, phone, password reset
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // email_verification, phone_verification, password_reset, mfa_setup
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security audit logs for authentication events
export const authAuditLogs = pgTable("auth_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // login_success, login_failed, password_changed, etc.
  metadata: jsonb("metadata"), // Additional context data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional verification documents
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // identity_card, professional_certificate, business_license
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  status: text("status").default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional verification workflow
export const professionalVerifications = pgTable("professional_verifications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  level: text("level").notNull().default("basic"), // basic, documents, advanced, gold
  status: text("status").notNull().default("pending"), // pending, approved, rejected, requires_documents
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewStartedAt: timestamp("review_started_at"),
  completedAt: timestamp("completed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  requiredDocuments: jsonb("required_documents"), // List of required document types
  nextReviewDate: timestamp("next_review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate limiting for security
export const rateLimits = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(), // IP address, user ID, etc.
  action: text("action").notNull(), // login_attempt, registration, password_reset
  attempts: integer("attempts").default(1),
  windowStart: timestamp("window_start").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// GDPR compliance - data export/deletion requests
export const dataRequests = pgTable("data_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // export, deletion
  status: text("status").default("pending"), // pending, processing, completed, failed
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  downloadUrl: text("download_url"),
  expiresAt: timestamp("expires_at"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  count: integer("count").default(0).notNull(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  businessName: text("business_name").notNull(),
  description: text("description").notNull(),
  phoneFixed: text("phone_fixed"),
  phoneMobile: text("phone_mobile"),
  email: text("email").notNull(),
  website: text("website"),
  // Informazioni aziendali aggiuntive
  pec: text("pec"), // Email PEC
  vatNumber: text("vat_number"), // Partita IVA
  fiscalCode: text("fiscal_code"), // Codice fiscale
  // Social media
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  whatsappNumber: text("whatsapp_number"),
  // Località di servizio
  address: text("address").notNull(),
  city: text("city").notNull(), // Città principale
  additionalCities: text("additional_cities").array(), // Città aggiuntive (non influenzano ricerca)
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  // Coordinate geografiche per ricerca su mappa
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  geocodedAt: timestamp("geocoded_at"), // Quando è stato geocodificato l'indirizzo
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit"), // "ora", "visita", "progetto"
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationStatus: text("verification_status").default("pending").notNull(), // 'pending', 'verified', 'rejected'
  verificationNotes: text("verification_notes"),
  verificationDate: timestamp("verification_date"),
  verifiedBy: integer("verified_by").references(() => users.id),
  isPremium: boolean("is_premium").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  profileCompleteness: decimal("profile_completeness", { precision: 5, scale: 2 }).default("0"),
  lastActivityAt: timestamp("last_activity_at"),
  profileViews: integer("profile_views").default(0).notNull(),
  clickThroughRate: decimal("click_through_rate", { precision: 5, scale: 2 }).default("0"),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("0"),
  averageResponseTime: integer("average_response_time"), // in minutes
  isProblematic: boolean("is_problematic").default(false).notNull(),
  problematicReason: text("problematic_reason"),
  adminNotes: text("admin_notes"),
  // Campi per gestione profili non reclamati
  isClaimed: boolean("is_claimed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
  claimedBy: integer("claimed_by").references(() => users.id),
  profileClaimToken: text("profile_claim_token"), // Token per reclamo profilo
  claimTokenExpiresAt: timestamp("claim_token_expires_at"),
  autoNotificationEnabled: boolean("auto_notification_enabled").default(true).notNull(),
  lastNotificationSent: timestamp("last_notification_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabella per tracciare le notifiche inviate ai professionisti
export const professionalNotifications = pgTable("professional_notifications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  reviewId: integer("review_id").references(() => reviews.id, { onDelete: "set null" }),
  notificationType: text("notification_type").notNull(), // 'new_review', 'claim_reminder', 'profile_update'
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'sent', 'failed', 'bounced'
  sentAt: timestamp("sent_at"),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0).notNull(),
  metadata: jsonb("metadata"), // Additional context data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella per le richieste di reclamo profili
export const claimRequests = pgTable("claim_requests", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email").notNull(),
  requesterPhone: text("requester_phone"),
  verificationDocuments: text("verification_documents"), // JSON array of document info
  personalMessage: text("personal_message"),
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'rejected', 'needs_verification'
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabelle per il sistema di abbonamenti
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }),
  features: text("features").notNull(), // JSON string con le funzionalità
  maxResponses: integer("max_responses").default(-1), // -1 = illimitate
  hasAdvancedAnalytics: boolean("has_advanced_analytics").default(false),
  hasExportData: boolean("has_export_data").default(false),
  hasPrioritySupport: boolean("has_priority_support").default(false),
  hasApiAccess: boolean("has_api_access").default(false),
  maxAccounts: integer("max_accounts").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status").notNull(), // 'active', 'canceled', 'past_due', 'trialing'
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Ordini professionali e specializzazioni
export const professionalOrders = pgTable("professional_orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Ordine degli Avvocati", "Ordine dei Commercialisti", etc.
  category: text("category").notNull(), // "avvocati", "commercialisti", "architetti", etc.
  province: text("province").notNull(),
  city: text("city").notNull(),
  website: text("website"),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionalOrderMemberships = pgTable("professional_order_memberships", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  orderId: integer("order_id").references(() => professionalOrders.id).notNull(),
  membershipNumber: text("membership_number").notNull(),
  membershipYear: integer("membership_year").notNull(),
  status: text("status").default("active").notNull(), // 'active', 'suspended', 'expired'
  verificationDocument: text("verification_document"), // File path
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const specializations = pgTable("specializations", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionalSpecializations = pgTable("professional_specializations", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  specializationId: integer("specialization_id").references(() => specializations.id).notNull(),
  experienceYears: integer("experience_years"),
  certificationDocument: text("certification_document"), // File path
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Certificazioni e documenti
export const professionalCertifications = pgTable("professional_certifications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  name: text("name").notNull(),
  issuingOrganization: text("issuing_organization").notNull(),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  certificationNumber: text("certification_number"),
  documentPath: text("document_path"),
  verificationStatus: text("verification_status").default("pending"), // 'pending', 'verified', 'rejected'
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



// Servizi offerti dal professionista
export const professionalServices = pgTable("professional_services", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceFrom: decimal("price_from", { precision: 10, scale: 2 }),
  priceTo: decimal("price_to", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit"), // "ora", "progetto", "visita"
  estimatedDuration: text("estimated_duration"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Portfolio lavori
export const professionalPortfolio = pgTable("professional_portfolio", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  projectType: text("project_type"),
  completionDate: timestamp("completion_date"),
  clientName: text("client_name"), // Anonimizzato se necessario
  images: text("images"), // JSON array of image paths
  documents: text("documents"), // JSON array of document paths
  projectValue: decimal("project_value", { precision: 12, scale: 2 }),
  isPublic: boolean("is_public").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics avanzati
export const professionalAnalytics = pgTable("professional_analytics", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  date: timestamp("date").notNull(),
  profileViews: integer("profile_views").default(0),
  contactClicks: integer("contact_clicks").default(0),
  phoneClicks: integer("phone_clicks").default(0),
  emailClicks: integer("email_clicks").default(0),
  websiteClicks: integer("website_clicks").default(0),
  reviewsReceived: integer("reviews_received").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }),
  searchImpressions: integer("search_impressions").default(0),
  searchClicks: integer("search_clicks").default(0),
  referralSource: jsonb("referral_source"), // Social, organic, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Risposte alle recensioni
export const reviewResponses = pgTable("review_responses", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  responseText: text("response_text").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id).notNull(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR").notNull(),
  status: text("status").notNull(), // 'succeeded', 'failed', 'refunded', 'pending'
  paymentMethodType: text("payment_method_type"), // 'card', 'bank_transfer', etc.
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  invoiceUrl: text("invoice_url"),
  metadata: text("metadata"), // JSON string per dati aggiuntivi
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Valutazioni dettagliate
  rating: integer("rating").notNull(), // Valutazione generale (1-5)
  competenceRating: integer("competence_rating").notNull(), // Competenza professionale (1-5)
  qualityPriceRating: integer("quality_price_rating").notNull(), // Rapporto qualità/prezzo (1-5)
  communicationRating: integer("communication_rating").notNull(), // Comunicazione/disponibilità (1-5)
  punctualityRating: integer("punctuality_rating").notNull(), // Puntualità/rispetto dei tempi (1-5)
  
  // Contenuto
  title: text("title"),
  content: text("content").notNull(),
  
  // Sistema di verifica avanzato
  status: text("status").default("unverified").notNull(), // unverified, pending_verification, verified, rejected
  proofType: text("proof_type"), // invoice, contract, receipt, other
  proofDetails: text("proof_details"), // JSON con numero documento, data, importo
  verificationNotes: text("verification_notes"), // Note interne admin
  
  // Interazioni e analytics
  viewCount: integer("view_count").default(0).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  flagCount: integer("flag_count").default(0).notNull(),
  
  // Risposta del professionista
  professionalResponse: text("professional_response"),
  responseDate: timestamp("response_date"),
  
  // Anti-frode e sicurezza
  ipAddress: text("ip_address"), // Per controlli anti-frode
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabella per tracciare l'utilizzo delle funzionalità dei professionisti
export const professionalUsage = pgTable("professional_usage", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  month: integer("month").notNull(), // Mese (1-12)
  year: integer("year").notNull(), // Anno
  contactsReceived: integer("contacts_received").default(0).notNull(),
  photosUploaded: integer("photos_uploaded").default(0).notNull(),
  servicesListed: integer("services_listed").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabella per gestire i voti "utile" sulle recensioni
export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isHelpful: boolean("is_helpful").notNull(), // true = utile, false = non utile
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabella per le segnalazioni di recensioni
export const reviewFlags = pgTable("review_flags", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(), // spam, inappropriate, fake, other
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending, reviewed, dismissed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  professionals: many(professionals),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  professionals: many(professionals),
}));

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  user: one(users, {
    fields: [professionals.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [professionals.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
  subscriptions: many(subscriptions),
  transactions: many(transactions),
  usage: many(professionalUsage),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  professional: one(professionals, {
    fields: [reviews.professionalId],
    references: [professionals.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  helpfulVotes: many(reviewHelpfulVotes),
  flags: many(reviewFlags),
}));

export const reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpfulVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewHelpfulVotes.userId],
    references: [users.id],
  }),
}));

export const reviewFlagsRelations = relations(reviewFlags, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewFlags.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewFlags.userId],
    references: [users.id],
  }),
}));

// Relations per abbonamenti
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  professional: one(professionals, {
    fields: [subscriptions.professionalId],
    references: [professionals.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [transactions.subscriptionId],
    references: [subscriptions.id],
  }),
  professional: one(professionals, {
    fields: [transactions.professionalId],
    references: [professionals.id],
  }),
}));

export const professionalUsageRelations = relations(professionalUsage, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalUsage.professionalId],
    references: [professionals.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, count: true });
export const insertProfessionalSchema = createInsertSchema(professionals).omit({ 
  id: true, 
  rating: true, 
  reviewCount: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  status: true,
  viewCount: true,
  helpfulCount: true,
  flagCount: true,
  professionalResponse: true,
  responseDate: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  updatedAt: true
});

// Schema per voti utili e segnalazioni
export const insertReviewHelpfulVoteSchema = createInsertSchema(reviewHelpfulVotes).omit({ 
  id: true, 
  createdAt: true 
});

export const insertReviewFlagSchema = createInsertSchema(reviewFlags).omit({ 
  id: true, 
  status: true,
  createdAt: true 
});

// Subscription schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
});



// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Types per nuove tabelle - spostati alla fine del file

// Tipi per le nuove tabelle recensioni
export type ReviewHelpfulVote = typeof reviewHelpfulVotes.$inferSelect;
export type InsertReviewHelpfulVote = z.infer<typeof insertReviewHelpfulVoteSchema>;
export type ReviewFlag = typeof reviewFlags.$inferSelect;
export type InsertReviewFlag = z.infer<typeof insertReviewFlagSchema>;

// Tipi per richieste di reclamo
export type ClaimRequest = typeof claimRequests.$inferSelect;
export type InsertClaimRequest = typeof claimRequests.$inferInsert;

// Subscription types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Audit Log types (first definition)
export type AuditLogEntry = typeof auditLogs.$inferSelect;
export type InsertAuditLogEntry = typeof auditLogs.$inferInsert;
export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = typeof adminActions.$inferInsert;

// Extended types for API responses
export type ProfessionalWithDetails = Professional & {
  user: User;
  category: Category;
  reviews: (Review & { user: User })[];
  subscription?: Subscription & { plan: SubscriptionPlan };
};

export type ProfessionalSummary = Professional & {
  category: Category;
  subscription?: Subscription & { plan: SubscriptionPlan };
};

export type SubscriptionWithDetails = Subscription & {
  plan: SubscriptionPlan;
  professional: Professional & { user: User };
  transactions: Transaction[];
};

// Professional usage types
export type ProfessionalUsage = typeof professionalUsage.$inferSelect;
export type InsertProfessionalUsage = typeof professionalUsage.$inferInsert;

// Administrative tracking tables
export const adminActivity = pgTable("admin_activity", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(), // 'user', 'professional', 'review', 'subscription'
  targetId: integer("target_id").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional data about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Log per tracciare tutte le azioni amministrative
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // 'approve_verification', 'reject_review', 'extend_grace', etc.
  entityType: text("entity_type").notNull(), // 'professional', 'review', 'subscription', etc.
  entityId: integer("entity_id").notNull(),
  oldValues: text("old_values"), // JSON with previous state
  newValues: text("new_values"), // JSON with new state
  reason: text("reason"), // Motivo dell'azione
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Actions per comandi rapidi sui piani
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  actionType: text("action_type").notNull(), // 'extend_grace', 'force_downgrade', 'grant_discount'
  actionData: text("action_data"), // JSON con parametri specifici
  executedBy: integer("executed_by").references(() => users.id).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  executedAt: timestamp("executed_at"),
  status: text("status").default("pending").notNull(), // pending, executed, failed
  result: text("result"), // Risultato dell'azione
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'security', 'performance', 'threshold', 'fraud'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  title: text("title").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'review', 'professional_verification', 'content_report'
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  priority: text("priority").default("medium").notNull(), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("pending").notNull(), // 'pending', 'in_progress', 'completed', 'rejected'
  assignedTo: integer("assigned_to").references(() => users.id),
  reviewNotes: text("review_notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'failed_login', 'suspicious_activity', 'rate_limit_exceeded'
  userId: integer("user_id").references(() => users.id),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  severity: text("severity").default("medium").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  metric: text("metric").notNull(),
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  unit: text("unit"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  templateId: text("template_id"),
  targetSegment: text("target_segment"), // 'all', 'professionals', 'users', 'premium'
  status: text("status").default("draft").notNull(), // 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  keyHash: text("key_hash").notNull().unique(),
  name: text("name").notNull(),
  permissions: jsonb("permissions").notNull(), // API endpoint permissions
  rateLimit: integer("rate_limit").default(1000).notNull(),
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Tabella per utenti consumer (clienti finali)
export const consumers = pgTable("consumers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"), // 'male', 'female', 'other', 'prefer_not_to_say'
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("IT"),
  
  // Preferenze comunicazione
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  marketingEmails: boolean("marketing_emails").default(false),
  
  // Statistiche engagement
  reviewsWritten: integer("reviews_written").default(0),
  profilesViewed: integer("profiles_viewed").default(0),
  searchesPerformed: integer("searches_performed").default(0),
  
  // Verifiche opzionali
  isPhoneVerified: boolean("is_phone_verified").default(false),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabella piani abbonamento (rinominata e semplificata)
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'Gratuito', 'Start', 'Pro', 'Elite'
  slug: text("slug").notNull().unique(), // 'free', 'start', 'pro', 'elite'
  description: text("description").notNull(),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }),
  features: jsonb("features").notNull(), // Array delle funzionalità
  limits: jsonb("limits").notNull(), // Limiti (foto, servizi, etc.)
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  stripeProductId: text("stripe_product_id"),
  stripePriceIdMonthly: text("stripe_price_id_monthly"),
  stripePriceIdYearly: text("stripe_price_id_yearly"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Aggiorna campo professional per collegamento al piano
export const professionalPlans = pgTable("professional_plans", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id, { onDelete: "cascade" }).notNull().unique(),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  status: text("status").default("active").notNull(), // 'active', 'cancelled', 'past_due', 'unpaid'
  billingCycle: text("billing_cycle").default("monthly").notNull(), // 'monthly', 'yearly'
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  cancelledAt: timestamp("cancelled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Eventi di sistema per analytics e tracciamento
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'page_view', 'profile_view', 'search', 'contact_click', 'review_submit'
  userId: integer("user_id").references(() => users.id),
  professionalId: integer("professional_id").references(() => professionals.id),
  sessionId: text("session_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Dati specifici dell'evento
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const badgeAuditLog = pgTable("badge_audit_log", {
  id: serial("id").primaryKey(),
  professionalBadgeId: integer("professional_badge_id").references(() => professionalBadges.id).notNull(),
  action: text("action").notNull(), // 'awarded', 'revoked', 'expired', 'renewed'
  performedBy: integer("performed_by").references(() => users.id),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badgeAuditLogRelations = relations(badgeAuditLog, ({ one }) => ({
  professionalBadge: one(professionalBadges, {
    fields: [badgeAuditLog.professionalBadgeId],
    references: [professionalBadges.id],
  }),
  performedBy: one(users, {
    fields: [badgeAuditLog.performedBy],
    references: [users.id],
  }),
}));

// Relations per consumers
export const consumersRelations = relations(consumers, ({ one, many }) => ({
  user: one(users, {
    fields: [consumers.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

// Relations per plans
export const plansRelations = relations(plans, ({ many }) => ({
  professionalPlans: many(professionalPlans),
}));

export const professionalPlansRelations = relations(professionalPlans, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalPlans.professionalId],
    references: [professionals.id],
  }),
  plan: one(plans, {
    fields: [professionalPlans.planId],
    references: [plans.id],
  }),
}));

// Relations per events
export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  professional: one(professionals, {
    fields: [events.professionalId],
    references: [professionals.id],
  }),
}));

// Relations for administrative tables
export const adminActivityRelations = relations(adminActivity, ({ one }) => ({
  admin: one(users, {
    fields: [adminActivity.adminId],
    references: [users.id],
  }),
}));

export const systemAlertsRelations = relations(systemAlerts, ({ one }) => ({
  resolvedBy: one(users, {
    fields: [systemAlerts.resolvedBy],
    references: [users.id],
  }),
}));

export const moderationQueueRelations = relations(moderationQueue, ({ one }) => ({
  assignedTo: one(users, {
    fields: [moderationQueue.assignedTo],
    references: [users.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one }) => ({
  createdBy: one(users, {
    fields: [emailCampaigns.createdBy],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  professional: one(professionals, {
    fields: [apiKeys.professionalId],
    references: [professionals.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const professionalNotificationsRelations = relations(professionalNotifications, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalNotifications.professionalId],
    references: [professionals.id],
  }),
  review: one(reviews, {
    fields: [professionalNotifications.reviewId],
    references: [reviews.id],
  }),
}));

// Administrative types
export type AdminActivity = typeof adminActivity.$inferSelect;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ProfessionalNotification = typeof professionalNotifications.$inferSelect;
export type InsertProfessionalNotification = typeof professionalNotifications.$inferInsert;

// Schema Zod aggiornati per la registrazione
// (Nota: insertUserSchema e insertProfessionalSchema esistenti saranno estesi)

// Schema per la registrazione professionale completa
export const professionalRegistrationSchema = z.object({
  // Dati personali
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
    .regex(/\d/, "La password deve contenere almeno un numero")
    .regex(/[@$!%*?&]/, "La password deve contenere almeno un carattere speciale"),
  
  // Informazioni professionali
  businessName: z.string().optional(),
  categoryId: z.number().min(1, "Seleziona una categoria professionale"),
  phoneFixed: z.string().optional(),
  phoneMobile: z.string().optional(),
  city: z.string().min(2, "La città deve avere almeno 2 caratteri"),
  address: z.string().min(5, "L'indirizzo deve avere almeno 5 caratteri"),
  description: z.string().min(10, "La descrizione deve avere almeno 10 caratteri"),
  
  // Geocoding data (opzionali - aggiunti automaticamente dal form)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  postalCode: z.string().optional(),
  streetName: z.string().optional(),
  streetNumber: z.string().optional(),
  
  // Consensi
  acceptTerms: z.boolean().refine(val => val === true, "Devi accettare i termini di servizio"),
  acceptPrivacy: z.boolean().refine(val => val === true, "Devi accettare l'informativa sulla privacy"),
  marketingConsent: z.boolean().optional()
});

export type ProfessionalRegistrationData = z.infer<typeof professionalRegistrationSchema>;

// Sistema Badge Meritocratico
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  type: text("type").notNull(), // Required column that exists in database
  icon: text("icon"),
  color: text("color"),
  requirements: jsonb("requirements"), // Changed to jsonb to match database
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  family: text("family"), // Optional column we added
  calculationMethod: text("calculation_method"), // Optional column we added
  priority: integer("priority"), // Optional column we added
});

export const professionalBadges = pgTable("professional_badges", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  awardedBy: text("awarded_by").default("system"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  isVisible: boolean("is_visible").default(true),
  revokedAt: timestamp("revoked_at"),
  revokedBy: integer("revoked_by").references(() => users.id),
  revokeReason: text("revoke_reason"),
}, (table) => ({
  uniqueProfessionalBadge: unique().on(table.professionalId, table.badgeId),
}));

export const badgeMetrics = pgTable("badge_metrics", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").references(() => professionals.id).notNull(),
  metricType: text("metric_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  period: text("period"),
  metadata: jsonb("metadata"),
});

// Insert schemas per badge
export const insertBadgeSchema = createInsertSchema(badges).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProfessionalBadgeSchema = createInsertSchema(professionalBadges).omit({ 
  id: true, 
  awardedAt: true,
  createdAt: true
});

// Relations per badge (definite dopo le tabelle)
export const badgesRelations = relations(badges, ({ many }) => ({
  professionalBadges: many(professionalBadges),
}));

export const professionalBadgesRelations = relations(professionalBadges, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalBadges.professionalId],
    references: [professionals.id],
  }),
  badge: one(badges, {
    fields: [professionalBadges.badgeId],
    references: [badges.id],
  }),
}));

export const insertConsumerSchema = createInsertSchema(consumers).omit({ 
  id: true, 
  reviewsWritten: true,
  profilesViewed: true,
  searchesPerformed: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertPlanSchema = createInsertSchema(plans).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProfessionalPlanSchema = createInsertSchema(professionalPlans).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true 
});

// Types per nuove tabelle
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type ProfessionalBadge = typeof professionalBadges.$inferSelect;
export type InsertProfessionalBadge = z.infer<typeof insertProfessionalBadgeSchema>;
export type BadgeMetric = typeof badgeMetrics.$inferSelect;
export type InsertBadgeMetric = typeof badgeMetrics.$inferInsert;
export type Consumer = typeof consumers.$inferSelect;
export type InsertConsumer = z.infer<typeof insertConsumerSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type ProfessionalPlan = typeof professionalPlans.$inferSelect;
export type InsertProfessionalPlan = z.infer<typeof insertProfessionalPlanSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
