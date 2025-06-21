import type { Express, Request, Response } from "express";
import { stripeService } from "../stripe-service";
import { authService } from "../auth";
import { storage } from "../storage";

export function setupStripeRoutes(app: Express) {
  // Create subscription payment intent
  app.post("/api/create-subscription-intent", authService.authenticateToken, async (req: Request, res: Response) => {
    try {
      const { planId, billingCycle } = req.body;
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get professional profile
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: "Professional profile not found" });
      }

      // Get subscription plan
      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find(p => p.id === parseInt(planId));
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }

      // Calculate price based on billing cycle
      const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
      
      // Create or get Stripe customer
      let customerId = professional.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email, user.name);
        customerId = customer.id;
        
        // Update professional with Stripe customer ID
        await storage.updateProfessional(professional.id, {
          stripeCustomerId: customerId
        });
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: Math.round(price * 100), // Convert to cents
        currency: 'eur',
        customerId,
        metadata: {
          professionalId: professional.id.toString(),
          planId: planId.toString(),
          billingCycle
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        plan: {
          id: plan.id,
          name: plan.name,
          price: price,
          billingCycle
        }
      });

    } catch (error) {
      console.error('Error creating subscription intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!endpointSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(400).json({ error: 'Webhook secret not configured' });
      }

      const event = stripeService.constructEvent(req.body, signature, endpointSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await handleSuccessfulPayment(paymentIntent);
          break;
        
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          await handleSuccessfulInvoicePayment(invoice);
          break;
        
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          await handleSubscriptionCanceled(subscription);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  });

  // Get subscription plans
  app.get("/api/subscription-plans", async (req: Request, res: Response) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
  });
}

async function handleSuccessfulPayment(paymentIntent: any) {
  const { professionalId, planId, billingCycle } = paymentIntent.metadata;
  
  try {
    // Create subscription record
    await storage.createSubscription({
      professionalId: parseInt(professionalId),
      planId: parseInt(planId),
      stripeSubscriptionId: paymentIntent.id,
      status: 'active',
      billingCycle,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    });

    console.log(`Subscription activated for professional ${professionalId}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleSuccessfulInvoicePayment(invoice: any) {
  // Handle recurring subscription payments
  console.log('Invoice payment succeeded:', invoice.id);
}

async function handleSubscriptionCanceled(subscription: any) {
  try {
    // Update subscription status
    await storage.updateSubscriptionByStripeId(subscription.id, {
      status: 'canceled',
      canceledAt: new Date()
    });
    
    console.log(`Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}