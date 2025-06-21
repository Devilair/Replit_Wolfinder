import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  badges,
  professionalBadges,
  type Badge,
  type ProfessionalBadge,
  type InsertBadge,
  type InsertProfessionalBadge,
} from "../../shared/schema";
import { eq, asc } from "drizzle-orm";
import { IBadgeStorage } from "./interfaces";

const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

export class BadgeStorage implements IBadgeStorage {
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).orderBy(asc(badges.id));
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [created] = await db
      .insert(badges)
      .values(badge)
      .returning();
    return created;
  }

  async getProfessionalBadges(professionalId: number): Promise<(ProfessionalBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(professionalBadges)
      .leftJoin(badges, eq(professionalBadges.badgeId, badges.id))
      .where(eq(professionalBadges.professionalId, professionalId))
      .orderBy(asc(badges.id));

    return results.map(result => ({
      ...result.professional_badges,
      badge: result.badges!,
    }));
  }

  async awardBadge(professionalId: number, badgeId: number, awardedBy: string = 'system', reason?: string): Promise<ProfessionalBadge> {
    const [professionalBadge] = await db
      .insert(professionalBadges)
      .values({
        professionalId: professionalId,
        badgeId: badgeId,
        awardedBy: awardedBy,
        revokeReason: reason,
      })
      .returning();
    return professionalBadge;
  }
}