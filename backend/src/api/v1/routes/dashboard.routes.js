import express from 'express';
import {
  getMembership,
  getPayments,
  getEvents,
  getAnnouncements,
  getTotalMembers,
  getActiveMembers,
  getMembershipStatus,
  getAdminStatus,
  getRecentSignups,
  getTotalRevenue,
  getMonthlyRecurringRevenue,
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

//Public routes
router.get('/getTotalMembers', getTotalMembers);
router.get('/getActiveMembers', getActiveMembers);

//Apply the protect middleware
router.use(protect);

//Protected routes
router.get('/memberships/:userId', getMembership);
router.get('/payments/:userId', getPayments);
router.get('/events', getEvents);
router.get('/announcements', getAnnouncements);
router.get('/getMembershipStatus', getMembershipStatus);
router.get('/getAdminStatus', getAdminStatus);
router.get('/recentSignups', verifyAdmin, getRecentSignups);
router.get('/totalRevenue', verifyAdmin, getTotalRevenue);
router.get('/mrr', verifyAdmin, getMonthlyRecurringRevenue);

export default router;
