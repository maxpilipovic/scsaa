import express from 'express';
import { createCheckoutSession, createPortalSession, createDonationSession } from '../controllers/payments.controller.js';
import { paymentLimiter } from '../middleware/rateLimitMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply stricter rate limiting to payment endpoints
router.post('/create-checkout-session', paymentLimiter, protect, createCheckoutSession);
router.post('/create-donation-session', paymentLimiter, protect, createDonationSession);
router.post('/create-portal-session', paymentLimiter, protect, createPortalSession);

export default router;