import express from 'express';
import { getAllUsers } from '../controllers/admin.controller.js';
import { getUserById } from '../controllers/admin.controller.js';
import { getUserPaymentsById } from '../controllers/admin.controller.js';
import { getUserMembershipStatusById } from '../controllers/admin.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//All routes in this file are protected
router.use(protect);

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.get('/users/:userId/payments', getUserPaymentsById);
router.get('/users/:userId/membership-status', getUserMembershipStatusById);

export default router;
