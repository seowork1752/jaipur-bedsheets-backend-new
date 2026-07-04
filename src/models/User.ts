import mongoose, { Schema, Document } from 'mongoose';

interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string;
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
  createdAt: Date;
}

interface ISocialLogin {
  provider: 'google' | 'facebook';
  providerId: string;
  email?: string;
}

export interface IUser extends Document {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password?: string;
  avatar?: string;
  
  addresses: IAddress[];
  defaultShippingAddress?: mongoose.Types.ObjectId;
  defaultBillingAddress?: mongoose.Types.ObjectId;
  
  wishlist: mongoose.Types.ObjectId[];
  savedCards: Array<{
    _id: mongoose.Types.ObjectId;
    cardToken: string;
    last4: string;
    brand: string;
    isDefault: boolean;
  }>;
  
  loyaltyPoints: number;
  referralCode: string;
  referrals: mongoose.Types.ObjectId[];
  
  socialLogins: ISocialLogin[];
  
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  
  preferences: {
    newsletter: boolean;
    sms: boolean;
    pushNotifications: boolean;
    language: 'en' | 'hi';
  };
  
  role: 'customer' | 'admin' | 'manager' | 'support';
  permissions: string[];
  
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted';
  
  lastLogin?: Date;
  lastActive?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: String,
    avatar: String,
    
    addresses: [
      {
        label: String,
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
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    defaultShippingAddress: {
      type: Schema.Types.ObjectId,
    },
    defaultBillingAddress: {
      type: Schema.Types.ObjectId,
    },
    
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    
    savedCards: [
      {
        cardToken: String,
        last4: String,
        brand: String,
        isDefault: Boolean,
      },
    ],
    
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    referralCode: {
      type: String,
      unique: true,
    },
    
    referrals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    
    socialLogins: [
      {
        provider: {
          type: String,
          enum: ['google', 'facebook'],
        },
        providerId: String,
        email: String,
      },
    ],
    
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en',
      },
    },
    
    role: {
      type: String,
      enum: ['customer', 'admin', 'manager', 'support'],
      default: 'customer',
      index: true,
    },
    
    permissions: [String],
    
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'blacklisted'],
      default: 'active',
      index: true,
    },
    
    lastLogin: Date,
    lastActive: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default mongoose.model<IUser>('User', userSchema);
