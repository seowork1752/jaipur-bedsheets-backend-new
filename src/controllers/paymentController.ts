import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret',
}) as any;

// Create Razorpay order
export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.paymentStatus !== 'pending') {
      return sendError(res, 'Order payment already processed', 400);
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // Convert to paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: req.userId,
      },
    });

    return sendSuccess(res, 'Razorpay order created', {
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      currency: 'INR',
    });
  } catch (error: any) {
    return sendError(res, 'Error creating Razorpay order', 500, error);
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (razorpaySignature !== expectedSignature) {
      return sendError(res, 'Invalid payment signature', 400);
    }

    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'completed',
        paymentId: razorpayPaymentId,
        orderStatus: 'confirmed',
      },
      { new: true }
    );

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Payment verified successfully', {
      orderId,
      orderNumber: order.orderNumber,
      paymentId: razorpayPaymentId,
    });
  } catch (error: any) {
    return sendError(res, 'Error verifying payment', 500, error);
  }
};

// Get payment status
export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Payment status fetched', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.total,
      paymentId: order.paymentId,
    });
  } catch (error: any) {
    return sendError(res, 'Error fetching payment status', 500, error);
  }
};

// Process refund
export const processRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (!order.paymentId) {
      return sendError(res, 'No payment found for this order', 400);
    }

    if (order.refundStatus === 'processed') {
      return sendError(res, 'Refund already processed', 400);
    }

    try {
      // Create refund through Razorpay
      const refund = await razorpay.payments.refund(order.paymentId, {
        amount: Math.round((order.refundAmount || order.total) * 100),
        notes: {
          orderId: order._id.toString(),
          reason: 'Customer return/cancellation',
        },
      });

      order.refundStatus = 'processed';
      await order.save();

      return sendSuccess(res, 'Refund processed successfully', {
        orderId,
        refundId: refund.id,
        amount: order.refundAmount || order.total,
      });
    } catch (razorpayError: any) {
      order.refundStatus = 'failed';
      await order.save();
      return sendError(res, 'Refund processing failed', 400, razorpayError);
    }
  } catch (error: any) {
    return sendError(res, 'Error processing refund', 500, error);
  }
};

// Save card for future use
export const saveCard = async (req: AuthRequest, res: Response) => {
  try {
    const { cardToken, last4, brand } = req.body;

    // In production, save card token securely through Razorpay
    // This is a simplified version

    return sendSuccess(res, 'Card saved successfully', {
      cardToken,
      last4,
      brand,
      isDefault: false,
    });
  } catch (error: any) {
    return sendError(res, 'Error saving card', 500, error);
  }
};

// Apply coupon code
export const applyCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, couponCode } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // In production, validate coupon from database
    // This is a simplified version
    if (couponCode === 'WELCOME10') {
      const discountAmount = Math.round(order.subtotal * 0.1);
      order.discount = discountAmount;
      order.discountCode = couponCode;
      order.total = order.subtotal - discountAmount + order.tax + order.shippingCost;
      await order.save();

      return sendSuccess(res, 'Coupon applied successfully', {
        discountAmount,
        newTotal: order.total,
      });
    }

    return sendError(res, 'Invalid coupon code', 400);
  } catch (error: any) {
    return sendError(res, 'Error applying coupon', 500, error);
  }
};

// Get available payment methods
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const paymentMethods = [
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI',
        icon: 'upi-icon',
      },
      {
        id: 'card',
        name: 'Credit Card',
        description: 'Pay using credit card',
        icon: 'card-icon',
      },
      {
        id: 'debit',
        name: 'Debit Card',
        description: 'Pay using debit card',
        icon: 'debit-icon',
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay through your bank',
        icon: 'netbanking-icon',
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        description: 'Pay using digital wallet',
        icon: 'wallet-icon',
      },
      {
        id: 'emi',
        name: 'EMI',
        description: 'Pay in easy monthly installments',
        icon: 'emi-icon',
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: 'cod-icon',
      },
    ];

    return sendSuccess(res, 'Payment methods fetched', paymentMethods);
  } catch (error: any) {
    return sendError(res, 'Error fetching payment methods', 500, error);
  }
};
