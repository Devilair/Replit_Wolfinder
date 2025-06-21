import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// AUTHORITATIVE SCHEMA - Built from actual database introspection
// This eliminates all type inconsistencies by matching exact database structure

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("user").notNull(),
  permissions: jsonb("permissions").default('[]'),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationMethod: text("verification_method"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: text("mfa_secret"),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  lastFailedLogin: timestamp("last_failed_login"),
  marketingConsent: boolean("marketing_consent").default(false),
  privacyConsent: boolean("privacy_consent").default(true),
  lastLoginAt: timestamp("last_login_at"),
  lastActivityAt: timestamp("last_activity_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }).default("0"),
  acquisitionSource: text("acquisition_source"),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  suspensionReason: text("suspension_reason"),
  suspensionUntil: timestamp("suspension_until"),
  adminNotes: text("admin_notes"),
  accountStatus: text("account_status").default("active").notNull(),
  anonymizedAt: timestamp("anonymized_at"),
  dataRetentionExpiresAt: timestamp("data_retention_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  type: text("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  count: integer("count").notNull().default(0),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  businessName: text("business_name").notNull(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  website: text("website"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  verificationStatus: text("verification_status").default("pending").notNull(),
  verificationNotes: text("verification_notes"),
  verificationDate: timestamp("verification_date"),
  verifiedBy: integer("verified_by").references(() => users.id),
  profileCompleteness: decimal("profile_completeness", { precision: 5, scale: 2 }).default("0"),
  lastActivityAt: timestamp("last_activity_at"),
  profileViews: integer("profile_views").default(0).notNull(),
  clickThroughRate: decimal("click_through_rate").default("0"),
  responseRate: decimal("response_rate").default("0"),
  averageResponseTime: integer("average_response_time"),
  isProblematic: boolean("is_problematic").default(false).notNull(),
  problematicReason: text("problematic_reason"),
  adminNotes: text("admin_notes"),
  isClaimed: boolean("is_claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  claimedBy: integer("claimed_by").references(() => users.id),
  profileClaimToken: varchar("profile_claim_token"),
  claimTokenExpiresAt: timestamp("claim_token_expires_at"),
  autoNotificationEnabled: boolean("auto_notification_enabled").default(true),
  lastNotificationSent: timestamp("last_notification_sent"),
  phoneFixed: text("phone_fixed"),
  phoneMobile: text("phone_mobile"),
  pec: text("pec"),
  vatNumber: text("vat_number"),
  fiscalCode: text("fiscal_code"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  whatsappNumber: text("whatsapp_number"),
  additionalCities: text("additional_cities").array(),
  latitude: decimal("latitude", { precision: 11, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  geocodedAt: timestamp("geocoded_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  authorRole: text("author_role").default("consumer"),
  authorCategoryId: integer("author_category_id").references(() => categories.id),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  serviceDate: timestamp("service_date"),
  serviceType: text("service_type"),
  projectValue: decimal("project_value", { precision: 10, scale: 2 }),
  wouldRecommend: boolean("would_recommend").default(true),
  responseTime: text("response_time"),
  professionalismRating: integer("professionalism_rating"),
  qualityRating: integer("quality_rating"),
  timelinessRating: integer("timeliness_rating"),
  communicationRating: integer("communication_rating"),
  valueRating: integer("value_rating"),
  status: text("status").default("pending").notNull(),
  moderationNotes: text("moderation_notes"),
  moderatedBy: integer("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  rejectionReason: text("rejection_reason"),
  helpfulVotes: integer("helpful_votes").default(0),
  professionalResponse: text("professional_response"),
  professionalResponseDate: timestamp("professional_response_date"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  verificationToken: text("verification_token"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewReports = pgTable("review_reports", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  reporterId: integer("reporter_id").references(() => users.id),
  reporterName: text("reporter_name"),
  reporterEmail: text("reporter_email"),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  documentType: text("document_type").notNull(),
  originalFilename: text("original_filename").notNull(),
  storedFilename: text("stored_filename").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadPath: text("upload_path").notNull(),
  status: text("status").default("pending").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceMonthly: decimal("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: decimal("price_yearly", { precision: 10, scale: 2 }),
  features: jsonb("features").notNull(),
  limits: jsonb("limits").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  stripeProductId: text("stripe_product_id"),
  stripePriceIdMonthly: text("stripe_price_id_monthly"),
  stripePriceIdYearly: text("stripe_price_id_yearly"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").default("active").notNull(),
  billingCycle: text("billing_cycle").default("monthly").notNull(),
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

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  icon: text("icon"),
  color: text("color").default("#3B82F6"),
  requirements: jsonb("requirements"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  family: text("family"),
  calculationMethod: text("calculation_method"),
  priority: integer("priority"),
});

export const professionalBadges = pgTable("professional_badges", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  awardedBy: integer("awarded_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  isVisible: boolean("is_visible").default(true).notNull(),
  revokedAt: timestamp("revoked_at"),
  revokedBy: integer("revoked_by").references(() => users.id),
  revokeReason: text("revoke_reason"),
});

export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  priority: text("priority").default("medium").notNull(),
  status: text("status").default("pending").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  reviewNotes: text("review_notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminActivity = pgTable("admin_activity", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const claimRequests = pgTable("claim_requests", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  token: text("token").notNull(),
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email").notNull(),
  requesterPhone: text("requester_phone"),
  verificationDocuments: text("verification_documents"),
  personalMessage: text("personal_message"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionalNotifications = pgTable("professional_notifications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  reviewId: integer("review_id").references(() => reviews.id, { onDelete: "set null" }),
  notificationType: text("notification_type").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR").notNull(),
  status: text("status").default("pending").notNull(),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionalSpecializations = pgTable("professional_specializations", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  experienceYears: integer("experience_years").default(0),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionalCertifications = pgTable("professional_certifications", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  issuingOrganization: text("issuing_organization").notNull(),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  credentialId: text("credential_id"),
  credentialUrl: text("credential_url"),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionalUsage = pgTable("professional_usage", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id, { onDelete: "cascade" }),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  contactsReceived: integer("contacts_received").default(0).notNull(),
  photosUploaded: integer("photos_uploaded").default(0).notNull(),
  servicesListed: integer("services_listed").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RELATIONS - Exact mapping to maintain type consistency
export const usersRelations = relations(users, ({ many }) => ({
  professionals: many(professionals),
  reviews: many(reviews),
  sessions: many(userSessions),
  verificationTokens: many(verificationTokens),
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
  badges: many(professionalBadges),
  documents: many(verificationDocuments),
  subscriptions: many(subscriptions),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  professionals: many(professionals),
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
  reports: many(reviewReports),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  professional: one(professionals, {
    fields: [subscriptions.professionalId],
    references: [professionals.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
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

// INSERT SCHEMAS - Strict type validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({ 
  id: true, 
  rating: true, 
  reviewCount: true, 
  profileViews: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  status: true,
  helpfulVotes: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertCategorySchema = createInsertSchema(categories).omit({ 
  id: true, 
  count: true 
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const consumers = pgTable("consumers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("IT"),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  marketingEmails: boolean("marketing_emails").default(false),
  reviewsWritten: integer("reviews_written").default(0),
  profilesViewed: integer("profiles_viewed").default(0),
  searchesPerformed: integer("searches_performed").default(0),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConsumerSchema = createInsertSchema(consumers).omit({ 
  id: true, 
  reviewsWritten: true,
  profilesViewed: true,
  searchesPerformed: true,
  createdAt: true, 
  updatedAt: true 
});

// Professional registration schema for frontend forms
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
  address: z.string().min(2, "L'indirizzo deve avere almeno 2 caratteri"),
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
  marketingConsent: z.boolean().default(false)
});

// EXACT TYPE EXPORTS - Matching database structure
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type ProfessionalBadge = typeof professionalBadges.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type ModerationQueue = typeof moderationQueue.$inferSelect;
export type AdminActivity = typeof adminActivity.$inferSelect;
export type ClaimRequest = typeof claimRequests.$inferSelect;
export type ProfessionalNotification = typeof professionalNotifications.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type ProfessionalSpecialization = typeof professionalSpecializations.$inferSelect;
export type ProfessionalCertification = typeof professionalCertifications.$inferSelect;
export type ProfessionalUsage = typeof professionalUsage.$inferSelect;

// ADMIN-SPECIFIC TYPES - Eliminating schema mismatches
export interface AdminDashboardStats {
  activeUsers: {
    today: number;
    week: number;
    month: number;
    previousPeriod: number;
    changePercent: number;
  };
  reviews: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    newToday: number;
    averageVerificationTime: number;
  };
  professionals: {
    total: number;
    verified: number;
    pending: number;
    newThisWeek: number;
    conversionRate: number;
  };
  revenue: {
    monthToDate: number;
    projectedMonthly: number;
    subscriptionConversion: number;
    averageRevenue: number;
  };
}

// COMPLEX QUERY RESULT TYPES - Preventing join type errors
export interface ProfessionalWithDetails extends Professional {
  user: User | null;
  category: Category | null;
  subscription: Subscription | null;
  plan: SubscriptionPlan | null;
}

export interface ReviewWithDetails extends Review {
  professional: Professional;
  user: User | null;
}

export interface ModerationQueueWithDetails extends ModerationQueue {
  assignedUser: User | null;
}