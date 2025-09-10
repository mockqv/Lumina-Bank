import { Router } from 'express';
import * as userController from '@/controllers/user.controller.js';
import { protect } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.patch('/profile', userController.updateProfile);

export default router;
