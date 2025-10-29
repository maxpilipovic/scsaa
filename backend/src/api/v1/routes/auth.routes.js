import express from 'express';
import { checkAccess } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/check-access', checkAccess);

export default router;
