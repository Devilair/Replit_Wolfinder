import { integer, sqliteTable, text, primaryKey, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
// import type { AdapterAccount } from '@auth/drizzle-adapter';

// ----- TABELLA UTENTI -----
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  role: text('role', { enum: ['consumer', 'professional', 'admin'] }).notNull().default('consumer'),
  passwordHash: text('passwordHash'),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: text('updatedAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
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
export const professionals = sqliteTable('professionals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    businessName: text('business_name').notNull(),
    description: text('description'),
    categoryId: integer('category_id').references(() => categories.id),
    phoneMobile: text('phone_mobile'),
    phoneLandline: text('phone_landline'),
    email: text('email').notNull(),
    website: text('website'),
    address: text('address'),
    city: text('city'),
    province: text('province'),
    zipCode: text('zip_code'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
    isClaimed: integer('is_claimed', { mode: 'boolean' }).default(false),
    profileViews: integer('profile_views').default(0),
    rating: real('rating').default(0),
    reviewCount: integer('review_count').default(0),
    createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: text('updatedAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    subscriptionPlanId: text('subscription_plan_id'),
    stripeCustomerId: text('stripe_customer_id'),
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
  reviews: many(reviews),
  badges: many(professionalBadges),
  specializations: many(professionalSpecializations),
  certifications: many(professionalCertifications),
}));


// ----- TABELLA CATEGORIE -----
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  professionals: many(professionals),
}));

export const insertCategorySchema = createInsertSchema(categories);


// ----- TABELLA RECENSIONI -----
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isVerifiedPurchase: integer('is_verified_purchase', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews, {
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
export const badges = sqliteTable('badges', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    description: text('description').notNull(),
    icon: text('icon'),
    criteria: text('criteria').notNull(), // es. '{"reviews": 10, "rating": 4.5}'
});

export const professionalBadges = sqliteTable('professional_badges', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
    badgeId: integer('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
    awardedAt: text('awardedAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
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
export const specializations = sqliteTable('specializations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id),
});

export const professionalSpecializations = sqliteTable('professional_specializations', {
    professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
    specializationId: integer('specialization_id').notNull().references(() => specializations.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.professionalId, t.specializationId] }),
}));

export const certifications = sqliteTable('certifications', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    issuingBody: text('issuing_body'),
});

export const professionalCertifications = sqliteTable('professional_certifications', {
    professionalId: integer('professional_id').notNull().references(() => professionals.id, { onDelete: 'cascade' }),
    certificationId: integer('certification_id').notNull().references(() => certifications.id, { onDelete: 'cascade' }),
    obtainedAt: text('obtainedAt').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.professionalId, t.certificationId] }),
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

export const userSessions = sqliteTable("user_sessions", {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
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
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type ProfessionalBadge = typeof professionalBadges.$inferSelect;
export type Specialization = typeof specializations.$inferSelect;
export type ProfessionalSpecialization = typeof professionalSpecializations.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type ProfessionalCertification = typeof professionalCertifications.$inferSelect;


// Tipi per le join
export type ProfessionalWithDetails = Professional & {
  user?: User | null;
  category?: Category | null;
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