import Stripe from "stripe";
import { env } from "./env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

export default stripe;