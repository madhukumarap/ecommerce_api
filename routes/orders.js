const express = require('express');
const { param } = require('express-validator');
const { 
  createOrder, 
  getOrders, 
  getOrderById 
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const idValidation = [
  param('id').isUUID()
];

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', idValidation, getOrderById);

module.exports = router;