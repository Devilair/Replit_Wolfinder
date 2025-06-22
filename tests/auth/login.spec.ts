import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../server"; // Importa l'app configurata da server/index.ts
import { db } from "../../server/db";
import { users } from "../../shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

describe("POST /api/auth/login", () => {
  const testUser = {
    email: "login.test.user@example.com",
    password: "password123",
    name: "Login Test"
  };
  let passwordHash = "";

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testUser.password, 10);
    await db.delete(users).where(eq(users.email, testUser.email));
    await db.insert(users).values({
      name: testUser.name,
      email: testUser.email,
      passwordHash: passwordHash,
      role: "consumer",
    });
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.email, testUser.email));
  });

  it("should succeed with status 200 for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("should return 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });
    
    expect(res.status).toBe(401);
  });
});