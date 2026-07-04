import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  total: number;
  image: string;
}

interface IOrderAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress: IOrderAddress;
  deliveryInstructions?: string;
  
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  
  paymentMethod: 'upi' | 'card' | 'debit' | 'netbanking' | 'wallet' | 'emi' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  transactionId?: string;
  
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingProvider?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  giftWrap: boolean;
  giftMessage?: string;
  
  returnReason?: string;
  returnStatus?: 'not_initiated' | 'initiated' | 'approved' | 'shipped' | 'received' | 'rejected';
  returnTrackingNumber?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'failed';
  
  notes?: string;
  invoiceUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variantId: String,
        name: String,
        sku: String,
        price: Number,
        discountPrice: Number,
        quantity: Number,
        total: Number,
        image: String,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      isDefault: Boolean,
    },
    billingAddress: {
      fullName: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      isDefault: Boolean,
    },
    deliveryInstructions: String,
    subtotal: Number,
    discount: {
      type: Number,
      default: 0,
    },
    discountCode: String,
    shippingCost: Number,
    tax: Number,
    total: Number,
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'debit', 'netbanking', 'wallet', 'emi', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentId: String,
    transactionId: String,
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
      index: true,
    },
    shippingProvider: String,
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    giftWrap: {
      type: Boolean,
      default: false,
    },
    giftMessage: String,
    returnReason: String,
    returnStatus: {
      type: String,
      enum: ['not_initiated', 'initiated', 'approved', 'shipped', 'received', 'rejected'],
      default: 'not_initiated',
    },
    returnTrackingNumber: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
    },
    notes: String,
    invoiceUrl: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
