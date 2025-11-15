const express = require('express');
const { body, param } = require('express-validator');
const { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const categoryValidation = [
  body('name').notEmpty().trim(),
  body('description').optional().trim()
];

const idValidation = [
  param('id').isUUID()
];

// Public routes
router.get('/', getCategories);
router.get('/:id', idValidation, getCategoryById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  categoryValidation,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  idValidation,
  categoryValidation,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  idValidation,
  deleteCategory
);

module.exports = router;