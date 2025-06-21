import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  professionals,
  categories,
  users,
  type Professional,
  type Category,
  type User,
  type InsertProfessional,
} from "../../shared/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { IProfessionalStorage, ProfessionalSummary, ProfessionalWithCategory } from "./interfaces";

const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

export class ProfessionalStorage implements IProfessionalStorage {
  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [created] = await db.insert(professionals).values(professional).returning();
    return created;
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.id, id));
    return professional;
  }

  async getProfessionals(): Promise<Professional[]> {
    return await db
      .select()
      .from(professionals)
      .orderBy(desc(professionals.createdAt));
  }

  async getProfessionalsByCategory(categoryId: number): Promise<Professional[]> {
    return await db
      .select()
      .from(professionals)
      .where(eq(professionals.categoryId, categoryId))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount));
  }

  async updateProfessional(id: number, data: Partial<Professional>): Promise<Professional> {
    const [updated] = await db
      .update(professionals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionals.id, id))
      .returning();
    return updated;
  }

  async getFeaturedProfessionals(limit: number = 6): Promise<ProfessionalSummary[]> {
    return await db
      .select({
        id: professionals.id,
        businessName: professionals.businessName,
        description: professionals.description,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        profileViews: professionals.profileViews,
        city: professionals.city,
        province: professionals.province,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(eq(professionals.isVerified, true))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount))
      .limit(limit);
  }

  async searchProfessionals(
    query: string,
    categoryId?: number,
    city?: string,
    province?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ProfessionalSummary[]> {
    let conditions = [eq(professionals.isVerified, true)];
    
    if (query) {
      conditions.push(
        or(
          like(professionals.businessName, `%${query}%`),
          like(professionals.description, `%${query}%`)
        )!
      );
    }
    
    if (categoryId) {
      conditions.push(eq(professionals.categoryId, categoryId));
    }
    
    if (city) {
      conditions.push(like(professionals.city, `%${city}%`));
    }
    
    if (province) {
      conditions.push(like(professionals.province, `%${province}%`));
    }

    return await db
      .select({
        id: professionals.id,
        businessName: professionals.businessName,
        description: professionals.description,
        rating: professionals.rating,
        reviewCount: professionals.reviewCount,
        profileViews: professionals.profileViews,
        city: professionals.city,
        province: professionals.province,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(professionals.rating), desc(professionals.reviewCount))
      .limit(limit)
      .offset(offset);
  }

  async getProfessionalWithDetails(id: number): Promise<ProfessionalWithCategory | undefined> {
    const results = await db
      .select()
      .from(professionals)
      .leftJoin(categories, eq(professionals.categoryId, categories.id))
      .leftJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, id));

    if (results.length === 0) return undefined;

    const result = results[0];
    return {
      ...result.professionals,
      category: result.categories!,
      user: result.users || undefined,
    };
  }

  async incrementProfileViews(professionalId: number): Promise<void> {
    await db
      .update(professionals)
      .set({
        profileViews: sql`${professionals.profileViews} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(professionals.id, professionalId));
  }

  async updateProfessionalRating(id: number): Promise<void> {
    // Implementation would require access to reviews table
    // This will be handled by a service layer that coordinates between storages
    console.log(`Rating update for professional ${id} - handled by service layer`);
  }
}