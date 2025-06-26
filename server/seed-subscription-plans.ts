import { db } from "./db";
import { subscriptionPlans } from "@wolfinder/shared";

export async function seedSubscriptionPlans() {
  console.log("🌱 Seeding subscription plans...");

  const plans = [
    {
      name: "Gratuito",
      description: "Piano base per iniziare su Wolfinder",
      price: 0,
      currency: "eur",
      interval: "month" as const,
      features: JSON.stringify([
        "Profilo modificabile",
        "Recensioni illimitate visibili",
        "Risposte illimitate",
        "Badge base"
      ]),
      isActive: true
    },
    {
      name: "Essenziale",
      description: "Per professionisti che vogliono crescere",
      price: 2900, // in centesimi
      currency: "eur",
      interval: "month" as const,
      features: JSON.stringify([
        "Tutte le funzionalità del piano Gratuito",
        "Risposta illimitata alle recensioni",
        "10 foto profilo/portfolio",
        "Badge avanzati",
        "Analytics di base",
        "Supporto email prioritario"
      ]),
      isActive: true
    },
    {
      name: "Professionale",
      description: "Per studi e professionisti affermati",
      price: 5900, // in centesimi
      currency: "eur",
      interval: "month" as const,
      features: JSON.stringify([
        "Tutte le funzionalità del piano Essenziale",
        "Recensioni illimitate",
        "25 foto profilo/portfolio",
        "Tutti i badge disponibili",
        "Analytics avanzate",
        "Supporto telefonico",
        "Personalizzazione profilo avanzata"
      ]),
      isActive: true
    },
    {
      name: "Studio",
      description: "Per grandi studi e team multipli",
      price: 9900, // in centesimi
      currency: "eur",
      interval: "month" as const,
      features: JSON.stringify([
        "Tutte le funzionalità del piano Professionale",
        "Gestione team multipli",
        "Profili multipli sotto stesso studio",
        "50 foto per profilo",
        "Dashboard amministrativa studio",
        "Report personalizzati",
        "API access",
        "Account manager dedicato",
        "Badge di team",
        "White-label options"
      ]),
      isActive: true
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
      console.log(`   - ${plan.name}: €${plan.price / 100}/mese`);
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