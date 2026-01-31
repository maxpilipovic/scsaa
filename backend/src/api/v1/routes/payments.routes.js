import express from 'express';
import { createCheckoutSession, createPortalSession } from '../controllers/payments.controller.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Apply stricter rate limiting to payment endpoints
router.post('/create-checkout-session', paymentLimiter, createCheckoutSession);
router.post('/create-portal-session', paymentLimiter, createPortalSession);

export default router;