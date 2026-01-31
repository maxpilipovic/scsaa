import express from 'express';
import { checkAccess, logAuthEvent } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Apply stricter rate limiting to auth endpoints
router.get('/check-access', authLimiter, checkAccess);
router.post('/log-auth-event', authLimiter, logAuthEvent);

export default router;
