import { Router } from 'express';
import * as pixController from '../controllers/pix.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', pixController.getPixKeys);
router.post('/', pixController.createPixKey);
router.get('/user/:userId/primary', pixController.getPrimaryPixKeyByUserId);
router.patch('/:key_id/status', pixController.updatePixKeyStatus);
router.delete('/:key_id', pixController.deletePixKey);

export default router;
