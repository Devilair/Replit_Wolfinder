import { integer, text, timestamp, pgTable, serial, boolean, real, primaryKey, decimal } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
// import type { AdapterAccount } from '@auth/drizzle-adapter';

// ----- TABELLA UTENTI -----
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  role: text('role').default('consumer').notNull(), // 'consumer', 'professional', 'admin'
  passwordHash: text('passwordHash'),
  accountStatus: text('account_status', { enum: ['active', 'suspended', 'pending'] }).default('active'),
  lastLoginAt: timestamp('lastLoginAt'),
  isEmailVerified: boolean('is_email_verified').default(false),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  githubId: text('github_id').unique(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  professionalProfile: one(professionals, {
    fields: [users.id],
    references: [professionals.userId],
  }),
  reviews: many(reviews),
  sessions: many(userSessions),
}));


// ----- TABELLA PROFESSIONISTI -----
export const professionals = pgTable('professionals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: text('business_name').notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  subcategoryId: integer('subcategory_id').references(() => subcategories.id),
  phoneMobile: text('phone_mobile'),
  phoneLandline: text('phone_landline'),
  phoneFixed: text('phone_fixed'),
  email: text('email'),
  website: text('website'),
  address: text('address'),
  city: text('city'),
  province: text('province'),
  zipCode: text('zip_code'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').default(0),
  isActive: boolean('is_active').default(true),
  verificationStatus: text('verification_status').default('pending'), // 'pending', 'verified', 'rejected'
  isClaimed: boolean('is_claimed').default(false),
  profileViews: integer('profile_views').default(0),
  subscriptionPlanId: integer('subscription_plan_id').references(() => subscriptionPlans.id),
  stripeCustomerId: text('stripe_customer_id'),
  isPremium: boolean('is_premium'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  user: one(users, {
    fields: [professionals.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [professionals.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [professionals.subcategoryId],
    references: [subcategories.id],
  }),
  reviews: many(reviews),
  badges: many(professionalBadges),
  specializations: many(professionalSpecializations),
  certifications: many(professionalCertifications),
}));


// ----- TABELLA CATEGORIE -----
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  slug: text('slug').unique(),
  icon: text('icon'),
  count: integer('count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  professionals: many(professionals),
  subcategories: many(subcategories),
}));

export const insertCategorySchema = createInsertSchema(categories);

// ----- TABELLA RECENSIONI -----
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  title: text('title'),
  content: text('content'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  verifiedAt: timestamp('verifiedAt'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  professionalResponse: text('professional_response'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews);
export const reviewValidationSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).optional(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  professional: one(professionals, {
    fields: [reviews.professionalId],
    references: [professionals.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));


// ----- TABELLA BADGE -----
export const badges = pgTable('badges', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description').notNull(),
    icon: text('icon'),
    criteria: text('criteria').notNull(), // es. '{"reviews": 10, "rating": 4.5}'
    slug: text('slug').unique(),
    type: text('type', { enum: ['automatic', 'verified', 'achievement'] }).default('automatic'),
    family: text('family'),
    color: text('color'),
    priority: integer('priority').default(0),
    isActive: boolean('is_active').default(true),
    requirements: text('requirements'), // JSON string per requisiti aggiuntivi
});

export const professionalBadges = pgTable('professional_badges', {
    id: serial('id').primaryKey(),
    professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
    badgeId: integer('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
    awardedAt: timestamp('awardedAt').defaultNow().notNull(),
    expiresAt: timestamp('expiresAt'),
    revokedAt: timestamp('revokedAt'),
    revokeReason: text('revoke_reason'),
    isVisible: boolean('is_visible').default(true),
});

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


// ----- ALTRE TABELLE (Specializzazioni, Certificazioni, Auth, etc.) -----
export const specializations = pgTable('specializations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
});

export const professionalSpecializations = pgTable('professional_specializations', {
    professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
    specializationId: integer('specialization_id').notNull().references(() => specializations.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.professionalId, t.specializationId] }),
}));

export const certifications = pgTable('certifications', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    issuingBody: text('issuing_body'),
});

export const professionalCertifications = pgTable('professional_certifications', {
    professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
    certificationId: integer('certification_id').notNull().references(() => certifications.id, { onDelete: 'cascade' }),
    obtainedAt: timestamp('obtainedAt').defaultNow().notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.professionalId, t.certificationId] }),
}));


// ----- TABELLE SUBSCRIPTION -----
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // in centesimi
  currency: text('currency').default('eur'),
  interval: text('interval', { enum: ['month', 'year'] }).default('month'),
  features: text('features'), // JSON string
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status', { enum: ['active', 'canceled', 'past_due', 'unpaid'] }).default('active'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));


// ----- Auth.js Tables -----

/*
export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
*/

export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ----- TIPI COMPOSITI PER LE QUERY -----
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Professional = typeof professionals.$inferSelect;
export type NewProfessional = typeof professionals.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type ProfessionalBadge = typeof professionalBadges.$inferSelect;
export type NewProfessionalBadge = typeof professionalBadges.$inferInsert;
export type Specialization = typeof specializations.$inferSelect;
export type ProfessionalSpecialization = typeof professionalSpecializations.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type ProfessionalCertification = typeof professionalCertifications.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

// Tipi per le join
export type ProfessionalWithDetails = Professional & {
  user?: User | null;
  category?: Category | null;
  subcategory?: Subcategory | null;
};

export type ReviewWithDetails = Review & {
    user?: Pick<User, 'id' | 'name' | 'image'>;
};

// ----- SCHEMI DI VALIDAZIONE ZOD -----
export const insertProfessionalSchema = createInsertSchema(professionals, {
  // Esempio di validazione custom:
  email: z.string().email(),
  businessName: z.string().min(2),
  userId: z.number().positive(),
  categoryId: z.number().positive(),
});

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

export const consumerRegistrationSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio"),
  email: z.string().email("L'email non è valida"),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Devi accettare i termini e le condizioni.",
  }),
});
