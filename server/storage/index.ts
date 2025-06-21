// Export all interfaces and types
export * from "./interfaces";

// Export specialized storage classes
export { UserStorage } from "./user-storage";
export { CategoryStorage } from "./category-storage";
export { ProfessionalStorage } from "./professional-storage";
export { ReviewStorage } from "./review-storage";
export { BadgeStorage } from "./badge-storage";
export { SubscriptionStorage } from "./subscription-storage";
export { AdminStorage } from "./admin-storage";
export { ClaimStorage } from "./claim-storage";

// Export main composed storage class
export { DatabaseStorage } from "./database-storage";

// Create and export storage instance
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();