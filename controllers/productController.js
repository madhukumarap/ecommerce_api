const { validationResult } = require('express-validator');
const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/cloudinary'); // FIXED PATH

exports.createProduct = async (req, res) => {
  try {
    console.log('=== PRODUCT CREATION STARTED ===');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, stock, categoryId } = req.body;
    console.log('Request body:', req.body);
    
    console.log('Checking category with ID:', categoryId);
    const category = await Category.findByPk(categoryId);
    console.log('Category found:', category ? category.name : 'NOT FOUND');
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let imageUrl = null;
    if (req.file) {
      console.log('File received, uploading to Cloudinary');
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
      console.log('Image uploaded:', imageUrl);
    } else {
      console.log('No file uploaded');
    }

    console.log('Creating product in database...');
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      imageUrl
    });
    console.log('Product created with ID:', product.id);

    console.log('Fetching product with category details...');
    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    console.log('Sending success response');
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: productWithCategory
    });
    console.log('=== PRODUCT CREATION COMPLETED ===');

  } catch (error) {
    console.error('ERROR in createProduct:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while creating product',
      details: error.message 
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search
    } = req.query;

    const where = {};
    const include = [{ model: Category, as: 'category' }];

    // Category filter
    if (category) {
      const categoryObj = await Category.findOne({ where: { name: category } });
      if (categoryObj) {
        where.categoryId = categoryObj.id;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.$gte = parseFloat(minPrice);
      if (maxPrice) where.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };  // ✅ note the brackets
    }


    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalProducts: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching products' 
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    res.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching product' 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    let imageUrl = product.imageUrl;
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (product.imageUrl) {
        const publicId = product.imageUrl.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`ecommerce/${publicId}`);
      }
      
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price ? parseFloat(price) : product.price,
      stock: stock ? parseInt(stock) : product.stock,
      categoryId: categoryId || product.categoryId,
      imageUrl
    });

    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while updating product' 
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Delete image from Cloudinary if exists
    if (product.imageUrl) {
      const publicId = product.imageUrl.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`ecommerce/${publicId}`);
    }

    await product.destroy();

    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while deleting product' 
    });
  }
};