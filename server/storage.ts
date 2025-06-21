// Re-export from modular storage system for backward compatibility
export * from "./storage/interfaces";
export { DatabaseStorage } from "./storage/database-storage";

// Create storage instance directly to avoid circular dependency
import { DatabaseStorage } from "./storage/database-storage";
export const storage = new DatabaseStorage();