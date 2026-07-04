import { Request, Response } from 'express';
import Product from '../models/Product';
import { sendSuccess, sendError, sendPaginatedResponse, ApiError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Get all products with filtering, sorting, and pagination
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      sort = '-createdAt',
      category,
      collection,
      minPrice,
      maxPrice,
      search,
      status = 'active',
      featured,
      bestseller,
      trending,
      new: isNew,
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const sortStr = String(sort || '-createdAt');

    // Build filter object
    const filter: any = { status };

    if (category) filter.category = category;
    if (collection) filter.productCollection = collection;
    if (featured === 'true') filter.featured = true;
    if (bestseller === 'true') filter.bestseller = true;
    if (trending === 'true') filter.trending = true;
    if (isNew === 'true') filter.new = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice as string);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice as string);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sortStr)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('category', 'name slug')
      .lean();

    const total = await Product.countDocuments(filter);

    return sendPaginatedResponse(
      res,
      'Products fetched successfully',
      products,
      total,
      pageNum,
      limitNum
    );
  } catch (error: any) {
    return sendError(res, 'Error fetching products', 500, error);
  }
};

// Get single product by slug
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, status: 'active' })
      .populate('category', 'name slug')
      .populate('relatedProducts', 'name slug images.front price discountPrice');

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Increment view count
    await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });

    return sendSuccess(res, 'Product fetched successfully', product);
  } catch (error: any) {
    return sendError(res, 'Error fetching product', 500, error);
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('relatedProducts', 'name slug images.front price discountPrice');

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, 'Product fetched successfully', product);
  } catch (error: any) {
    return sendError(res, 'Error fetching product', 500, error);
  }
};

// Create product (Admin)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      category,
      collection,
      price,
      discountPrice,
      stock,
      images,
      variants,
      specifications,
      tags,
      seo,
    } = req.body;

    // Validation
    if (!name || !slug || !category || !price || stock === undefined) {
      return sendError(res, 'Missing required fields', 400);
    }

    // Check if product exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return sendError(res, 'Product with this slug already exists', 400);
    }

    const product = new Product({
      name,
      slug,
      description,
      shortDescription,
      category,
      collection,
      price,
      discountPrice: discountPrice || price,
      stock,
      images,
      variants: variants || [],
      specifications,
      tags,
      seo,
      status: 'active',
    });

    await product.save();
    await product.populate('category', 'name slug');

    return sendSuccess(res, 'Product created successfully', product, 201);
  } catch (error: any) {
    return sendError(res, 'Error creating product', 500, error);
  }
};

// Update product (Admin)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, 'Product updated successfully', product);
  } catch (error: any) {
    return sendError(res, 'Error updating product', 500, error);
  }
};

// Delete product (Admin)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, 'Product deleted successfully', { deletedId: id });
  } catch (error: any) {
    return sendError(res, 'Error deleting product', 500, error);
  }
};

// Bulk upload products (Admin)
export const bulkUploadProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return sendError(res, 'Invalid products array', 400);
    }

    const insertedProducts = await Product.insertMany(products);

    return sendSuccess(
      res,
      `${insertedProducts.length} products uploaded successfully`,
      { count: insertedProducts.length }
    );
  } catch (error: any) {
    return sendError(res, 'Error bulk uploading products', 500, error);
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await Product.find({ featured: true, status: 'active' })
      .limit(limit)
      .select('name slug images.front price discountPrice images.front');

    return sendSuccess(res, 'Featured products fetched', products);
  } catch (error: any) {
    return sendError(res, 'Error fetching featured products', 500, error);
  }
};

// Get best sellers
export const getBestSellers = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await Product.find({ bestseller: true, status: 'active' })
      .limit(limit)
      .select('name slug images.front price discountPrice totalReviews avgRating');

    return sendSuccess(res, 'Best sellers fetched', products);
  } catch (error: any) {
    return sendError(res, 'Error fetching best sellers', 500, error);
  }
};

// Add review to product
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Add review
    product.reviews.push({
      userId: req.userId as any,
      rating,
      title,
      comment,
      verified: true,
      helpful: 0,
      createdAt: new Date(),
    });

    // Update average rating
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.avgRating = totalRating / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();

    return sendSuccess(res, 'Review added successfully', product);
  } catch (error: any) {
    return sendError(res, 'Error adding review', 500, error);
  }
};
