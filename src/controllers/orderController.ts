import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { generateOrderNumber } from '../utils/auth';

// Create order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      deliveryInstructions,
      paymentMethod,
      discountCode,
      giftWrap,
      giftMessage,
    } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 'Order must have at least one item', 400);
    }

    if (!shippingAddress) {
      return sendError(res, 'Shipping address is required', 400);
    }

    if (!paymentMethod) {
      return sendError(res, 'Payment method is required', 400);
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendError(res, `Product ${item.productId} not found`, 404);
      }

      const price = item.price || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        variantId: item.variantId,
        name: product.name,
        sku: product.variants?.[0]?.sku || 'DEFAULT-SKU',
        price,
        discountPrice: item.discountPrice,
        quantity: item.quantity,
        total: itemTotal,
        image: product.images.front,
      });

      // Update product stock
      await Product.updateOne(
        { _id: product._id },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Calculate discount
    let discount = 0;
    if (discountCode) {
      // In production, verify coupon
      discount = Math.round(subtotal * 0.1); // 10% discount for demo
    }

    // Calculate tax (GST - 18%)
    const taxRate = 0.18;
    const tax = Math.round((subtotal - discount) * taxRate);

    // Shipping cost (Free above ₹500)
    const shippingCost = subtotal > 500 ? 0 : 100;

    const total = subtotal - discount + tax + shippingCost;

    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      userId: req.userId,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      deliveryInstructions,
      subtotal,
      discount,
      discountCode,
      shippingCost,
      tax,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      giftWrap: giftWrap || false,
      giftMessage,
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    });

    await order.save();

    // Clear user's cart
    await Cart.deleteOne({ userId: req.userId });

    return sendSuccess(res, 'Order created successfully', order, 201);
  } catch (error: any) {
    return sendError(res, 'Error creating order', 500, error);
  }
};

// Get user's orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('items.productId', 'name slug images.front');

    const total = await Order.countDocuments({ userId: req.userId });

    return sendPaginatedResponse(
      res,
      'Orders fetched successfully',
      orders,
      total,
      pageNum,
      limitNum
    );
  } catch (error: any) {
    return sendError(res, 'Error fetching orders', 500, error);
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
    }).populate('items.productId', 'name slug images.front');

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Order fetched successfully', order);
  } catch (error: any) {
    return sendError(res, 'Error fetching order', 500, error);
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, trackingNumber, shippingProvider } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus,
        trackingNumber: trackingNumber || undefined,
        shippingProvider: shippingProvider || undefined,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Order status updated', order);
  } catch (error: any) {
    return sendError(res, 'Error updating order', 500, error);
  }
};

// Initiate return
export const initiateReturn = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { returnReason } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
      orderStatus: 'delivered',
    });

    if (!order) {
      return sendError(res, 'Order not eligible for return', 400);
    }

    order.returnStatus = 'initiated';
    order.returnReason = returnReason;
    await order.save();

    return sendSuccess(res, 'Return initiated successfully', order);
  } catch (error: any) {
    return sendError(res, 'Error initiating return', 500, error);
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (!['pending', 'confirmed', 'processing'].includes(order.orderStatus)) {
      return sendError(res, 'Order cannot be cancelled at this stage', 400);
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    order.refundAmount = order.total;
    order.refundStatus = 'pending';
    await order.save();

    return sendSuccess(res, 'Order cancelled successfully', order);
  } catch (error: any) {
    return sendError(res, 'Error cancelling order', 500, error);
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus,
      sort = '-createdAt',
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const sortStr = String(sort || '-createdAt');

    const filter: any = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .sort(sortStr)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'name sku');

    const total = await Order.countDocuments(filter);

    return sendPaginatedResponse(
      res,
      'Orders fetched',
      orders,
      total,
      pageNum,
      limitNum
    );
  } catch (error: any) {
    return sendError(res, 'Error fetching orders', 500, error);
  }
};

// Get order analytics
export const getOrderAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    return sendSuccess(res, 'Analytics fetched', {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
    });
  } catch (error: any) {
    return sendError(res, 'Error fetching analytics', 500, error);
  }
};
