// Badge Seeder - Populates database with Master Dictionary badges
import { db } from "./db";
import { badges } from "@shared/schema";
import { BADGE_MASTER_DICTIONARY } from "./badge-master-dictionary";
import { eq } from "drizzle-orm";

export async function seedBadges() {
  console.log("Starting badge seeding...");
  
  for (const badgeDefinition of BADGE_MASTER_DICTIONARY) {
    try {
      // Check if badge already exists
      const existing = await db
        .select()
        .from(badges)
        .where(eq(badges.slug, badgeDefinition.slug))
        .limit(1);

      if (existing.length === 0) {
        // Create new badge
        await db.insert(badges).values({
          name: badgeDefinition.name,
          slug: badgeDefinition.slug,
          description: badgeDefinition.description,
          icon: badgeDefinition.icon,
          color: badgeDefinition.color,
          family: badgeDefinition.family,
          requirements: badgeDefinition.requirements,
          type: badgeDefinition.calculationMethod === 'automatic' ? 'automatic' : 'manual',
          isActive: true
        });
        console.log(`✅ Created badge: ${badgeDefinition.name}`);
      } else {
        // Update existing badge
        await db
          .update(badges)
          .set({
            name: badgeDefinition.name,
            description: badgeDefinition.description,
            icon: badgeDefinition.icon,
            color: badgeDefinition.color,
            family: badgeDefinition.family,
            requirements: badgeDefinition.requirements,
            type: badgeDefinition.calculationMethod === 'automatic' ? 'automatic' : 'manual',
            updatedAt: new Date()
          })
          .where(eq(badges.slug, badgeDefinition.slug));
        console.log(`🔄 Updated badge: ${badgeDefinition.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing badge ${badgeDefinition.name}:`, error);
    }
  }
  
  console.log("Badge seeding completed!");
}