import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from '../../../config/supabaseClient.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`?? Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session was successful!', session);
      
      // TODO: Fulfill the purchase...
      // 1. Find the user associated with the checkout session.
      //    You might need to store the user's ID in the session's metadata when you create it.
      //    const userId = session.metadata.userId;

      // 2. Record the payment in your `payments` table.
      //    const { error: paymentError } = await supabase.from('payments').insert([
      //      { user_id: userId, amount: session.amount_total / 100, stripe_payment_id: session.payment_intent, status: 'succeeded' },
      //    ]);

      // 3. If it was a subscription, update the `memberships` table.
      //    if (session.mode === 'subscription') {
      //      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      //      const { error: membershipError } = await supabase
      //        .from('memberships')
      //        .update({ 
      //          status: 'active',
      //          expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      //        })
      //        .eq('user_id', userId);
      //    }

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};