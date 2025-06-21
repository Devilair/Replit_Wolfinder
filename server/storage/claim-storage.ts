import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  claimRequests,
  type ClaimRequest,
  type InsertClaimRequest,
} from "../../shared/schema";
import { eq, and, gte } from "drizzle-orm";
import { IClaimStorage } from "./interfaces";
import crypto from "crypto";

const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

export class ClaimStorage implements IClaimStorage {
  async generateClaimToken(professionalId: number, userId: number): Promise<ClaimRequest> {
    const token = crypto.randomBytes(32).toString('hex');
    const [claimRequest] = await db
      .insert(claimRequests)
      .values({
        professionalId: professionalId,
        userId: userId,
        token: token,
        requesterName: 'User',
        requesterEmail: 'user@example.com',
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })
      .returning();
    return claimRequest;
  }

  async validateClaimToken(token: string): Promise<ClaimRequest | null> {
    const [claimRequest] = await db
      .select()
      .from(claimRequests)
      .where(and(
        eq(claimRequests.token, token),
        eq(claimRequests.status, 'pending'),
        gte(claimRequests.expiresAt, new Date())
      ));
    return claimRequest || null;
  }
}