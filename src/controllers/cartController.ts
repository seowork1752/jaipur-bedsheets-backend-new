import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Get cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId })
      .populate('items.productId', 'name price discountPrice images.front');

    if (!cart) {
      return sendSuccess(res, 'Cart is empty', { items: [], total: 0 });
    }

    return sendSuccess(res, 'Cart fetched successfully', cart);
  } catch (error: any) {
    return sendError(res, 'Error fetching cart', 500, error);
  }
};

// Add to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, variantId } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return sendError(res, 'Invalid product or quantity', 400);
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.stock < quantity) {
      return sendError(res, 'Insufficient stock', 400);
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.variantId === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id as any,
        variantId,
        quantity,
        addedAt: new Date(),
      });
    }

    // Calculate totals
    cart.subtotal = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        const price = prod.discountPrice || prod.price;
        cart.subtotal += price * item.quantity;
      }
    }

    cart.tax = Math.round(cart.subtotal * 0.18); // 18% GST
    cart.shippingCost = cart.subtotal > 500 ? 0 : 100;
    cart.total = cart.subtotal - (cart.discount || 0) + cart.tax + cart.shippingCost;
    cart.lastUpdated = new Date();

    await cart.save();
    await cart.populate('items.productId', 'name price discountPrice images.front');

    return sendSuccess(res, 'Item added to cart', cart, 201);
  } catch (error: any) {
    return sendError(res, 'Error adding to cart', 500, error);
  }
};

// Update cart item
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return sendError(res, 'Invalid quantity', 400);
    }

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return sendError(res, 'Cart not found', 404);
    }

    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) {
      return sendError(res, 'Item not in cart', 404);
    }

    item.quantity = quantity;

    // Recalculate totals
    cart.subtotal = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (product) {
        const price = product.discountPrice || product.price;
        cart.subtotal += price * cartItem.quantity;
      }
    }

    cart.tax = Math.round(cart.subtotal * 0.18);
    cart.total = cart.subtotal - (cart.discount || 0) + cart.tax + cart.shippingCost;
    cart.lastUpdated = new Date();

    await cart.save();
    await cart.populate('items.productId', 'name price discountPrice images.front');

    return sendSuccess(res, 'Cart updated', cart);
  } catch (error: any) {
    return sendError(res, 'Error updating cart', 500, error);
  }
};

// Remove from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      return sendError(res, 'Cart not found', 404);
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    // Recalculate totals
    cart.subtotal = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const price = product.discountPrice || product.price;
        cart.subtotal += price * item.quantity;
      }
    }

    cart.tax = Math.round(cart.subtotal * 0.18);
    cart.total = cart.subtotal - (cart.discount || 0) + cart.tax + cart.shippingCost;
    cart.lastUpdated = new Date();

    await cart.save();
    await cart.populate('items.productId', 'name price discountPrice images.front');

    return sendSuccess(res, 'Item removed from cart', cart);
  } catch (error: any) {
    return sendError(res, 'Error removing from cart', 500, error);
  }
};

// Clear cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    await Cart.deleteOne({ userId: req.userId });

    return sendSuccess(res, 'Cart cleared', { items: [], total: 0 });
  } catch (error: any) {
    return sendError(res, 'Error clearing cart', 500, error);
  }
};
