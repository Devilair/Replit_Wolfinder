import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  API_BASE_URL: z.string().url().min(1),
  FRONTEND_BASE_URL: z.string().url().min(1),
});

const devEnvSchema = envSchema.extend({
  STRIPE_SECRET_KEY: z.string().default("sk_test_STUB_KEY_REPLACE_ME"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_STUB_SECRET_REPLACE_ME"),
});

const result =
  process.env.NODE_ENV === "production"
    ? envSchema.safeParse(process.env)
    : devEnvSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(result.error.format(), null, 4)
  );
  process.exit(1);
}

export const env = result.data; 