import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // Disable Vercel's body parsing
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !sig) {
    return res.status(400).send('Webhook configuration missing');
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  // Get raw body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in checkout session');
          break;
        }

        // Get subscription details
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

        // Store subscription in database
        const { error } = await supabase.from('user_subscriptions').insert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          current_period_start: new Date((subscription.current_period_start || 0) * 1000).toISOString(),
          current_period_end: new Date((subscription.current_period_end || 0) * 1000).toISOString(),
          plan_name: subscription.items.data[0].price.nickname || 'Premium Plan'
        });

        if (error) {
          console.error('Failed to insert subscription:', error);
        } else {
          console.log(`Subscription created for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;

        await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date((subscription.current_period_start || 0) * 1000).toISOString(),
            current_period_end: new Date((subscription.current_period_end || 0) * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log(`Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log(`Subscription canceled: ${subscription.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: err.message });
  }
}
