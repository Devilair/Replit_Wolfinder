import { db } from "./db";
import { badges } from "@shared/schema";
import { BADGE_MASTER_DICTIONARY } from "./badge-master-dictionary";

async function seedBadges() {
  console.log('Starting badge seeding...');
  
  try {
    // Clear existing badges
    await db.delete(badges);
    console.log('Cleared existing badges');

    // Insert all badges from master dictionary
    for (const badgeDefinition of BADGE_MASTER_DICTIONARY) {
      const [badge] = await db
        .insert(badges)
        .values({
          name: badgeDefinition.name,
          slug: badgeDefinition.slug,
          family: badgeDefinition.family,
          icon: badgeDefinition.icon,
          color: badgeDefinition.color,
          description: badgeDefinition.description,
          requirements: badgeDefinition.requirements,
          calculationMethod: badgeDefinition.calculationMethod,
          priority: badgeDefinition.priority,
          type: badgeDefinition.calculationMethod === 'automatic' ? 'automatic' : 'manual',
          isActive: true,
        })
        .returning();

      if (badge) {
        console.log(`Created badge: ${badge.name} (${badge.slug})`);
      } else {
        console.log('Badge creation failed for', badgeDefinition.slug);
      }
    }

    console.log(`Successfully seeded ${BADGE_MASTER_DICTIONARY.length} badges`);
  } catch (error) {
    console.error('Error seeding badges:', error);
    throw error;
  }
}

// Run if called directly
seedBadges()
  .then(() => {
    console.log('Badge seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Badge seeding failed:', error);
    process.exit(1);
  });

export { seedBadges };