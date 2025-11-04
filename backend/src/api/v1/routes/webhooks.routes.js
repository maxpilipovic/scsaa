import express from 'express';
import { handleStripeWebhook } from '../controllers/webhooks.controller.js';

const router = express.Router();

// Stripe requires the raw body to construct the event, so we use express.raw middleware for this route.
router.post('/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);

export default router;
