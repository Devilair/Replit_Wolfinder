import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  users,
  professionals,
  reviews,
} from "../../shared/schema";
import { eq, count } from "drizzle-orm";
import { IAdminStorage } from "./interfaces";

const sql_connection = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_connection);

export class AdminStorage implements IAdminStorage {
  async getAdminDashboardStats(): Promise<any> {
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    const [professionalCount] = await db
      .select({ count: count() })
      .from(professionals);

    const [verifiedProfessionalCount] = await db
      .select({ count: count() })
      .from(professionals)
      .where(eq(professionals.isVerified, true));

    const [reviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'approved'));

    const [pendingReviewCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.status, 'pending'));

    return {
      userCount: userCount.count,
      professionalCount: professionalCount.count,
      verifiedProfessionalCount: verifiedProfessionalCount.count,
      reviewCount: reviewCount.count,
      pendingReviewCount: pendingReviewCount.count,
      revenue: 0,
      changePercent: 0
    };
  }

  async getVerifiedProfessionalsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(professionals)
      .where(eq(professionals.verificationStatus, 'verified'));
    return result.count;
  }
}