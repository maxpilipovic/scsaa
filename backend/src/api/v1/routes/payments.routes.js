import express from 'express';
import { createCheckoutSession, createPortalSession } from '../controllers/payments.controller.js';

const router = express.Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', createPortalSession);

export default router;