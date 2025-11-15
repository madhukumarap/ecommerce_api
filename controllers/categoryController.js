const { validationResult } = require('express-validator');
const { Category, Product } = require('../models');

exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    console.log('Creating category with name:', name);
    
    const existingCategory = await Category.findOne({ where: { name } });
    console.log('Existing category check:', existingCategory);
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name,
      description
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error while creating category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    console.log('Fetching all categories');
    
    // Fix: Use proper Sequelize query
    const categories = await Category.findAll({
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'imageUrl', 'stock']
      }],
      order: [['createdAt', 'DESC']] // Optional: order by creation date
    });
    
    console.log('Categories fetched count:', categories.length);
    console.log('Categories data:', JSON.stringify(categories, null, 2));
    
    // Fix: Consistent response structure
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      count: categories.length,
      data: categories
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching categories',
      message: error.message 
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching category by ID:', id);

    const category = await Category.findByPk(id, {
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'imageUrl', 'stock']
      }]
    });

    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Category not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching category' 
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    await category.update({
      name: name || category.name,
      description: description || category.description
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while updating category' 
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Category not found' 
      });
    }

    // Check if category has products
    const productsCount = await Product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete category with associated products' 
      });
    }

    await category.destroy();

    res.json({ 
      success: true,
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while deleting category' 
    });
  }
};