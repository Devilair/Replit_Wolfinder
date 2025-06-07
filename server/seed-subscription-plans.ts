import { db } from "./db";
import { subscriptionPlans } from "@shared/schema";

export async function seedSubscriptionPlans() {
  console.log("🌱 Seeding subscription plans...");

  const plans = [
    {
      name: "Gratuito",
      description: "Piano base per iniziare su Wolfinder",
      priceMonthly: "0",
      priceYearly: null,
      features: JSON.stringify([
        "Profilo base",
        "Fino a 5 recensioni visibili",
        "Ricerca semplice",
        "Badge base"
      ]),
      maxProfiles: 1,
      maxPhotos: 3,
      maxResponses: 2,
      maxBadges: 5,
      maxAccounts: 1,
      canReceiveReviews: true,
      canRespondToReviews: true,
      prioritySupport: false,
      analyticsAccess: false,
      isActive: true,
      stripePriceId: null, // Free plan has no Stripe price
      sortOrder: 1
    },
    {
      name: "Essenziale",
      description: "Per professionisti che vogliono crescere",
      priceMonthly: "29",
      priceYearly: "290", // 2 mesi gratis
      features: JSON.stringify([
        "Tutte le funzionalità del piano Gratuito",
        "Fino a 50 recensioni visibili",
        "Risposta illimitata alle recensioni",
        "10 foto profilo/portfolio",
        "Badge avanzati",
        "Analytics di base",
        "Supporto email prioritario"
      ]),
      maxProfiles: 1,
      maxPhotos: 10,
      maxResponses: null, // unlimited
      maxBadges: 15,
      maxAccounts: 1,
      canReceiveReviews: true,
      canRespondToReviews: true,
      prioritySupport: true,
      analyticsAccess: true,
      isActive: true,
      stripePriceId: null, // To be set after creating Stripe prices
      sortOrder: 2
    },
    {
      name: "Professionale",
      description: "Per studi e professionisti affermati",
      priceMonthly: "59",
      priceYearly: "590", // 2 mesi gratis
      features: JSON.stringify([
        "Tutte le funzionalità del piano Essenziale",
        "Recensioni illimitate",
        "25 foto profilo/portfolio",
        "Tutti i badge disponibili",
        "Analytics avanzate",
        "Posizionamento prioritario nei risultati",
        "Supporto telefonico",
        "Personalizzazione profilo avanzata",
        "Badge esclusivi"
      ]),
      maxProfiles: 1,
      maxPhotos: 25,
      maxResponses: null,
      maxBadges: null, // unlimited
      maxAccounts: 3,
      canReceiveReviews: true,
      canRespondToReviews: true,
      prioritySupport: true,
      analyticsAccess: true,
      isActive: true,
      stripePriceId: null,
      sortOrder: 3
    },
    {
      name: "Studio",
      description: "Per grandi studi e team multipli",
      priceMonthly: "99",
      priceYearly: "990", // 2 mesi gratis
      features: JSON.stringify([
        "Tutte le funzionalità del piano Professionale",
        "Gestione team multipli",
        "Profili multipli sotto stesso studio",
        "50 foto per profilo",
        "Dashboard amministrativa studio",
        "Report personalizzati",
        "API access",
        "Account manager dedicato",
        "Badge studio esclusivi",
        "White-label options"
      ]),
      maxProfiles: 5,
      maxPhotos: 50,
      maxResponses: null,
      maxBadges: null,
      maxAccounts: 10,
      canReceiveReviews: true,
      canRespondToReviews: true,
      prioritySupport: true,
      analyticsAccess: true,
      isActive: true,
      stripePriceId: null,
      sortOrder: 4
    }
  ];

  try {
    // Delete existing plans first
    console.log("🗑️ Cleaning existing plans...");
    await db.delete(subscriptionPlans);

    // Insert new plans
    console.log("✨ Creating subscription plans...");
    const insertedPlans = await db
      .insert(subscriptionPlans)
      .values(plans)
      .returning();

    console.log(`✅ Successfully created ${insertedPlans.length} subscription plans:`);
    insertedPlans.forEach(plan => {
      console.log(`   - ${plan.name}: €${plan.priceMonthly}/mese`);
    });

    return insertedPlans;
  } catch (error) {
    console.error("❌ Error seeding subscription plans:", error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSubscriptionPlans()
    .then(() => {
      console.log("🎉 Subscription plans seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Subscription plans seeding failed:", error);
      process.exit(1);
    });
}