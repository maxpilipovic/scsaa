
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

// Throw on database errors so Stripe retries the event
const assertOk = ({ error }, context) => {
  if (error) throw new Error(`${context}: ${error.message}`);
};

const isDonationSubscription = (subscription) =>
  subscription?.metadata?.donation_type === 'monthly';

// Newer Stripe API versions moved this field under invoice.parent
const getInvoiceSubscriptionId = (invoice) =>
  invoice.parent?.subscription_details?.subscription ?? invoice.subscription ?? null;

// Returns false when this Stripe payment was already recorded
const recordPayment = async (userId, amount, stripePaymentId) => {
  const existing = await supabase
    .from('payments')
    .select('stripe_payment_id')
    .eq('stripe_payment_id', stripePaymentId)
    .limit(1)
    .maybeSingle();
  assertOk(existing, 'Checking for existing payment');
  if (existing.data) return false;

  const inserted = await supabase.from('payments').insert({
    user_id: userId,
    dues_amount: amount,
    processing_fee: 0,
    stripe_payment_id: stripePaymentId,
    status: 'succeeded',
  });
  assertOk(inserted, 'Recording payment');
  return true;
};

// Donors need a saved Stripe customer for the billing portal, but a donation
// must never change an existing membership.
const saveDonorCustomer = async (userId, customerId) => {
  const existing = await supabase
    .from('memberships')
    .select('user_id, stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();
  assertOk(existing, 'Looking up donor record');

  if (!existing.data) {
    const inserted = await supabase.from('memberships').insert({
      user_id: userId,
      stripe_customer_id: customerId,
      year: new Date().getFullYear(),
      status: 'donor',
      paid_at: new Date().toISOString(),
      expires_at: null,
    });
    assertOk(inserted, 'Creating donor record');
  } else if (!existing.data.stripe_customer_id) {
    const updated = await supabase
      .from('memberships')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', userId);
    assertOk(updated, 'Saving donor customer');
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is raw because of express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await processStripeEvent(event);
  } catch (error) {
    console.error(`Failed to process ${event.type} (${event.id}):`, error);
    return res.status(500).send('Webhook processing failed');
  }

  res.send();
};

const processStripeEvent = async (event) => {
  switch (event.type) {
    // ---------------------------------------------------------
    // 1) CHECKOUT SESSION COMPLETED (Subscriptions & One-time Payments)
    // ---------------------------------------------------------
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const customerId = session.customer;

      console.log('Checkout session completed:', {
        mode: session.mode,
        metadata: session.metadata,
        amount_total: session.amount_total,
        userId,
        customerId
      });

      if (!userId) {
        console.log('Missing userId, skipping...');
        break;
      }

      // For subscriptions, we need a customer ID
      if (session.mode === 'subscription' && !customerId) {
        console.log('Missing customerId for subscription, skipping...');
        break;
      }

      try {
        // Handle subscription (membership or recurring donation)
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription;
          if (!subscriptionId) break;

          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const item = sub.items.data[0];
          const periodEnd = item.current_period_end;
          const expiresAt = toIso(periodEnd);

          // Check if this is a donation subscription
          const isDonation = session.metadata?.donation_type === 'monthly';

          if (isDonation) {
            // Record the donation subscription in payments table
            const amount = session.amount_total / 100;
            
            const isNewPayment = await recordPayment(userId, amount, subscriptionId);

            // Keep the customer for the billing portal without touching membership status
            await saveDonorCustomer(userId, customerId);

            if (!isNewPayment) break;

            // Log the donation
            await logPaymentAction(userId, 'DONATION_SUBSCRIPTION_CREATED', {
              customer_id: customerId,
              subscription_id: subscriptionId,
              amount: amount,
              type: 'monthly_recurring',
            });

            const { data: user } = await supabase
              .from('users')
              .select('email, first_name, last_name')
              .eq('id', userId)
              .single();

            if (user && user.email) {
              const emailHtml = paymentConfirmationTemplate(
                `${user.first_name} ${user.last_name}`,
                amount,
                subscriptionId,
                { isDonation: true }
              );

              await sendEmail(
                user.email,
                'Thank You for Your Monthly Donation - SCSAA',
                emailHtml
              );
            }

            console.log(`Monthly donation subscription created for ${userId}`);
          } else {
            // Regular membership subscription
            const saved = await supabase.from('memberships').upsert(
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
            assertOk(saved, 'Saving membership');

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
              const amount = session.amount_total / 100;
              const emailHtml = paymentConfirmationTemplate(
                `${user.first_name} ${user.last_name}`,
                amount,
                subscriptionId
              );
              
              await sendEmail(
                user.email,
                'Welcome to SCSAA - Membership Active',
                emailHtml
              );
            }

            console.log(`Membership provisioned for ${userId}`);
          }
        } 
        // Handle one-time payment (donation)
        else if (session.mode === 'payment') {
          console.log('Processing one-time payment with metadata:', session.metadata);
          
          const isDonation = session.metadata?.donation_type === 'one-time';
          
          console.log('Is this a donation?', isDonation);
          
          if (isDonation) {
            const amount = session.amount_total / 100;
            const paymentIntentId = session.payment_intent;

            console.log('Inserting one-time donation:', {
              user_id: userId,
              dues_amount: amount,
              payment_id: paymentIntentId
            });

            // Record the one-time donation in payments table
            const isNewPayment = await recordPayment(userId, amount, paymentIntentId);
            if (!isNewPayment) break;

            // Log the donation
            await logPaymentAction(userId, 'DONATION_SUCCEEDED', {
              customer_id: customerId || 'none',
              payment_id: paymentIntentId,
              amount: amount,
              type: 'one-time',
            });

            // Get user email for confirmation
            const { data: user } = await supabase
              .from('users')
              .select('email, first_name, last_name')
              .eq('id', userId)
              .single();

            // Send thank you email
            if (user && user.email) {
              const emailHtml = paymentConfirmationTemplate(
                `${user.first_name} ${user.last_name}`,
                amount,
                paymentIntentId,
                { isDonation: true }
              );
              
              await sendEmail(
                user.email,
                'Thank You for Your Donation - SCSAA',
                emailHtml
              );
            }

            console.log(`One-time donation of $${amount} recorded for ${userId}`);
          } else {
            console.log('One-time payment detected but not identified as donation. Metadata:', session.metadata);
          }
        }
      } catch (error) {
        console.error('Error processing checkout session:', error);
        // Log the error
        if (userId) {
          await logPaymentAction(userId, 'CHECKOUT_PROCESSING_FAILED', {
            error: error.message,
            session_id: session.id,
          });
        }
        throw error;
      }

      break;
    }

    // ---------------------------------------------------------
    // 2) RENEWAL PAYMENT SUCCEEDED (Memberships & Recurring Donations)
    // ---------------------------------------------------------
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const paymentId =
        invoice.payment_intent || invoice.charge || invoice.id;

      if (!customerId || !paymentId) break;

      console.log(`Recording payment for ${customerId}`);

      try {
        let resolvedUserId = null;
        // Check if this is a donation subscription by looking at metadata
        let isDonation = false;
        let subscription = null;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
          // Check if this subscription has donation metadata
          isDonation = isDonationSubscription(subscription);
          resolvedUserId = subscription.metadata?.user_id || null;
        }

        const { data: membership } = await supabase
          .from('memberships')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        resolvedUserId = membership?.user_id || resolvedUserId;

        if (!resolvedUserId) break;

        // The first donation invoice is already recorded by checkout.session.completed
        const isFirstInvoice = invoice.billing_reason === 'subscription_create';
        if (isDonation && isFirstInvoice) break;

        const { data: user } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', resolvedUserId)
          .single();

        // Stripe can deliver the same event more than once
        const isNewPayment = await recordPayment(resolvedUserId, invoice.amount_paid / 100, paymentId);
        if (!isNewPayment) break;

        if (isDonation) {
          // Log the recurring donation payment
          await logPaymentAction(resolvedUserId, 'DONATION_RENEWAL_SUCCEEDED', {
            customer_id: customerId,
            payment_id: paymentId,
            amount: invoice.amount_paid / 100,
            type: 'monthly_recurring',
          });

          // Send donation thank you email
          if (user && user.email) {
            const emailHtml = paymentConfirmationTemplate(
              `${user.first_name} ${user.last_name}`,
              invoice.amount_paid / 100,
              paymentId,
              { isDonation: true }
            );
            
            await sendEmail(
              user.email,
              'Thank You - Monthly Donation Received',
              emailHtml
            );
          }

          console.log(`Recurring donation payment recorded (${paymentId})`);
        } else {
          // Log the membership renewal payment
          await logPaymentAction(resolvedUserId, 'PAYMENT_SUCCEEDED', {
            customer_id: customerId,
            payment_id: paymentId,
            amount: invoice.amount_paid / 100,
            period: isFirstInvoice ? 'initial' : 'renewal',
          });

          // Only a yearly cycle is a renewal; new members get a welcome email from checkout
          if (invoice.billing_reason === 'subscription_cycle' && user && user.email) {
            const emailHtml = renewalConfirmationTemplate(
              `${user.first_name} ${user.last_name}`,
              new Date().toISOString(),
              toIso(subscription?.items?.data?.[0]?.current_period_end)
            );
            
            await sendEmail(
              user.email,
              'Membership Renewed - Payment Received',
              emailHtml
            );
          }

          console.log(`Membership payment recorded (${paymentId})`);
        }
      } catch (error) {
        console.error('Error recording payment:', error);
        // Log the error
        if (customerId) {
          console.error('Failed to record payment webhook for customer:', customerId);
        }
        throw error;
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

      const failedSubscriptionId = getInvoiceSubscriptionId(invoice);
      if (!failedSubscriptionId) break;

      const failedSubscription = await stripe.subscriptions.retrieve(failedSubscriptionId);
      if (isDonationSubscription(failedSubscription)) break;

      // Events can arrive late; only act if the subscription is still unpaid
      if (!['past_due', 'unpaid'].includes(failedSubscription.status)) break;

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

      // Keep expires_at: Stripe is still retrying the card
      assertOk(
        await supabase
          .from('memberships')
          .update({ status: failedSubscription.status })
          .eq('stripe_customer_id', customerId),
        'Marking membership past due'
      );

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

        // Donations never affect membership status or expiry
        if (isDonationSubscription(sub)) break;

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

        assertOk(
          await supabase
            .from('memberships')
            .update({
              status: membershipStatus,
              expires_at: membershipStatus === 'canceled' ? null : expiresAt,
            })
            .eq('stripe_customer_id', customerId),
          'Updating membership'
        );

        console.log(`Updated membership for ${customerId}`);
      } catch (err) {
        console.error('Error updating subscription:', err);
        throw err;
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

      // Donations never affect membership status or expiry
      if (isDonationSubscription(sub)) break;

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

      assertOk(
        await supabase
          .from('memberships')
          .update({ status: 'canceled', expires_at: null })
          .eq('stripe_customer_id', customerId),
        'Canceling membership'
      );

      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }
};
