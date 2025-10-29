import express from 'express';
import authRouter from './auth.routes.js';
import dashboardRouter from './dashboard.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);

export default router;
