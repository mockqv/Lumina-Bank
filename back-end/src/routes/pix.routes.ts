import { Router } from 'express';
import * as pixController from '../controllers/pix.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', pixController.getPixKeys);
router.post('/', pixController.createPixKey);
router.patch('/:key_id/status', pixController.updatePixKeyStatus);

export default router;
