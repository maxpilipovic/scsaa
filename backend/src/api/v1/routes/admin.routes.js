import express from 'express';
import { getAllUsers, getUserById } from '../controllers/admin.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// Route to get all users
router.get('/users', getAllUsers);

// Route to get a single user by ID
router.get('/users/:userId', getUserById);

export default router;
