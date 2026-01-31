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
  checkAdminRole,
  //Email routes
  searchUsers,
  sendEmailToUser,
  sendBulkCustomEmail,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

//All routes in this file require authentication
router.use(protect);

//All routes after this point also require admin privileges
router.use(verifyAdmin);

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

//Email Management Routes
router.get('/search-users', searchUsers);
router.post('/send-email-to-user', sendEmailToUser);
router.post('/send-bulk-email', sendBulkCustomEmail);

export default router;
