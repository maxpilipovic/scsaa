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
      const userId = session.client_reference_id;

      if (!userId) {
        console.error('Webhook Error: Missing userId (client_reference_id) in checkout session.');
        break;
      }

      console.log(`Fulfilling order for user ${userId}...`);

      try {
        // 1. Record the payment in the `payments` table
        const { error: paymentError } = await supabase.from('payments').insert({
          user_id: userId,
          dues_amount: session.amount_total / 100, // Amount is in cents
          processing_fee: 0, // As requested
          stripe_payment_id: session.payment_intent,
          status: 'succeeded',
        });

        if (paymentError) {
          console.error('Error inserting into payments table:', paymentError);
          // Continue to membership update even if payment logging fails, as payment was successful
        }

        // 2. If it was a subscription, create or update the `memberships` table
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          const { error: membershipError } = await supabase
            .from('memberships')
            .upsert({
              user_id: userId,
              year: new Date().getFullYear(),
              status: 'active',
              paid_at: new Date().toISOString(),
              expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: 'user_id' }); // `onConflict` ensures it updates if a record for the user_id already exists

          if (membershipError) {
            console.error('Error upserting into memberships table:', membershipError);
          }
        }
        console.log(`Order fulfilled for user ${userId}.`);
      } catch (error) {
        console.error('Error during order fulfillment:', error);
      }

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
};