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
router.get('/recentSignups', getRecentSignups);
router.get('/totalRevenue', getTotalRevenue);
router.get('/mrr', getMonthlyRecurringRevenue);

export default router;
