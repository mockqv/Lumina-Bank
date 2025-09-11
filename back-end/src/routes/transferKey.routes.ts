import { Router } from 'express';
import * as transferKeyController from '@/controllers/transferKey.controller.js';
import { protect } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', transferKeyController.createTransferKey);
router.get('/:key', transferKeyController.getTransferKey);

export default router;
