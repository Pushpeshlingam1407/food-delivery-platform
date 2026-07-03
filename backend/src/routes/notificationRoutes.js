import { Router } from 'express';
import { getNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateJWT, getNotifications);
router.put('/:id/read', authenticateJWT, markNotificationRead);

export default router;
