import { Router } from 'express';
import * as transactionController from '@/controllers/transaction.controller.js';
import { protect } from '@/middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/recent', transactionController.getRecentTransactions);
router.post('/', transactionController.createTransaction);
router.get('/:accountId/statement', transactionController.getStatement);
router.post('/pix', transactionController.createPixTransfer);

export default router;
