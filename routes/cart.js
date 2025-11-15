const express = require('express');
const { body, param } = require('express-validator');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const cartItemValidation = [
  body('productId').isUUID(),
  body('quantity').isInt({ min: 1 })
];

const itemIdValidation = [
  param('itemId').isUUID()
];

router.use(authenticate);

router.get('/', getCart);
router.post('/add', cartItemValidation, addToCart);
router.put('/item/:itemId', itemIdValidation, cartItemValidation, updateCartItem);
router.delete('/item/:itemId', itemIdValidation, removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;