import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ status: 'active' })
      .sort({ order: 1 })
      .lean();

    return sendSuccess(res, 'Categories fetched', categories);
  } catch (error: any) {
    return sendError(res, 'Error fetching categories', 500, error);
  }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, status: 'active' });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, 'Category fetched', category);
  } catch (error: any) {
    return sendError(res, 'Error fetching category', 500, error);
  }
};

// Create category (Admin)
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, image, banner, seo } = req.body;

    if (!name || !slug) {
      return sendError(res, 'Name and slug are required', 400);
    }

    // Check if slug exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return sendError(res, 'Category with this slug already exists', 400);
    }

    const category = new Category({
      name,
      slug,
      description,
      image,
      banner,
      status: 'active',
      seo: seo || {
        metaTitle: name,
        metaDescription: description,
        metaKeywords: [name],
      },
    });

    await category.save();

    return sendSuccess(res, 'Category created', category, 201);
  } catch (error: any) {
    return sendError(res, 'Error creating category', 500, error);
  }
};

// Update category (Admin)
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, 'Category updated', category);
  } catch (error: any) {
    return sendError(res, 'Error updating category', 500, error);
  }
};

// Delete category (Admin)
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, 'Category deleted', { deletedId: id });
  } catch (error: any) {
    return sendError(res, 'Error deleting category', 500, error);
  }
};
