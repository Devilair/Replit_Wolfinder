import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  subscriptions,
  subscriptionPlans,
  type Subscription,
  type SubscriptionPlan,
  type InsertSubscription,
  type InsertSubscriptionPlan,
} from "../../shared/schema";
import { eq, asc } from "drizzle-orm";
import { ISubscriptionStorage } from "./interfaces";

const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

export class SubscriptionStorage implements ISubscriptionStorage {
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [created] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .orderBy(asc(subscriptionPlans.id));
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return created;
  }
}