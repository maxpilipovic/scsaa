import express from 'express';
import { checkAccess, logAuthEvent } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// check-access is called on every page load, so don't rate limit it
router.get('/check-access', checkAccess);

// Only rate limit the logging endpoint
router.post('/log-auth-event', authLimiter, logAuthEvent);

export default router;
