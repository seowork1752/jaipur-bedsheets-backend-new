import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { protectRoute } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.get('/', protectRoute, getCart);
router.post('/add', protectRoute, addToCart);
router.put('/update/:productId', protectRoute, updateCartItem);
router.delete('/remove/:productId', protectRoute, removeFromCart);
router.delete('/clear', protectRoute, clearCart);

export default router;
