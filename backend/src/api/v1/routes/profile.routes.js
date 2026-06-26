import express from 'express';
import multer from 'multer';
import {
  deleteProfilePicture,
  getMyProfile,
  uploadProfilePicture,
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }

    cb(null, true);
  },
});

const uploadProfilePictureMiddleware = (req, res, next) => {
  upload.single('profilePicture')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Profile picture must be 5 MB or smaller.' });
    }

    res.status(400).json({ message: error.message || 'Invalid profile picture upload.' });
  });
};

router.use(protect);

router.get('/me', getMyProfile);
router.post('/picture', uploadProfilePictureMiddleware, uploadProfilePicture);
router.delete('/picture', deleteProfilePicture);

export default router;
