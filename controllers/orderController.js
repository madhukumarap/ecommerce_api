const { validationResult } = require('express-validator');
const { Order, OrderItem, Cart, CartItem, Product } = require('../models');

exports.createOrder = async (req, res) => {
  const transaction = await Order.sequelize.transaction();
  
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }],
      transaction
    });

    if (!cart || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock availability and calculate total
    let totalAmount = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.product.name}` 
        });
      }
      totalAmount += item.priceAtAddition * item.quantity;
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      status: 'pending'
    }, { transaction });

    // Create order items and update product stock
    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.priceAtAddition,
        productName: item.product.name
      }, { transaction });

      // Update product stock
      await Product.update(
        { stock: item.product.stock - item.quantity },
        { where: { id: item.productId }, transaction }
      );
    }

    // Clear cart
    await CartItem.destroy({ 
      where: { cartId: cart.id },
      transaction 
    });

    await transaction.commit();

    const orderWithItems = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: orderWithItems
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Server error while creating order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalOrders: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching order' });
  }
};