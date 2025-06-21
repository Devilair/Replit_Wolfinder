import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

export interface CreateCustomerParams {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  priceId?: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  
  // Customer management
  async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email: params.email,
      name: params.name,
      phone: params.phone,
      metadata: params.metadata || {},
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  }

  async updateCustomer(customerId: string, params: Partial<CreateCustomerParams>): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, {
      email: params.email,
      name: params.name,
      phone: params.phone,
      metadata: params.metadata,
    });
  }

  // Price and Product management
  async createProduct(name: string, description: string): Promise<Stripe.Product> {
    return await stripe.products.create({
      name,
      description,
    });
  }

  async createPrice(productId: string, unitAmount: number, currency: string = 'eur', interval: 'month' | 'year' = 'month'): Promise<Stripe.Price> {
    return await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency,
      recurring: {
        interval,
      },
    });
  }

  // Subscription management
  async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: params.metadata || {},
    });
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<Stripe.Subscription> {
    const updateData: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata,
    };

    if (params.priceId) {
      // Get current subscription to update items
      const subscription = await this.getSubscription(params.subscriptionId);
      if (subscription && subscription.items.data.length > 0) {
        updateData.items = [{
          id: subscription.items.data[0]?.id,
          price: params.priceId,
        }];
      }
    }

    return await stripe.subscriptions.update(params.subscriptionId, updateData);
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  // Payment Intent for setup
  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  }

  // Invoice management
  async getInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    try {
      return await stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      return null;
    }
  }

  // Webhook handling
  constructEvent(payload: string | Buffer, signature: string, endpointSecret: string): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  }

  // Utility methods
  async listPrices(productId?: string): Promise<Stripe.Price[]> {
    const params: Stripe.PriceListParams = { active: true, limit: 100 };
    if (productId) {
      params.product = productId;
    }
    
    const prices = await stripe.prices.list(params);
    return prices.data;
  }

  async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  }
}

export const stripeService = new StripeService();