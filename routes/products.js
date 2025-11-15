const express = require('express');
const { body, param } = require('express-validator');
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const productValidation = [
  body('name').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('categoryId').isUUID()
];

const idValidation = [
  param('id').isUUID()
];

// Public routes
router.get('/', getProducts);
router.get('/:id', idValidation, getProductById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  productValidation,
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  idValidation,
  productValidation,
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  idValidation,
  deleteProduct
);

module.exports = router;