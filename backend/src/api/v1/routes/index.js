import express from 'express';
import authRouter from './auth.routes.js';
import dashboardRouter from './dashboard.routes.js';
import paymentsRouter from './payments.routes.js';
import webhooksRouter from './webhooks.routes.js';
import adminRouter from './admin.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/payments', paymentsRouter);
router.use('/webhooks', webhooksRouter);
router.use('/admin', adminRouter);

export default router;
