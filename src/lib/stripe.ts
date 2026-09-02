import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_missing_key",
  { typescript: true }
);

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
