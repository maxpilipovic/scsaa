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
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/memberships/:userId', getMembership);
router.get('/payments/:userId', getPayments);
router.get('/events', getEvents);
router.get('/announcements', getAnnouncements);
router.get('/getTotalMembers', getTotalMembers);
router.get('/getActiveMembers', getActiveMembers);
router.get('/getMembershipStatus', getMembershipStatus);
router.get('/getAdminStatus', getAdminStatus);

export default router;
