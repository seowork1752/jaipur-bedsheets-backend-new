import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  processRefund,
  saveCard,
  applyCoupon,
  getPaymentMethods,
} from '../controllers/paymentController';
import { protectRoute, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/methods', getPaymentMethods);

// Protected routes
router.post('/razorpay/order/:orderId', protectRoute, createRazorpayOrder);
router.post('/razorpay/verify', protectRoute, verifyRazorpayPayment);
router.get('/status/:orderId', protectRoute, getPaymentStatus);
router.post('/refund/:orderId', protectRoute, processRefund);
router.post('/save-card', protectRoute, saveCard);
router.post('/coupon', protectRoute, applyCoupon);

export default router;
