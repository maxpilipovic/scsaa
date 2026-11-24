import express from 'express';
import { checkAccess, logAuthEvent, forgotPassword } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// check-access is called on every page load, so don't rate limit it
router.get('/check-access', checkAccess);

// Only rate limit the logging endpoint
router.post('/log-auth-event', authLimiter, protect, logAuthEvent);

// Forgot password endpoint with rate limiting
router.post('/forgot-password', authLimiter, forgotPassword);

export default router;
