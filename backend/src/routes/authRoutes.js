import { Router } from 'express';
import { 
  register, 
  login, 
  sendOTP, 
  verifyOTP, 
  refreshToken, 
  logout, 
  getMe 
} from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticateJWT, getMe);

export default router;
