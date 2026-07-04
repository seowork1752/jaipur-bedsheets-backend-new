import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../controllers/authController';
import { protectRoute, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protectRoute, getCurrentUser);
router.put('/profile', protectRoute, updateProfile);
router.post('/change-password', protectRoute, changePassword);

// Address management
router.post('/addresses', protectRoute, addAddress);
router.put('/addresses/:addressId', protectRoute, updateAddress);
router.delete('/addresses/:addressId', protectRoute, deleteAddress);

// Wishlist
router.get('/wishlist', protectRoute, getWishlist);
router.post('/wishlist/add/:productId', protectRoute, addToWishlist);
router.delete('/wishlist/remove/:productId', protectRoute, removeFromWishlist);

export default router;
