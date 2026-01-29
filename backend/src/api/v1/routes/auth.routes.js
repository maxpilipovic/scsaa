import express from 'express';
import { checkAccess, logAuthEvent } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/check-access', checkAccess);
router.post('/log-auth-event', logAuthEvent);

export default router;
