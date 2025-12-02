import express from 'express';
import { 
  getAllUsers,
  getUserById,
  getUserPaymentsById,
  getUserMembershipStatusById,
  updateUser
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//All routes in this file are protected
router.use(protect);

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser); // Add PUT route for updates
router.get('/users/:userId/payments', getUserPaymentsById);
router.get('/users/:userId/membership-status', getUserMembershipStatusById);

export default router;
