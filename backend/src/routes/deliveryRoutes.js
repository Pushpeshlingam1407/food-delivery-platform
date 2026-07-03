import { Router } from 'express';
import { toggleDriverStatus, logDriverLocation } from '../controllers/deliveryController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.put('/status', authenticateJWT, toggleDriverStatus);
router.post('/location', authenticateJWT, logDriverLocation);

export default router;
