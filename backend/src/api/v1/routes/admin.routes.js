import express from 'express';
import { 
  //User routes
  getAllUsers,
  getUserById,
  getUserPaymentsById,
  getUserMembershipStatusById,
  updateUser,
  //Event routes
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  //Anouncement routes
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  //Check admin role
  checkAdminRole
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//All routes in this file are protected
router.use(protect);

//User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.get('/users/:userId/payments', getUserPaymentsById);
router.get('/users/:userId/membership-status', getUserMembershipStatusById);

//Event Management Routes
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);

//Announcement Management Routes
router.get('/announcements', getAllAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:announcementId', updateAnnouncement);
router.delete('/announcements/:announcementId', deleteAnnouncement);

//Check Admin Role
router.get('/check-admin/:userId', checkAdminRole);

export default router;
