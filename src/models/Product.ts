import mongoose, { Schema, Document } from 'mongoose';

interface IProductImage {
  front: string;
  back: string;
  folded: string;
  closeup: string;
  bedroom: string;
  gallery: string[];
}

interface IProductVariant {
  size: string;
  color: string;
  fabric: string;
  sku: string;
  stock: number;
  price: number;
  discountPrice?: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface IProductReview {
  userId: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: mongoose.Types.ObjectId;
  subcategory: string;
  productCollection: string;
  price: number;
  discountPrice?: number;
  discount: number;
  images: IProductImage;
  variants: IProductVariant[];
  specifications: {
    fabric: string;
    weave: string;
    thread_count: number;
    gsm: number;
    washcare: string[];
    care_instructions: string;
    dimensions: string;
    weight: string;
  };
  tags: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    canonicalUrl: string;
    schema: object;
  };
  reviews: IProductReview[];
  avgRating: number;
  totalReviews: number;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  bestseller: boolean;
  new: boolean;
  trending: boolean;
  video?: string;
  relatedProducts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: String,
    productCollection: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: {
      front: String,
      back: String,
      folded: String,
      closeup: String,
      bedroom: String,
      gallery: [String],
    },
    variants: [
      {
        size: String,
        color: String,
        fabric: String,
        sku: {
          type: String,
          unique: true,
        },
        stock: Number,
        price: Number,
        discountPrice: Number,
        weight: Number,
        dimensions: {
          length: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    specifications: {
      fabric: String,
      weave: String,
      thread_count: Number,
      gsm: Number,
      washcare: [String],
      care_instructions: String,
      dimensions: String,
      weight: String,
    },
    tags: [String],
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      canonicalUrl: String,
      schema: mongoose.Schema.Types.Mixed,
    },
    reviews: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        title: String,
        comment: String,
        verified: Boolean,
        helpful: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    new: {
      type: Boolean,
      default: false,
      index: true,
    },
    trending: {
      type: Boolean,
      default: false,
      index: true,
    },
    video: String,
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ bestseller: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
