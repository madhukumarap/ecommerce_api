const { validationResult } = require('express-validator');
const { Cart, CartItem, Product } = require('../models');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'imageUrl', 'stock']
        }]
      }]
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const totalAmount = cart.items.reduce((total, item) => {
      return total + (item.priceAtAddition * item.quantity);
    }, 0);

    res.json({
      cart: {
        ...cart.toJSON(),
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock available' 
      });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId }
    });

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity += parseInt(quantity);
      await cartItem.save();
    } else {
      // Add new item with current price
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: parseInt(quantity),
        priceAtAddition: product.price
      });
    }

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'imageUrl', 'stock']
        }]
      }]
    });

    res.status(201).json({
      message: 'Product added to cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while adding to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await CartItem.findByPk(itemId, {
      include: [{
        model: Cart,
        as: 'cart',
        where: { userId: req.user.id }
      }, {
        model: Product,
        as: 'product'
      }]
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock available' 
      });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.json({
      message: 'Cart item updated successfully',
      cartItem
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error while updating cart item' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await CartItem.findByPk(itemId, {
      include: [{
        model: Cart,
        as: 'cart',
        where: { userId: req.user.id }
      }]
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.destroy();

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while removing from cart' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while clearing cart' });
  }
};