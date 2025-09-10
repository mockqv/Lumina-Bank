import { Router } from 'express';
import * as transactionController from '@/controllers/transaction.controller.js';
import { protect } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', transactionController.createTransaction);

export default router;
