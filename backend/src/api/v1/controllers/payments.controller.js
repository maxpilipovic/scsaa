import Stripe from 'stripe';
import dotenv from 'dotenv';
import { supabase } from '../../../config/supabaseClient.js';
import { logPaymentAction } from '../../../utils/auditLogger.js';
import { sendEmail, paymentConfirmationTemplate } from '../../../utils/emailService.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Store your price IDs in a secure way, like environment variables.
const RECURRING_PRICE_ID = process.env.RECURRING_PRICE_ID; 
const ONE_TIME_PRICE_ID = process.env.ONETIME_PRICE_ID;

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
    
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
};

export const createDonationSession = async (req, res) => {
  const { amount, userId, type } = req.body;

  console.log('Creating donation session with:', { amount, userId, type });

  if (!amount || !userId || !type) {
    return res.status(400).json({ error: 'Amount, User ID, and donation type are required.' });
  }

  // Validate amount (minimum $1 = 100 cents, maximum $1,000,000 = 100,000,000 cents)
  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum donation amount is $1.' });
  }
  if (amount > 100000000) {
    return res.status(400).json({ error: 'Maximum donation amount is $1,000,000.' });
  }

  try {
    // Try to get existing customer ID from memberships table
    const { data: membership } = await supabase
      .from('memberships')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    const sessionConfig = {
      client_reference_id: userId,
      success_url: `${YOUR_DOMAIN}/dashboard?donation_success=true`,
      cancel_url: `${YOUR_DOMAIN}/payments?donation_cancelled=true`,
      metadata: {
        user_id: userId,
        donation_type: type,
      },
    };

    // If user already has a customer ID, reuse it for easier management
    if (membership?.stripe_customer_id) {
      sessionConfig.customer = membership.stripe_customer_id;
    }

    console.log('Session metadata being set:', sessionConfig.metadata);
    if (sessionConfig.customer) {
      console.log('Reusing existing customer ID:', sessionConfig.customer);
    }

    if (type === 'monthly') {
      // Create a recurring donation (subscription)
      sessionConfig.mode = 'subscription';
      sessionConfig.subscription_data = {
        metadata: {
          donation_type: 'monthly',
          user_id: userId,
        },
      };
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Monthly Donation',
              description: 'Recurring monthly donation to SCSAA',
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];
    } else {
      // Create a one-time donation
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'One-Time Donation',
              description: 'One-time donation to SCSAA',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Donation session created:', {
      id: session.id,
      mode: session.mode,
      metadata: session.metadata,
      amount_total: session.amount_total
    });

    // Log the donation session initiation
    await logPaymentAction(userId, 'DONATION_SESSION_CREATED', {
      session_id: session.id,
      amount: amount / 100,
      type: type,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating donation session:', error);
    
    // Log the error
    await logPaymentAction(userId, 'DONATION_SESSION_FAILED', {
      amount: amount / 100,
      type: type,
      error: error.message,
    });
    
    res.status(500).json({ error: 'Failed to create donation session. Please try again.' });
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
    
    res.status(500).json({ error: 'Failed to create portal session. Please try again.' });
  }
};
