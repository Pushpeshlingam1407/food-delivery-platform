import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateJWT, getCart);
router.post('/items', authenticateJWT, addToCart);
router.put('/items/:itemId', authenticateJWT, updateCartItem);
router.delete('/items/:itemId', authenticateJWT, removeFromCart);
router.delete('/', authenticateJWT, clearCart);

export default router;
