import express from 'express';
import {
  createAnnouncementComment,
  createComment,
  createPost,
  getActivityFeed,
  toggleAnnouncementLike,
  togglePostLike,
  updateEventRsvp,
} from '../controllers/activity.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/feed', getActivityFeed);
router.post('/posts', createPost);
router.post('/posts/:postId/comments', createComment);
router.post('/posts/:postId/like', togglePostLike);
router.post('/announcements/:announcementId/comments', createAnnouncementComment);
router.post('/announcements/:announcementId/like', toggleAnnouncementLike);
router.put('/events/:eventId/rsvp', updateEventRsvp);

export default router;
