import "dotenv/config";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { env } from "./env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sqlite = new Database(env.DATABASE_URL.replace("file:", ""));
console.log(`[DB] Connessione a SQLite: ${env.DATABASE_URL.replace("file:", "")}`);
export const db = drizzle(sqlite, { schema, logger: false });