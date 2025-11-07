import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from '../../../config/supabaseClient.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//WEBHOOK FOR PAYMENTS
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  //GRAB EVENT HERE!!!
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`?? Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  //SWITCH FOR EVENT TYPES.
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerId = session.customer;

      if (session.mode === 'subscription') {
        if (!userId || !customerId || !session.subscription) {
          console.error('CRITICAL: Webhook missing data for subscription provisioning.', session.id);
          break;
        }

        console.log(`Provisioning membership for user ${userId}...`);
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          //LOG!
          console.log("Stripe subscription object:", JSON.stringify(subscription, null, 2));
          
          const periodEnd =
            subscription.current_period_end ||
            subscription.items?.data?.[0]?.current_period_end;

          const expiresAt = periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
            
          const { error: membershipError } = await supabase
            .from('memberships')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              year: new Date().getFullYear(),
              status: 'active',
              paid_at: new Date().toISOString(),
              expires_at: expiresAt,
            }, { onConflict: 'user_id' });

          if (membershipError) {
            console.error('Error upserting membership:', membershipError);
          } else {
            console.log(`Successfully provisioned membership for user ${userId}.`);
          }
        } catch (error) {
          console.error('Error during membership provisioning:', error);
        }
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      
      //Safely have a fall back
      const paymentId = invoice.payment_intent || invoice.charge || invoice.id;

      if (!customerId || !paymentId) {
        console.error('CRITICAL: Webhook missing data for payment recording.', invoice.id);
        break;
      }

      console.log(`Recording payment for customer ${customerId}...`);
      try {
        const { data: membership, error: lookupError } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (lookupError || !membership) {
          console.error('Could not find user for customer ID:', customerId);
          break;
        }

        const { error: paymentError } = await supabase.from('payments').insert({
          user_id: membership.user_id,
          dues_amount: invoice.amount_paid / 100,
          processing_fee: 0,
          stripe_payment_id: paymentId,
          status: 'succeeded',
        });

        if (paymentError) {
          console.error('Error inserting into payments table:', paymentError);
        } else {
          console.log(`Successfully recorded payment ${paymentId}.`);
        }
      } catch (error) {
        console.error('Error during payment recording:', error);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      if (!customerId) {
        console.error('Webhook Error: Missing customerId in invoice.payment_failed event.');
        break;
      }

      console.log(`Handling failed payment for customer ${customerId}...`);
      try {
        const { error } = await supabase
          .from('memberships')
          .update({ status: 'past_due', expires_at: null })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating membership status for failed payment:', error);
        }

        console.log(`Membership status updated to past_due for customer ${customerId}.`);
      } catch (error) {
        console.error('Error during failed payment handling:', error);
      }
      break;
    }
    
    default:
      // Unhandled event type
  }

  res.send();
};