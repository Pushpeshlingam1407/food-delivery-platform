import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticateJWT, toggleFavorite);
router.get('/', authenticateJWT, getFavorites);

export default router;
