import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
  getFeaturedProducts,
  getBestSellers,
  addReview,
} from '../controllers/productController';
import { protectRoute, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellers);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Protected routes
router.post('/:productId/review', protectRoute, addReview);

// Admin routes
router.post('/', adminOnly, createProduct);
router.put('/:id', adminOnly, updateProduct);
router.delete('/:id', adminOnly, deleteProduct);
router.post('/bulk/upload', adminOnly, bulkUploadProducts);

export default router;
