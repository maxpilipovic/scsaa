
// WRITTEN BY CLAUDE CODE. HAD ISSUES WITH STRIPE WEBHOOKS!

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from '../../../config/supabaseClient.js';
import { logSubscriptionAction, logPaymentAction } from '../../../utils/auditLogger.js';
import { sendEmail, paymentConfirmationTemplate, renewalConfirmationTemplate } from '../../../utils/emailService.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper: unix seconds → ISO string
const toIso = (unixSeconds) =>
  unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is raw because of express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    // ---------------------------------------------------------
    // 1) FIRST SUBSCRIPTION PURCHASE
    // ---------------------------------------------------------
    case 'checkout.session.completed': {
      const session = event.data.object;

      if (session.mode !== 'subscription') break;

      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (!userId || !customerId || !subscriptionId) break;

      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        const item = sub.items.data[0];
        const periodEnd = item.current_period_end;
        const expiresAt = toIso(periodEnd);

        await supabase.from('memberships').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            year: new Date().getFullYear(),
            status: 'active',
            paid_at: new Date().toISOString(),
            expires_at: expiresAt,
          },
          { onConflict: 'user_id' }
        );

        // Get user email for confirmation
        const { data: user } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', userId)
          .single();

        // Log the subscription creation
        await logSubscriptionAction(userId, 'SUBSCRIBED', {
          customer_id: customerId,
          subscription_id: subscriptionId,
          expires_at: expiresAt,
        });

        // Send confirmation email
        if (user && user.email) {
          const emailHtml = paymentConfirmationTemplate(
            `${user.first_name} ${user.last_name}`,
            50, // Default amount - adjust based on your pricing
            subscriptionId
          );
          
          await sendEmail(
            user.email,
            'Welcome to SCSAA - Membership Active',
            emailHtml
          );
        }

        console.log(`Membership provisioned for ${userId}`);
      } catch (error) {
        console.error('Error provisioning subscription:', error);
        // Log the error
        if (userId) {
          await logSubscriptionAction(userId, 'SUBSCRIPTION_PROVISIONING_FAILED', {
            error: error.message,
          });
        }
      }

      break;
    }

    // ---------------------------------------------------------
    // 2) RENEWAL PAYMENT SUCCEEDED
    // ---------------------------------------------------------
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const paymentId =
        invoice.payment_intent || invoice.charge || invoice.id;

      if (!customerId || !paymentId) break;

      console.log(`Recording payment for ${customerId}`);

      try {
        const { data: membership } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!membership) break;

        const { data: user } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', membership.user_id)
          .single();

        await supabase.from('payments').insert({
          user_id: membership.user_id,
          dues_amount: invoice.amount_paid / 100,
          processing_fee: 0,
          stripe_payment_id: paymentId,
          status: 'succeeded',
        });

        // Log the payment success
        await logPaymentAction(membership.user_id, 'PAYMENT_SUCCEEDED', {
          customer_id: customerId,
          payment_id: paymentId,
          amount: invoice.amount_paid / 100,
          period: 'renewal',
        });

        // Send confirmation email
        if (user && user.email) {
          const emailHtml = renewalConfirmationTemplate(
            `${user.first_name} ${user.last_name}`,
            new Date().toISOString(),
            invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000).toISOString() : null
          );
          
          await sendEmail(
            user.email,
            'Membership Renewed - Payment Received',
            emailHtml
          );
        }

        console.log(`Payment recorded (${paymentId})`);
      } catch (error) {
        console.error('Error recording payment:', error);
        // Log the error
        if (customerId) {
          // We don't have userId here, but we can log with a note
          console.error('Failed to record payment webhook for customer:', customerId);
        }
      }

      break;
    }

    // ---------------------------------------------------------
    // 3) PAYMENT FAILED
    // ---------------------------------------------------------
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      if (!customerId) break;

      console.log(`Payment failed for: ${customerId}`);

      try {
        const { data: membership } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (membership) {
          // Log the payment failure
          await logPaymentAction(membership.user_id, 'PAYMENT_FAILED', {
            customer_id: customerId,
            amount: invoice.amount_due / 100,
            period: 'renewal',
          });
        }
      } catch (error) {
        console.error('Error logging payment failure:', error);
      }

      await supabase
        .from('memberships')
        .update({ status: 'past_due', expires_at: null })
        .eq('stripe_customer_id', customerId);

      break;
    }

    // ---------------------------------------------------------
    // 4) SUBSCRIPTION UPDATED (renewed, canceled, uncanceled)
    // ---------------------------------------------------------
    case 'customer.subscription.updated': {
      const incoming = event.data.object;
      const customerId = incoming.customer;

      if (!customerId) break;

      try {
        // Get the FULL subscription object
        const sub = await stripe.subscriptions.retrieve(incoming.id);

        const stripeStatus = sub.status; // 'active', 'canceled', etc.
        const item = sub.items.data[0];

        const periodEndUnix =
          sub.current_period_end ??
          item.current_period_end ??
          null;

        const expiresAt = toIso(periodEndUnix);

        // -----------------------------------------
        // CORRECT CANCELLATION DETECTION
        // -----------------------------------------
        const isCancelScheduled =
          sub.cancel_at || sub.cancel_at_period_end;

        let membershipStatus;

        if (stripeStatus === 'canceled') {
          // Fully canceled — subscription ended
          membershipStatus = 'canceled';
        } else if (stripeStatus === 'active' && isCancelScheduled) {
          // Will end at period end
          membershipStatus = 'pending_cancellation';
        } else if (stripeStatus === 'active') {
          // Fully active, auto-renewing
          membershipStatus = 'active';
        } else {
          membershipStatus = stripeStatus; // fallback (e.g. past_due)
        }

        console.log('SUBSCRIPTION UPDATED:', {
          stripeStatus,
          cancel_at: sub.cancel_at,
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_end: expiresAt,
          membershipStatus,
        });

        // Get the user_id for logging
        const { data: membership } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (membership) {
          // Log the subscription update
          await logSubscriptionAction(membership.user_id, `SUBSCRIPTION_${membershipStatus.toUpperCase()}`, {
            customer_id: customerId,
            subscription_id: sub.id,
            status: membershipStatus,
            expires_at: expiresAt,
            stripe_status: stripeStatus,
            cancel_scheduled: isCancelScheduled,
          });
        }

        await supabase
          .from('memberships')
          .update({
            status: membershipStatus,
            expires_at: membershipStatus === 'canceled' ? null : expiresAt,
          })
          .eq('stripe_customer_id', customerId);

        console.log(`Updated membership for ${customerId}`);
      } catch (err) {
        console.error('Error updating subscription:', err);
      }

      break;
    }

    // ---------------------------------------------------------
    // 5) SUBSCRIPTION DELETED (end-of-period hit)
    // ---------------------------------------------------------
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const customerId = sub.customer;
      if (!customerId) break;

      console.log(`Subscription deleted for: ${customerId}`);

      try {
        const { data: membership } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (membership) {
          // Log the subscription deletion
          await logSubscriptionAction(membership.user_id, 'SUBSCRIPTION_CANCELED', {
            customer_id: customerId,
            subscription_id: sub.id,
            reason: 'subscription_deleted',
          });
        }
      } catch (error) {
        console.error('Error logging subscription deletion:', error);
      }

      await supabase
        .from('memberships')
        .update({ status: 'canceled', expires_at: null })
        .eq('stripe_customer_id', customerId);

      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.send();
};