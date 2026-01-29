import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from '../../../config/supabaseClient.js';
import { logPaymentAction } from '../../../utils/auditLogger.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Store your price IDs in a secure way, like environment variables.
const RECURRING_PRICE_ID = 'price_1SNgo1Ag7ZN6KXnzDFTtY6fc';
const ONE_TIME_PRICE_ID = 'price_1SNgpaAg7ZN6KXnztU1ZKd6T';

export const createCheckoutSession = async (req, res) => {
  const { priceId, userId } = req.body;

  if (!priceId || !userId) {
    return res.status(400).json({ error: 'Price ID and User ID are required.' });
  }

  // Determine the mode based on the price ID provided
  const isSubscription = priceId === RECURRING_PRICE_ID;
  const mode = isSubscription ? 'subscription' : 'payment';

  // Ensure only your designated price IDs are used
  if (priceId !== RECURRING_PRICE_ID && priceId !== ONE_TIME_PRICE_ID) {
    return res.status(400).json({ error: 'Invalid Price ID.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId, // Add this line
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${YOUR_DOMAIN}/dashboard?payment_success=true`,
      cancel_url: `${YOUR_DOMAIN}/payments?payment_cancelled=true`,
    });

    // Log the payment session initiation
    await logPaymentAction(userId, 'SESSION_CREATED', {
      session_id: session.id,
      mode: mode,
      price_id: priceId,
      is_subscription: isSubscription,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Log the error
    await logPaymentAction(userId, 'SESSION_CREATION_FAILED', {
      price_id: priceId,
      error: error.message,
    });
    
    res.status(500).json({ error: 'Failed to create checkout session.', message: error.message });
  }
};

export const createPortalSession = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // First, retrieve the user's stripe_customer_id from your database.
    const { data: membership, error: lookupError } = await supabase
      .from('memberships')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (lookupError || !membership || !membership.stripe_customer_id) {
      // Log the failed portal session attempt
      await logPaymentAction(userId, 'PORTAL_SESSION_FAILED', {
        reason: 'Subscription not found',
      });
      return res.status(404).json({ error: 'Could not find a subscription for this user.' });
    }

    const customerId = membership.stripe_customer_id;

    // Create a portal session for the customer.
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${YOUR_DOMAIN}/dashboard`,
    });

    // Log the portal session creation
    await logPaymentAction(userId, 'PORTAL_SESSION_CREATED', {
      session_id: portalSession.id,
      customer_id: customerId,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    
    // Log the error
    await logPaymentAction(userId, 'PORTAL_SESSION_CREATION_FAILED', {
      error: error.message,
    });
    
    res.status(500).json({ error: 'Failed to create portal session.', message: error.message });
  }
};
