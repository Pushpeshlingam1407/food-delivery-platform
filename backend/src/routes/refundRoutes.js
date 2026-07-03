import { Router } from 'express';
import { processRefund } from '../controllers/refundController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticateJWT, processRefund);

export default router;
