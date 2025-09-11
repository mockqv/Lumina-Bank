import { Router } from 'express';
import * as accountController from '@/controllers/account.controller.js';
import * as transactionController from '@/controllers/transaction.controller.js';
import { protect } from '@/middlewares/auth.middleware.js';

const router = Router();

// All routes in this file are protected
router.use(protect);

router.get('/', accountController.getAccounts);
router.get('/balance', accountController.getAccountBalance);
router.get('/:accountId/transactions', transactionController.getTransactions);

export default router;
