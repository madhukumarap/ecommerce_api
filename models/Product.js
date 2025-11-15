// Product Model - Defines products available in the e-commerce store
module.exports = (sequelize, DataTypes) => {
  // Define the Product model with its attributes
  const Product = sequelize.define('Product', {
    // Unique identifier - UUID primary key
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Product name
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Optional product description
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Product price - must be non-negative
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    // Available inventory quantity - must be non-negative
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    // URL to product image
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Foreign key reference to Category
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    // Table configuration
    tableName: 'products',
    timestamps: true
  });

  // Define associations with other models
  Product.associate = function(models) {
    // A product belongs to a category
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    // A product can appear in many shopping carts
    Product.hasMany(models.CartItem, {
      foreignKey: 'productId',
      as: 'cartItems'
    });
    // A product can appear in many orders
    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });
  };

  return Product;
};