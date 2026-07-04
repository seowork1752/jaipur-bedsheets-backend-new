import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  initiateReturn,
  cancelOrder,
  getAllOrders,
  getOrderAnalytics,
} from '../controllers/orderController';
import { protectRoute, adminOnly } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/', protectRoute, createOrder);
router.get('/', protectRoute, getUserOrders);
router.get('/:orderId', protectRoute, getOrderById);
router.put('/:orderId/cancel', protectRoute, cancelOrder);
router.post('/:orderId/return', protectRoute, initiateReturn);

// Admin routes
router.get('/admin/all', adminOnly, getAllOrders);
router.put('/:orderId/status', adminOnly, updateOrderStatus);
router.get('/admin/analytics', adminOnly, getOrderAnalytics);

export default router;
