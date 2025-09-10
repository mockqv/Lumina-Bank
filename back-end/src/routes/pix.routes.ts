import { Router } from 'express';
import * as pixController from '../controllers/pix.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', pixController.getPixKeys);
router.post('/', pixController.createPixKey);
router.patch('/:key_id/status', pixController.updatePixKeyStatus);

export default router;
