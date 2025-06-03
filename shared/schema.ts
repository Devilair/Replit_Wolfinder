import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  userId: integer("user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  businessName: text("business_name").notNull(),
  description: text("description").notNull(),
  phone: text("phone"),
  email: text("email").notNull(),
  website: text("website"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit"), // "ora", "visita", "progetto"
  isVerified: boolean("is_verified").default(false).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
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
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  isVerified: true, 
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

// Subscription types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

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
