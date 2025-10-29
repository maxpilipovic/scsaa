import express from 'express';
import {
  getMembership,
  getPayments,
  getEvents,
  getAnnouncements,
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/memberships/:userId', getMembership);
router.get('/payments/:userId', getPayments);
router.get('/events', getEvents);
router.get('/announcements', getAnnouncements);

export default router;
