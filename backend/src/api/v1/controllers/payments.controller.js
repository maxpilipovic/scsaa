import Stripe from 'stripe';
import dotenv from 'dotenv';

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

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session.', message: error.message });
  }
};